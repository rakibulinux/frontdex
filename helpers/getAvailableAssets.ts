import assets from "configs/assets"
import { ethers } from "ethers"
import type { Custody } from '../libs/custody'

export const getLocalAssets = () => {
    const localAssets = localStorage.getItem('localAssets')
    const customAssets = localAssets ? JSON.parse(localAssets) : []
    const mergedAssets = [...assets, ...customAssets]

    return mergedAssets
}

export const getAvailableAssets = async (custody: Custody) => {
    const balances = await custody.getBalances()

    const mergedAssets = getLocalAssets()
    const assetsWithMockBalances = mergedAssets.map((a) => {
        const address = ethers.utils.getAddress(a.address)

        return { ...a,
            balances: balances[address] ? +ethers.utils.formatEther(balances[address].available.toString()) : 0,
            locked: balances[address] ? +ethers.utils.formatEther(balances[address].locked.toString()) : 0
        }
    })

    return assetsWithMockBalances
}
