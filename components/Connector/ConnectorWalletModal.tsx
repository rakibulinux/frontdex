import { useDApp } from 'hooks'
import type { ProviderWhitelist } from 'hooks/useDApp'
import React, { FC, useCallback } from 'react'
import { WalletModal } from '../WalletModal'

type ConnectorWalletModalProps = {
    showModal: boolean;
    handleModal: (value: boolean) => void;
}

export const ConnectorWalletModal: FC<ConnectorWalletModalProps> = ({
    showModal,
    handleModal,
}: ConnectorWalletModalProps) => {
    const { connectWithProvider } = useDApp()

    const handleConnectWallet = useCallback(
        (provider: ProviderWhitelist) => {
            connectWithProvider(provider).catch(console.error)
            handleModal(false);
        },
        [connectWithProvider],
    )

    return (
        <>
            <WalletModal
                open={showModal}
                setOpen={handleModal}
                handleTriggerConnect={handleConnectWallet}
            />
        </>
    )
}
