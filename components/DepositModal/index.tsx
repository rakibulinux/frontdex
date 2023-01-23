import { ExclamationIcon } from '@heroicons/react/solid'
import { DropdownItem, SelectAssetModal } from '@openware/react-opendax/build'
import { useAppSelector } from 'app/hooks'
import { default as classnames } from 'classnames'
import { AddAssetModal } from 'components/AddAssetModal'
import assets, { Asset } from 'configs/assets'
import { Chain } from 'configs/chains'
import { DEFAULT_ASSET_LOGO_URI } from 'configs/constants'
import { ethers } from 'ethers'
import { getLocalAssets } from 'helpers/getAvailableAssets'
import { useContract, useCustody, useEagerConnect, useWallet } from 'hooks'
import Link from 'next/link'
import React, { FC, useCallback, useEffect, useMemo, useState } from 'react'
import ERC20ABI from '../../contracts/erc20.abi.json'
import { decimalMax } from '../../libs/utils'

export type DepositModalProps = {
    targetChain: Chain
    chainValid?: boolean
    assetAddress?: string
    onClose: () => void
}

type Balances = {
    amount: number
    decimal: number
}

export const DepositModal: FC<DepositModalProps> = ({
    targetChain,
    chainValid,
    onClose,
    assetAddress,
}: DepositModalProps) => {
    const triedToEagerConnect = useEagerConnect()
    const { active, account, chain, signer } = useWallet()
    const [selected, setSelected] = useState(assets[0])
    const [mode, setMode] = useState<string>('deposit')
    const [amount, setAmount] = useState<string>()
    const [balances, setBalances] = useState<Balances>({
        amount: 0,
        decimal: 18,
    })
    const [availableAssets, setAvailableAssets] = useState<Asset[]>([])
    const [loading, setLoading] = useState<boolean>(false)
    const [transactionLoading, setTransactionLoading] = useState<boolean>(false)
    const [transactionError, setTransactionError] = useState<boolean>(false)
    const [valid, setValid] = useState<boolean>(false)

    const preselectedAsset = useAppSelector(state => state.globalSettings.depositAsset)

    const custody = useCustody(
        process.env.NEXT_PUBLIC_CUSTODY_CONTRACT!,
        signer!,
    )

    // Get ethers provider
    const provider = useMemo(() => {
        return active && chain
            ? {
                  decimals: chain.nativeCurrency.decimals,
                  rpc: new ethers.providers.JsonRpcProvider(chain.rpc[0]),
              }
            : null
    }, [active, chain])

    async function allowance(ownerAddress: string, tokenContract: any) {
        return tokenContract.allowance(ownerAddress, custody.contract.address)
    }

    const tokenContract = useContract(selected.address, ERC20ABI, provider!.rpc)

    useEffect(() => {
        const assetList = getLocalAssets()
        setAvailableAssets(assetList)

        let asset
        if (preselectedAsset) {
            asset = assetList.find((a: Asset) => a.symbol === preselectedAsset.toUpperCase())
        }

        asset ||= assetList.find((a: Asset) => a.address === assetAddress) || assets[0]

        setSelected(asset)
    }, [preselectedAsset])

    useEffect(() => {
        const balanceUnitAmount = ethers.utils.parseEther(
            decimalMax(balances.amount, balances.decimal),
        )
        if (!amount) return

        const newAmount = decimalMax(amount, balances.decimal)
        const amountUnitAmount = ethers.utils.parseEther(newAmount)
        setValid(
            amountUnitAmount.gt(0) && balanceUnitAmount.gte(amountUnitAmount),
        )
    }, [amount, balances])

    useEffect(() => {
        if (!account) return
        ;(async () => {
            setLoading(true)

            let balance = '0'
            if (selected.address !== ethers.constants.AddressZero) {
                if (!tokenContract) {
                    setLoading(false)
                    return
                }
                const [decimal, rawBalance] = await Promise.all([
                    tokenContract.decimals(),
                    tokenContract.balanceOf(account),
                ])
                balance = ethers.utils.formatUnits(rawBalance, decimal)
                setBalances({
                    amount: +balance,
                    decimal: decimal,
                })
            } else {
                if (!provider) {
                    setLoading(false)
                    return
                }

                const eth = await provider.rpc.getBalance(account)
                balance = ethers.utils.formatEther(eth)
                setBalances({
                    amount: +balance,
                    decimal: 18,
                })
            }

            setLoading(false)
        })().catch((error: any) => {
            console.log(error)
            setLoading(false)
        })
    }, [selected, tokenContract])

    const handleConfirmDeposit = useCallback(async () => {
        if (transactionLoading) return

        setTransactionLoading(true)

        setTransactionError(false)

        if (!amount) return
        const unitAmount = ethers.utils.parseUnits(
            decimalMax(amount),
            balances.decimal,
        )

        if (selected.address !== ethers.constants.AddressZero) {
            try {
                if (!tokenContract) {
                    setTransactionLoading(false)
                    console.log('tokenContract not found', tokenContract)
                    return
                }

                const allowed = await allowance(account!, tokenContract)
                console.log(unitAmount, allowed)
                if (unitAmount.gte(allowed)) {
                    await custody.approve(
                        tokenContract,
                        ethers.constants.MaxUint256,
                    )
                }

                const transaction = await custody.depositToken(
                    unitAmount,
                    tokenContract,
                )
                const result = await transaction.wait()
                console.log('deposit', result)
            } catch (error) {
                console.log(error)
                setTransactionError(true)
                setTransactionLoading(false)
                return
            }
        } else {
            try {
                const transaction = await custody.depositETH(unitAmount)
                const result = await transaction.wait()
                console.log('deposit', result)
            } catch (error) {
                console.log(error)
                setTransactionError(true)
                setTransactionLoading(false)
                return
            }
        }
        setTransactionLoading(false)
        onClose()
    }, [selected, amount])

    const handleConfirmAddAsset = useCallback(
        async (newAsset: any) => {
            const localAssets = localStorage.getItem('localAssets')
            const customAssets = localAssets ? JSON.parse(localAssets) : []

            customAssets.push(newAsset)
            localStorage.setItem('localAssets', JSON.stringify(customAssets))

            setAvailableAssets(getLocalAssets())
            setSelected(newAsset)
            setMode('deposit')
        },
        [availableAssets, custody],
    )

    const handleSelectAsset = useCallback((item: DropdownItem) => {
        const selectedItem = availableAssets.find((a: any) => a.address === item.id.toString()) || assets[0]
        setSelected(selectedItem)
    }, [availableAssets])

    const maxButton = useMemo(() => {
        return (
            <span className="text-blue-500 sm:text-sm hover:cursor-pointer">
                MAX
            </span>
        )
    }, [])

    const renderInvalidNetwork = useMemo(() => {
        return (
            !chainValid && (
                <div className="bg-red-100 border-l-4 border-red-400 rounded-r-md p-3 mt-5 mb-4 text-sm">
                    <div className="flex">
                        <div>
                            <ExclamationIcon className="h-6 w-6 text-red-500" />
                        </div>
                        <div className="ml-2">
                            <div>Your wallet network is incorrect.</div>
                            <div>{`Please make sure it’s set to ‘${targetChain?.name}’`}</div>
                        </div>
                    </div>
                </div>
            )
        )
    }, [chainValid, targetChain])

    const loadingContent = useMemo(() => {
        return (
            <div className="flex justify-center items-center mt-2 flex-col">
                <div className="mt-4 mb-8">
                    Follow the instructions in you Ethereum wallet
                </div>
                <div className="animate-spin rounded-full h-24 w-24 border-b-4 border-blue-500 mb-6"></div>
            </div>
        )
    }, [])

    const bottomContent = useMemo(() => {
        return (
            <React.Fragment>
                <div className="flex justify-between mt-3 text-sm font-medium text-gray-700 h-4">
                    <span>Available</span>
                    {loading ? (
                        <div className="flex justify-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-4 border-blue-500"></div>
                        </div>
                    ) : (
                        <span>
                            {ethers.utils.commify(balances.amount)}{' '}
                            {selected.symbol.toUpperCase()}
                        </span>
                    )}
                </div>
                {renderInvalidNetwork}
                <div className="flex justify-between pt-2">
                    <Link href="/history/deposit">
                        <a className="text-blue-500 text-sm">
                            See deposit history
                        </a>
                    </Link>
                    {chainValid && (
                        <div
                            className="text-blue-500 text-sm hover:cursor-pointer"
                            onClick={() => setMode('add')}
                        >
                            Can&#39;t find you assets?
                        </div>
                    )}
                </div>
                {transactionError && (
                    <div className="flex justify-center mt-2 py-2 bg-red-100 rounded">
                        <span className="text-sm text-red-500">
                            Transaction error
                        </span>
                    </div>
                )}
            </React.Fragment>
        )
    }, [
        loading,
        balances,
        selected,
        chainValid,
        targetChain,
        transactionError,
        availableAssets,
    ])

    const renderDeposit = useMemo(() => {
        const items: DropdownItem[] = availableAssets.map((a: any) => {
            return {
                id: a.address,
                name: a.symbol,
                icon: a.logoURI || DEFAULT_ASSET_LOGO_URI,
            } as DropdownItem
        })

        const selectedItem: DropdownItem = {
            id: selected.address,
            name: selected.symbol,
            icon: selected.logoURI || DEFAULT_ASSET_LOGO_URI,
        }

        const cnConfirm = classnames(
            'ml-4 inline-flex items-center px-4 py-3 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700',
            {
                hidden: transactionLoading,
                'opacity-50 cursor-not-allowed': !valid,
            },
        )

        const cnClose = classnames(
            'inline-flex items-center px-4 py-3 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50',
            {
                hidden: transactionLoading,
            },
        )

        return (
            <SelectAssetModal
                label="Deposit"
                confirmButtonLabel="Confirm deposit"
                closeButtonLabel="Cancel"
                onClose={() => (transactionLoading ? null : onClose())}
                onClick={() => valid && handleConfirmDeposit()}
                classNameCloseButton={cnClose}
                classNameConfirmButton={cnConfirm}
                classNameBackground="bg-gray-500 bg-opacity-75 fixed inset-0 transition-opacity"
                classNameFormLabel="text-lg leading-6 font-medium text-gray-900 text-center"
                isLoading={transactionLoading}
                loadingContent={loadingContent}
                assetList={items}
                selectedAsset={selectedItem}
                handleSelectAsset={handleSelectAsset}
                amount={amount || ''}
                handleAmountChange={setAmount}
                rightButtonContent={maxButton}
                handleRightButtonClick={() =>
                    setAmount(balances.amount.toString())
                }
                bottomContent={bottomContent}
            />
        )
    }, [
        selected,
        amount,
        balances,
        chainValid,
        targetChain,
        availableAssets,
        loading,
        transactionLoading,
        transactionError,
        valid,
        loadingContent,
        maxButton,
        bottomContent,
    ])

    if (!triedToEagerConnect || !active) {
        return null
    }

    return (
        <div>
            {mode === 'deposit' ? (
                renderDeposit
            ) : mode === 'add' ? (
                <AddAssetModal
                    open={mode === 'add'}
                    onClose={() => setMode('deposit')}
                    onConfirm={handleConfirmAddAsset}
                    chain={targetChain}
                    ownerAddress={account?.toString() || ''}
                />
            ) : null}
        </div>
    )
}
