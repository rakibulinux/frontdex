import { ethers } from 'ethers';
import axios from 'axios';
import type { AxiosInstance, AxiosResponse } from 'axios';
import ABI from '../contracts/simpleVault.abi.json';

export const WithdrawalType = ethers.utils.id('CUSTODY_WITHDRAW_TYPE')
export const WithdrawalTimeout = (4 * 60 * 60 * 1000) // 4 hrs

export type Domain = {
  name: string;
  version: string;
  chainId: string;
  verifyingContract: string;
}

export type Types = {
  [key: string]: { name: string, type: string }[]
}

export type TypedDataV4 = {
  domain: Domain,
  message: any,
  primaryType: string,
  types: Types,
}

export function typedDataAPIKey (domain: Domain, url: string): TypedDataV4 {
  return {
    domain: {
      name: domain.name,
      version: domain.version,
      chainId: domain.chainId,
      verifyingContract: domain.verifyingContract,
    },
    types: {
      EIP712Domain: [
        { name: 'name', type: 'string' },
        { name: 'version', type: 'string' },
        { name: 'chainId', type: 'uint256' },
        { name: 'verifyingContract', type: 'address' },
      ],
      SignIn: [
        { name: 'action', type: 'string' },
        { name: 'onlySignOn', type: 'string' },
      ],
    },
    primaryType: 'SignIn',
    message: {
      action: 'api-key',
      onlySignOn: url,
    },
  }
}

export function singInTypedDataMetamask (account: string, data: TypedDataV4) {
  const rpcMethod = 'eth_signTypedData_v3'
  const rpcData = JSON.stringify(data)

  return window.ethereum.request({
    method: rpcMethod,
    params: [account, rpcData],
  })
}

export function generateWithdrawPayload({
  rid,
  expire,
  destination,
  assets,
}: any) {
  return {
    data: { rid, expire, destination, assets },
    payload: ethers.utils.defaultAbiCoder.encode(
      ['bytes32', 'uint64', 'address', 'tuple(address, uint256)[]'],
      [rid, Math.floor(expire / 1000), destination, assets]
    ),
  }
}

export async function generateSignature (broker: ethers.Signer, action: string, payload: any) {
  const message = ethers.utils.solidityKeccak256(
    ['bytes32', 'bytes'],
    [action, payload]
  )
  return broker.signMessage(ethers.utils.arrayify(message))
}

export type WithdrawData = {
  destination: string,
  assets: { asset: string, amount: any }[],
}

export type WithdrawRequest = {
  rid: string;
  expire: number;
  signature: string;
}

export class Custody {
  public contract: ethers.Contract;
  public apiKey: string;
  private _signer: ethers.Signer;
  private _axios: AxiosInstance;

  constructor (contractAddress: string, signer: ethers.Signer, apiKey?: string, finexServiceUrl?: string) {
    this._signer = signer
    this.contract = new ethers.Contract(
      contractAddress,
      ABI,
      signer,
    )
    this._axios = axios.create({
      baseURL: finexServiceUrl ?? '',
      timeout: 60000,
      headers: {
        'x-custody-api-key': apiKey!
      }
    })
    this.apiKey = apiKey!
  }

  setAPIKey (key: string) {
    this.apiKey = key
    this._axios.defaults.headers!['x-custody-api-key'] = this.apiKey
  }

  async withdraw (data: WithdrawData) {
    const parsedData: WithdrawData = {
      ...data,
      assets: data.assets.map(a => ({
        ...a,
        asset: a.asset && a.asset.length ? a.asset : ethers.constants.AddressZero,
      }))
    }
    const {
      data: {
        rid,
        expire,
        signature
      }
    } = await this._axios.post<WithdrawData, AxiosResponse<WithdrawRequest>>(
      '/api/custody/withdraw',
      parsedData,
    )
    console.log({ apiKey: this.apiKey, parsedData }, {
      rid,
      expire,
      signature
    })
    const { payload, data: sd } = generateWithdrawPayload({
      rid,
      expire,
      destination: parsedData.destination,
      assets: parsedData.assets.map(a => [
        a.asset && a.asset.length ? a.asset : ethers.constants.AddressZero,
        ethers.BigNumber.from(a.amount),
      ])
    })
    
    const nativeCurrencyAmount = parsedData.assets.reduce((sum, a) => a.asset === ethers.constants.AddressZero ? sum.add(a.amount) : sum, ethers.BigNumber.from('0'))
    console.log({
      sd,
      nativeCurrencyAmount,
      payload,
      signature,
    })
    return this.contract.withdraw(payload, signature, { value: nativeCurrencyAmount })
  }

