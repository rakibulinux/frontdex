import { Modal } from '@openware/react-opendax/build'
import { FC, useCallback, useEffect, useState } from 'react'
import { useAuth, useWallet } from '../../hooks'

export type APIKeyProps = {
    onClose: () => void
}

export const APIKeyModal: FC<APIKeyProps> = ({ onClose }: APIKeyProps) => {
    const [modalReady, setModalReady] = useState<boolean>(false)
    const [rememberKey, setRememberKey] = useState<boolean>(true)
    const { account } = useWallet()
    const auth = useAuth()

    useEffect(() => {
        if (!account) return
        setModalReady(!auth.getStorage(true)[auth.keyPath])
    }, [account])

    const handleGenerateKey = useCallback(async () => {
        if (!modalReady) return
        await auth.signInMetaMask(rememberKey)
        onClose()
    }, [modalReady, rememberKey])
    const body = (
        <div style={{ width: '448px' }} className="mt-2">
            <div className="text-gray-900">
                Your key identifies your account and is used to communicate with
                the internal system and withdraw funds. It will save locally on
                your browser
            </div>
            <div className="py-3">
                <div className="flex flex-col">
                    <div className="relative flex items-start">
                        <div className="flex items-center h-5">
                            <input
                                id="remember_me"
                                aria-describedby="remember_me-description"
                                name="remember_me"
                                type="checkbox"
                                className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                                onChange={(e) =>
                                    setRememberKey(e.target.checked)
                                }
                                checked={rememberKey}
                            />
                        </div>
                        <div className="ml-3 text-sm">
                            <label
                                htmlFor="remember_me"
                                className="font-medium text-gray-700 select-none"
                            >
                                Remember me
                            </label>
                        </div>
                    </div>
                    <button
                        type="button"
                        className="items-center my-2 px-2.5 py-1.5 border border-transparent text-sm font-medium rounded shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                        onClick={() => handleGenerateKey()}
                    >
                        Generate Key
                    </button>
                </div>
            </div>
            <div className="text-gray-400">
                Signing is free and will not send a transaction. You can recover
                your key at any time with your wallet.
            </div>
        </div>
    )

    return modalReady ? (
        <Modal
            label="Generate Key"
            modalbody={body}
            onClose={onClose}
            classNameCloseButton="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            isConfirmPresent={false}
            classNameBackground="bg-gray-500 bg-opacity-75 fixed inset-0 transition-opacity"
        />
    ) : null
}
