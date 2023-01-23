import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/solid'
import { Modal } from '@openware/react-opendax/build'
import classnames from 'classnames'
import { Asset } from 'configs/assets'
import { Chain } from 'configs/chains'
import { DEFAULT_ASSET_LOGO_URI } from 'configs/constants'
import { ethers } from 'ethers'
import { getLocalAssets } from 'helpers/getAvailableAssets'
import { useContract } from 'hooks'
import React, { FC, useEffect, useMemo, useState } from 'react'
import ERC20ABI from '../../contracts/erc20.abi.json'

export type AddAssetProps = {
    open: boolean
    onClose: () => void
    onConfirm: (asset: Asset) => void
    chain: Chain
    ownerAddress: string
}

export const AddAssetModal: FC<AddAssetProps> = ({
    open,
    onClose,
    onConfirm,
    chain,
    ownerAddress,
}: AddAssetProps) => {
    const [address, setAddress] = useState<string>('')
    const [values, setValues] = useState<{ [key: string]: any }>({})
    const [error, setError] = useState<Error>()
    const [valid, setValid] = useState<boolean>(false)
    const [duplicate, setDuplicate] = useState<boolean>(false)
    const [loading, setLoading] = useState<boolean>(false)

    const abi = useMemo(() => {
        return ERC20ABI.filter(
            (item) =>
                (item.type === 'function' && item.inputs?.length === 0) ||
                item.name === 'balanceOf',
        )
    }, [])

    const provider = useMemo(() => {
        const url = chain?.rpc[0]
        return new ethers.providers.JsonRpcProvider(url)
    }, [chain])

    const contract = useContract(address, abi, provider)

    useEffect(() => {
        setValues({})
        setError(undefined)

        if (!address || !contract) return
        ;(async () => {
            setLoading(true)
            const updatedValues: { [key: string]: any } = {}
            await contract?.deployed()
            abi.filter((item) => !!item.name).map(async (item) => {
                const inputs = (item.inputs ?? [])
                    .map((input) => {
                        if (input.name === '_owner') return ownerAddress
                    })
                    .filter(Boolean)

                let value = ''
                if (inputs.length === (item.inputs ?? []).length) {
                    const result = await contract?.functions[
                        item.name as string
                    ](...inputs)
                    value = result[0].toString()
                }
                updatedValues[item.name as string] = value
                setValues({ ...updatedValues })
            })
            setLoading(false)
        })().catch((error) => {
            console.error(error)
            setError(error)
            setLoading(false)
        })
    }, [contract, ownerAddress, abi, address])

    useEffect(() => {
        open && setAddress('')
    }, [open])

    useEffect(() => {
        if (!!values.symbol) {
            const existingAddress = getLocalAssets().find(
                (a) => a.address === address,
            )

            if (!!existingAddress) {
                setValid(false)
                setDuplicate(true)
                return
            } else {
                setValid(true)
                setDuplicate(false)
                return
            }
        }
        setValid(false)
    }, [values, address])

    const body = useMemo(
        () => (
            <div style={{ width: '448px' }} className="mt-2">
                <div className="my-1">
                    Please enter your asset contract address.
                </div>
                <input
                    type="text"
                    name="email"
                    id="address"
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="0x01547ef97f9140dbdf5ae50f06b77337b95cf4bb"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                />
                {loading && (
                    <div className="flex justify-center mt-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-4 border-blue-500"></div>
                    </div>
                )}
                {error && (
                    <div className="py-3">
                        <div className="rounded-md bg-red-50 p-4">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <XCircleIcon
                                        className="h-5 w-5 text-red-400"
                                        aria-hidden="true"
                                    />
                                </div>
                                <div className="ml-3">
                                    <div className="text-sm text-red-700">
                                        {error
                                            .toString()
                                            .substring(
                                                0,
                                                error.toString().indexOf('('),
                                            )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {values.symbol && valid ? (
                    <div className="py-3">
                        <div className="rounded-md bg-green-50 p-4">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <CheckCircleIcon
                                        className="h-5 w-5 text-green-400"
                                        aria-hidden="true"
                                    />
                                </div>
                                <div className="ml-3">
                                    <div className="flex items-center text-sm text-green-700">
                                        <img
                                            src={DEFAULT_ASSET_LOGO_URI}
                                            alt=""
                                            className="flex-shrink-0 h-6 w-6 rounded-full mr-2"
                                        />
                                        {values.symbol &&
                                            `Asset found: ${values.name} (${values.symbol})`}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : values.symbol && duplicate ? (
                    <div className="py-3">
                        <div className="rounded-md bg-yellow-50 p-4">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <CheckCircleIcon
                                        className="h-5 w-5 text-yellow-400"
                                        aria-hidden="true"
                                    />
                                </div>
                                <div className="ml-3">
                                    <div className="text-sm text-yellow-700">
                                        This asset address has already been
                                        added
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : null}
            </div>
        ),
        [address, error, values, valid, duplicate],
    )

    const cnConfirm = classnames(
        'ml-4 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700',
        { 'opacity-50 cursor-not-allowed': !valid },
    )

    return (
        <Modal
            label="Add Asset"
            modalbody={body}
            onClose={onClose}
            onClick={() =>
                valid &&
                onConfirm({
                    symbol: values.symbol,
                    address: ethers.utils.getAddress(address),
                })
            }
            classNameCloseButton="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            classNameConfirmButton={cnConfirm}
            classNameBackground="bg-gray-500 bg-opacity-75 fixed inset-0 transition-opacity"
        />
    )
}
