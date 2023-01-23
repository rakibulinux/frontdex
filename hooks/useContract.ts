import { ethers } from 'ethers'
import { useMemo } from 'react'

export function useContract<T extends ethers.Contract>(
  address: string | undefined,
  abi: ethers.ContractInterface,
  signerOrProvider?: ethers.Signer | ethers.providers.Provider | undefined,
): T | null {
  return useMemo(() => {
    if (typeof address === 'undefined' || address.length != 42) return null //TODO: to be improved check valid address format
    return new ethers.Contract(address, abi, signerOrProvider) as T
  }, [address, abi, signerOrProvider])
}
