import {
    CombinedOrderBook,
    Decimal,
    Spinner,
    TradingItem,
} from '@openware/react-opendax/build'
import { useAppDispatch, useAppSelector } from 'app/hooks'
import { Market } from 'features/markets/types'
import { setCurrentPrice } from 'features/order/order'
import { accumulateVolume, calculateMaxVolume } from 'helpers'
import * as React from 'react'
import { useIntl } from 'react-intl'

export const OrderBookWidget: React.FC = () => {
    const dispatch = useAppDispatch()
    const intl = useIntl()

    const asks: string[][] = useAppSelector((state) => state.orderbook.asks)
    const bids: string[][] = useAppSelector((state) => state.orderbook.bids)
    const currentMarket: Market | undefined = useAppSelector(
        (state) => state.markets.currentMarket,
    )
    const tickers = useAppSelector((state) => state.tickers.tickers)
    const lastRecentTrade = useAppSelector(
        (state) => state.recentTrades.lastTrade,
    )
    const orderbookLoading = useAppSelector(
        (state) => state.orderbook.orderbookLoading,
    )

    const translate = React.useCallback(
        (id: string) => intl.formatMessage({ id }),
        [],
    )

    const orderBookHeaders = React.useMemo(() => {
        return [
            translate('page.body.trade.orderbook.header.price'),
            translate('page.body.trade.orderbook.header.amount'),
            translate('page.body.trade.orderbook.header.volume'),
        ]
    }, [])

    const getTickerValue = React.useMemo(() => {
        const defaultTicker = {
            amount: '0',
            low: '0',
            last: '0',
            high: '0',
            volume: '0',
            open: '0',
            price_change_percent: '+0.00%',
        }

        return (currentMarket && tickers[currentMarket.id]) || defaultTicker
    }, [tickers, currentMarket])

    const renderLastPriceOrderBookNode = React.useMemo(() => {
        if (currentMarket) {
            let lastPrice = ''
            let priceChangeSign: '' | 'positive' | 'negative' = ''

            if (lastRecentTrade?.market === currentMarket.id) {
                lastPrice = lastRecentTrade.price

                if (Number(lastRecentTrade.price_change) >= 0) {
                    priceChangeSign = 'positive'
                } else if (Number(lastRecentTrade.price_change) < 0) {
                    priceChangeSign = 'negative'
                }
            } else {
                const currentTicker = currentMarket && getTickerValue
                lastPrice = currentTicker.last

                if (currentTicker.price_change_percent.includes('+')) {
                    priceChangeSign = 'positive'
                } else if (currentTicker.price_change_percent.includes('-')) {
                    priceChangeSign = 'negative'
                }
            }

            return (
                <div className="text-green-500 uppercase text-lg leading-6 font-semibold">
                    <Decimal
                        opacityDisabled
                        fixed={currentMarket.price_precision}
                        thousSep=","
                    >
                        {lastPrice}
                    </Decimal>
                    <span className="uppercase">
                        {' '}
                        {currentMarket.quote_unit}
                    </span>
                </div>
            )
        }

        return <div className="uppercase">0</div>
    }, [currentMarket, lastRecentTrade, getTickerValue])

    const dataAsks = React.useMemo(() => {
        return asks.slice(0).reverse()
    }, [asks])

    const dataBids = React.useMemo(() => {
        return bids
    }, [bids])

    const transformOrderBookData = React.useCallback(
        (array: string[][], side: string) => {
            const priceFixed = currentMarket ? currentMarket.price_precision : 0
            const amountFixed = currentMarket
                ? currentMarket.amount_precision
                : 0

            return array.map((item, index) => {
                const [price, volume] = item

                switch (side) {
                    case 'asks':
                        const totalAsks = accumulateVolume(
                            array.slice(0).reverse(),
                        )
                            .slice(0)
                            .reverse()

                        return [
                            <Decimal
                                key={index}
                                fixed={priceFixed}
                                thousSep=","
                                prevValue={
                                    array[index + 1] ? array[index + 1][0] : 0
                                }
                            >
                                {price}
                            </Decimal>,
                            <Decimal
                                key={index}
                                fixed={amountFixed}
                                thousSep=","
                                opacityDisabled
                            >
                                {volume}
                            </Decimal>,
                            <Decimal
                                key={index}
                                fixed={amountFixed}
                                thousSep=","
                                opacityDisabled
                            >
                                {totalAsks[index]}
                            </Decimal>,
                        ]
                    default:
                        const totalBids = accumulateVolume(array)

                        return [
                            <Decimal
                                key={index}
                                fixed={priceFixed}
                                thousSep=","
                                prevValue={
                                    array[index - 1] ? array[index - 1][0] : 0
                                }
                            >
                                {price}
                            </Decimal>,
                            <Decimal
                                key={index}
                                fixed={amountFixed}
                                thousSep=","
                                opacityDisabled
                            >
                                {volume}
                            </Decimal>,
                            <Decimal
                                key={index}
                                fixed={amountFixed}
                                thousSep=","
                                opacityDisabled
                            >
                                {totalBids[index]}
                            </Decimal>,
                        ]
                }
            })
        },
        [currentMarket],
    )

    const handleCellClick = React.useCallback(
        (headerValue: string, cellValue) => {
            console.log(headerValue, cellValue)
            switch (headerValue) {
                case 'price':
                    dispatch(setCurrentPrice(cellValue))
                    break
                default:
                    break
            }
        },
        [],
    )

    const renderOrderBook = React.useMemo(() => {
        if (orderbookLoading) {
            return <Spinner />
        }

        return (
            <CombinedOrderBook
                maxVolume={calculateMaxVolume(dataBids, dataAsks)}
                orderBookEntryAsks={accumulateVolume(dataAsks)}
                orderBookEntryBids={accumulateVolume(dataBids)}
                rowBackgroundColorAsks="rgba(254, 242, 242, 1)"
                rowBackgroundColorBids="rgba(236, 253, 245, 1)"
                dataAsks={transformOrderBookData(dataAsks, 'asks')}
                dataBids={transformOrderBookData(dataBids, 'bids')}
                headers={orderBookHeaders}
                lastPrice={renderLastPriceOrderBookNode}
                noDataAsks={!dataAsks.length}
                noDataBids={!dataBids.length}
                noDataMessage={'No data in orderbook'}
                handleCellClick={handleCellClick}
            />
        )
    }, [dataAsks, dataBids, orderbookLoading])

    return (
        <TradingItem
            title="ORDER BOOK"
            mainClassName="border rounded-md shadow h-full m-0"
            contentClassName="border-t relative fd-orderbook"
        >
            {renderOrderBook}
        </TradingItem>
    )
}
