import { ethers } from 'ethers'
import { useMemo } from 'react'
import { Custody } from '../libs/custody'

export function useCustody(contractAddress: string, signer: ethers.Signer, apiKey?: string, serviceUrl?: string) {
  return useMemo(() => {
    return new Custody(contractAddress, signer, apiKey, serviceUrl)
  }, [contractAddress, signer, apiKey, serviceUrl])
}
