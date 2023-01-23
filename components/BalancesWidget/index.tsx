import {
    Balances,
    Spinner,
    TradingItem,
} from '@openware/react-opendax/build'
import { useAppDispatch, useAppSelector } from 'app/hooks'
import { CryptoIcon } from 'components/CryptoIcon'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import Config from 'configs/app'
import { toggleDepositModal, toggleWithdrawModal } from 'features/globalSettings/globalSettings'
import { useCallback, useEffect } from 'react'
import { REQUEST_CODE, useWebSocketContext } from 'websockets/WebSockets'
import { useWallets } from 'hooks/useWallets'
import { ConnectorWalletModal } from 'components'

export const BalancesWidget: React.FC = () => {
    const dispatch = useAppDispatch()
    const intl = useIntl()
    const postMessage = useWebSocketContext()
    
    const [isWalletConnectModalOpen, setIsWalletConnectModalOpen] = useState<boolean>(false)

    const user = useAppSelector((state) => state.user.user)
    const wallets = useAppSelector(state => state.wallets.wallets)
    const currencies = useAppSelector(state => state.currencies.list)
    const loading = useAppSelector(state => state.wallets.loading)
    const tickers = useAppSelector(state => state.tickers.tickers)
    const markets = useAppSelector(state => state.markets.markets)
    
    useWallets()

    useEffect(() => {
        postMessage([REQUEST_CODE, 16, 'get_currencies', []])
    }, [])

    const translate = React.useCallback(
        (id: string) => intl.formatMessage({ id }),
        [],
    )

    const handleClickDeposit = useCallback((symbol: string) => {
        dispatch(toggleDepositModal({ isOpen: true, asset: symbol }))
    }, [])

    const handleClickWithdraw = useCallback((symbol: string) => {
        dispatch(toggleWithdrawModal({ isOpen: true, asset: symbol }))
    }, [])

    const renderBalances = React.useMemo(() => {
        if (loading) {
            return <Spinner />
        }

        return (
            <Balances
                wallets={wallets}
                tickers={tickers}
                markets={markets}
                currencies={currencies}
                platformCurrency={Config.platformCurrency}
                estimateSymbol={Config.platformCurrencySymbol}
                customHeaderIcon={CryptoIcon}
                onClickDeposit={handleClickDeposit}
                onClickWithdraw={handleClickWithdraw}
            />
        )
    }, [wallets, tickers, markets, currencies, loading])

    const renderConnectWalletModal = React.useMemo(() => {
        return (
            <>
                <div className="h-full flex items-center justify-center">
                    <div className="font-medium	cursor-pointer text-primary-cta-color-main hover:text-primary-cta-color-hover" onClick={() => setIsWalletConnectModalOpen(true)}>{translate('metamask.connect.wallet')}</div>
                </div>
                {/* TODO: move to the Layout */}
                <ConnectorWalletModal showModal={isWalletConnectModalOpen} handleModal={setIsWalletConnectModalOpen}/>
            </>
        );
    }, [user, isWalletConnectModalOpen]);

    return (
        <div className="h-full shadow rounded-md">
            <TradingItem
                title={translate('page.body.trade.header.balances').toUpperCase()}
                mainClassName="flex flex-col border rounded-md shadow m-0 w-full h-full overflow-auto"
                contentClassName="w-full h-full min-w-max border-t border-gray-200 overflow-auto"
            >
                {user?.id ? renderBalances : renderConnectWalletModal}
            </TradingItem>
        </div>
    )
}