  async depositToken (amount: ethers.BigNumber | Number, tokenContract: ethers.Contract) {
    return this.contract
      .connect(this._signer)
      .deposit(tokenContract.address, amount)
  }

  async depositETH (amount: ethers.BigNumber | Number) {
    return (
      await this.contract
        .connect(this._signer)
        .deposit(ethers.constants.AddressZero, amount, { value: amount })
    )
  }

  async approve(
    tokenContract: ethers.Contract,
    amount: ethers.BigNumber | Number,
  ) {
    return tokenContract.connect(this._signer).approve(this.contract.address, amount)
  }

  async getDeposited(
    id?: ethers.BigNumber | Number | null,
    address?: string | null,
    assetAddress?: string | null,
    amount?: ethers.BigNumber | Number | null,
  ) {
    return this.contract.queryFilter(this.contract.filters.Deposited(id, address, assetAddress, amount))
  }

  async getWithdrawn(
    id?: ethers.BigNumber | Number | null,
    address?: string | null,
    assetAddress?: string | null,
    amount?: ethers.BigNumber | Number | null,
  ) {
    return this.contract.queryFilter(this.contract.filters.Withdrawn(id, address, assetAddress, amount))
  }

  async getBalances(): Promise<{
    [address: string]: {
      available: ethers.BigNumber
      balances: ethers.BigNumber
      locked: ethers.BigNumber
      pnl: ethers.BigNumber
    }
  }> {
    const { data: balances } = await this._axios.get<never, AxiosResponse<any>>('/api/custody/balances')
    return convertObjectPropToBigNumber(balances, ['available', 'balances', 'locked', 'pnl'])
  }

  async getOpenOrders(): Promise<{
    side: 'buy' | 'sell'
    base: string
    quote: string
    amount: ethers.BigNumber
    price: string
    id: any
    ts: number
  }[]> {
    const { data: orders } = await this._axios.get<never, AxiosResponse<any>>('/api/custody/open_orders')
    return convertArrayPropToBigNumber(orders, ['amount'])
  }

  async createOrder({
    side,
    base,
    quote,
    amount,
    price,
  }: {
    side: 'buy' | 'sell'
    base: string
    quote: string
    amount: ethers.BigNumber
    price: string
  }): Promise<{
    id: any
    ts: number
  }> {
    const { data: result } = await this._axios.post<any, AxiosResponse<any>>('/api/custody/create_order', {
      side,
      base,
      quote,
      amount: amount.toString(),
      price,
    })
    return result
  }

  async cancelOrder(id: any): Promise<{id: any}[]> {
    const { data: result } = await this._axios.post<any, AxiosResponse<any>>('/api/custody/cancel_order', { id })
    return result
  }

  async executeOrder(id: any): Promise<{id: any}[]> {
    const { data: result } = await this._axios.post<any, AxiosResponse<any>>('/api/custody/execute_order', { id })
    return result
  }
}

function convertObjectPropToBigNumber (obj: any, props: string[]) {
  return Object.keys(obj).reduce((sum, k) => {
    sum[k] = createProxyBalancesObject({}) as any
    for (const prop of props) {
      sum[k][prop] = ethers.BigNumber.from(obj[k][prop])
    }
    return sum
  }, {} as any)
}

function convertArrayPropToBigNumber (arr: any[], props: string[]) {
  return arr.map(sum => {
    for (const prop of props) {
      sum[prop] = ethers.BigNumber.from(sum[prop])
    }
    return sum
  }, {} as any)
}

function createProxyBalancesObject (obj: any) {
  return new Proxy(obj, {
    get(target: { [address: string]: ethers.BigNumber }, key: string) {
      return key in target ? target[key] : ethers.BigNumber.from(0)
    }
  })
}
