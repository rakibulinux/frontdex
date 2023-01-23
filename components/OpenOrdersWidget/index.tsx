import { XIcon } from '@heroicons/react/outline'
import {
    Decimal,
    Spinner,
    Table,
    TradingItem,
} from '@openware/react-opendax/build'
import { useAppSelector } from 'app/hooks'
import classNames from 'classnames'
import { Market } from 'features/markets/types'
import { OrderCommon } from 'features/order/types'
import { localeDate } from 'helpers'
import React, { useState } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { REQUEST_CODE, useWebSocketContext } from 'websockets/WebSockets'
import { ConnectorWalletModal } from 'components';

export const OpenOrdersWidget: React.FC = () => {
    const [isWalletConnectModalOpen, setIsWalletConnectModalOpen] = useState<boolean>(false)

    const [checkedHideOtherPairs, setCheckedHideOtherPairs] =
        React.useState<boolean>(false)

    const intl = useIntl()
    const postMessage = useWebSocketContext()

    const user = useAppSelector((state) => state.user.user)
    const openOrdersList = useAppSelector((state) => state.openOrders.list)
    const markets: Market[] = useAppSelector((state) => state.markets.markets)
    const currentMarket = useAppSelector((state) => state.markets.currentMarket)
    const openOrdersLoading = useAppSelector(
        (state) => state.openOrders.openOrdersLoading,
    )

    const translate = React.useCallback(
        (id: string) => intl.formatMessage({ id }),
        [],
    )

    const handleClickCheckboxHideOtherPairs = React.useCallback(() => {
        setCheckedHideOtherPairs(!checkedHideOtherPairs)
    }, [checkedHideOtherPairs])

    React.useEffect(() => {
        postMessage([REQUEST_CODE, 15, 'list_orders', []])
    }, [])

    React.useEffect(() => {
        if (checkedHideOtherPairs) {
            postMessage([REQUEST_CODE, 15, 'list_orders', [currentMarket?.id]])
        } else {
            postMessage([REQUEST_CODE, 15, 'list_orders', []])
        }
    }, [checkedHideOtherPairs, currentMarket])

    const setTradeColor = React.useCallback((side: string) => {
        return classNames('capitalize', {
            'text-green-500': side === 'buy',
            'text-red-500': side === 'sell',
        })
    }, [])

    const handleCancelOrder = React.useCallback((id: number) => {
        postMessage([REQUEST_CODE, 42, 'cancel_order', ['id', id]])
    }, [])

    const handleCancelOrderAll = React.useCallback(() => {
        if (openOrdersList.length == 0) {
            return;
        }        
        if (checkedHideOtherPairs && currentMarket) {
            postMessage([
                REQUEST_CODE,
                42,
                'cancel_order',
                ['market', currentMarket.id],
            ])
        } else {
            postMessage([REQUEST_CODE, 42, 'cancel_order', ['all']])
        }
    }, [currentMarket, checkedHideOtherPairs, openOrdersList.length])

    const renderCancelAllButton = React.useMemo(() => {
        return (
            <span className={classNames("text-red-500 uppercase cursor-pointer", { "opacity-40 cursor-default": openOrdersList.length == 0 })} onClick={handleCancelOrderAll}>
                <FormattedMessage id="page.body.trade.header.openOrders.cancelAll" />
            </span>
        )
    }, [handleCancelOrderAll])

    const renderHeaders = React.useMemo(
        () => [
            translate('page.body.trade.header.openOrders.content.date'),
            translate('page.body.trade.header.openOrders.content.market'),
            translate('page.body.trade.header.openOrders.content.side'),
            translate('page.body.trade.header.openOrders.content.type'),
            translate('page.body.trade.header.openOrders.content.price'),
            translate('page.body.trade.header.openOrders.content.amount'),
            translate('page.body.trade.header.openOrders.content.total'),
            translate('page.body.trade.header.openOrders.content.filled'),
            translate('page.body.trade.header.openOrders.content.status'),
            null,
        ],
        [],
    )

    const renderData = React.useMemo(() => {
        return openOrdersList.map((item: OrderCommon) => {
            const {
                id,
                price,
                created_at,
                remaining_volume,
                origin_volume,
                side,
                ord_type,
                market,
                executed_volume,
                state,
            } = item
            const filled = ((+executed_volume / +origin_volume) * 100).toFixed(
                2,
            )
            const orderMarket = markets.find((i) => i.id === market)
            const priceFixed = orderMarket?.price_precision || 0
            const amountFixed = orderMarket?.amount_precision || 0

            return [
                <span key={`${id}-date`} className="split-lines">
                    {localeDate(+created_at, 'fullDate')}
                </span>,
                <span key={`${id}-name`} className="text-gray-500">
                    {orderMarket?.name.toUpperCase()}
                </span>,
                <span key={`${id}-side`} className={setTradeColor(side)}>
                    {translate(`page.body.history.trade.content.side.${side}`)}
                </span>,
                <span key={`${id}-type`} className="text-gray-500">
                    {ord_type
                        ? translate(
                            `page.body.trade.header.openOrders.content.type.${ord_type}`,
                        )
                        : '-'}
                </span>,
                <span key={`${id}-price`} className="text-gray-500">
                    <Decimal fixed={priceFixed} thousSep=",">
                        {price}
                    </Decimal>
                </span>,
                <span key={`${id}-amount`} className="text-gray-500">
                    <Decimal fixed={amountFixed} thousSep=",">
                        {+remaining_volume}
                    </Decimal>
                </span>,
                <span key={`${id}-total`} className="text-gray-500">
                    <Decimal fixed={amountFixed} thousSep=",">
                        {+origin_volume}
                    </Decimal>
                </span>,
                <span key={`${id}-filled`} className={setTradeColor(side)}>
                    <Decimal fixed={2} thousSep=",">
                        {+filled}
                    </Decimal>
                    %
                </span>,
                <span key={`${id}-status`}>
                    <span className="bg-green-100 capitalize py-1 px-2 rounded-xl text-green-800">
                        {translate(
                            `page.body.openOrders.content.status.${state}`,
                        )}
                    </span>
                </span>,
                <span
                    key={`${id}-cancel`}
                    className="text-red-500 cursor-pointer flex"
                    onClick={() => handleCancelOrder(id)}
                >
                    Cancel <XIcon className="h-5 w-auto" />
                </span>,
            ]
        })
    }, [markets, openOrdersList])

    const renderNoDataMessage = React.useMemo(() => {
        return (
            <div className="h-full w-full flex">
                <span className="m-auto text-sm leading-5 font-medium text-gray-500">{translate('page.body.openOrders.content.noMessageText')}</span>
            </div>
        )
    }, [])

    const renderTable = React.useMemo(() => {
        if (openOrdersLoading) {
            return <Spinner />
        }

        return (
            <Table
                isHeaderSticky={true}
                data={renderData}
                paddingTableClass="py-2"
                tableHeaderTitles={renderHeaders}
                classNames="flex flex-col fd-table w-full h-full"
                tableHeaderClassNames="bg-gray-50 z-20"
                noDataMessage={renderNoDataMessage}
                isStripedTableEnabled={true}
            />
        )
    }, [renderData, openOrdersLoading])

    const renderTitle = React.useMemo(() => {
        return (
            <div className="flex items-center text-xs my-2 mx-4 leading-4 tracking-wide font-semibold text-gray-700 left-4 sticky justify-between">
                <div className="flex">
                    <div className="relative flex uppercase mr-8">
                        <FormattedMessage id="page.body.trade.header.openOrders" />
                    </div>
                    <div className="relative flex">
                        <div className="flex items-center cursor-pointer">
                            <input
                                id="hideOtherPairs"
                                name="hideOtherPairs"
                                type="checkbox"
                                className="focus:ring-transparent h-4 w-4 rounded-md cursor-pointer"
                                checked={checkedHideOtherPairs}
                                onChange={handleClickCheckboxHideOtherPairs}
                            />
                        </div>
                        <div className="ml-3 text-sm">
                            <label
                                htmlFor="hideOtherPairs"
                                className="font-medium text-gray-500"
                            >
                                <FormattedMessage id="page.body.trade.header.openOrders.hideOtherPairs" />
                            </label>
                        </div>
                    </div>
                </div>
                <div className="flex">
                    {renderCancelAllButton}
                </div>
            </div>
        )
    }, [checkedHideOtherPairs, renderCancelAllButton])

    const renderConnectWalletModal = React.useMemo(() => {
        return (
            <>
                <div className="h-full flex items-center justify-center">
                    <div className="font-medium	cursor-pointer text-primary-cta-color-main hover:text-primary-cta-color-hover" onClick={() => setIsWalletConnectModalOpen(true)}>{translate('metamask.connect.wallet')}</div>&nbsp;{translate('metamask.connect.wallet.to.trade')}
                </div>

                {/* TODO: move to the Layout */}
                <ConnectorWalletModal showModal={isWalletConnectModalOpen} handleModal={setIsWalletConnectModalOpen}/>
            </>
        );
    }, [user, isWalletConnectModalOpen]);

    return (
        <div className="openOrders w-full h-full">
            <TradingItem
                title={renderTitle}
                mainClassName="flex flex-col border rounded-md shadow m-0 w-full h-full overflow-auto"
                contentClassName="w-full h-full min-w-max border-t border-gray-200 overflow-auto"
            >
                {user?.id !== '' ? renderTable : renderConnectWalletModal}
            </TradingItem>
        </div>
    )
}
