import { useAppDispatch, useAppSelector } from 'app/hooks'
import {
    BalancesWidget,
    CreateOrderFormWidget,
    Layout,
    OpenOrdersWidget,
    OrderBookWidget,
    Toolbar,
} from 'components'
import { klineFetch } from 'features/kline/kline'
import { getMarkets, initializeCurrentMarket } from 'features/markets/markets'
import { openOrdersFetch } from 'features/openOrders/openOrders'
import { orderBookFetch } from 'features/orderbook/orderbook'
import { appTitle } from 'libs/page'
import dynamic from 'next/dynamic'
import Head from 'next/head'
import { useRouter } from 'next/router'
import React, { FC, useEffect } from 'react'
import { REQUEST_CODE, useWebSocketContext } from 'websockets/WebSockets'

const TradingChart = dynamic(() => import('../../components/TradingChart'), {
    ssr: false,
})

const TradingByMarket: FC<{}> = (): JSX.Element => {
    const router = useRouter()
    const { marketID } = router.query

    const markets = useAppSelector((state) => state.markets.markets)
    const currentMarket = useAppSelector((state) => state.markets.currentMarket)

    const postMessage = useWebSocketContext()
    const dispatch = useAppDispatch()

    useEffect(() => {
        if (!markets.length) {
            dispatch(getMarkets())
            dispatch(klineFetch())
            dispatch(orderBookFetch())
            dispatch(openOrdersFetch())

            postMessage([REQUEST_CODE, 12, 'get_markets', []])
        }
    }, [])

    useEffect(() => {
        if (!currentMarket && markets.length) {
            const newCurrentMarket =
                typeof marketID === 'string' &&
                markets?.find(
                    (market) =>
                        market?.id?.toLowerCase() === marketID.toLowerCase(),
                )

            postMessage([
                REQUEST_CODE,
                13,
                'get_klines',
                [markets[0].id, '15m', 1, 2],
            ])
            dispatch(initializeCurrentMarket(newCurrentMarket || markets[0]))
        }
    }, [currentMarket, markets])

    return (
        <>
            <Head>
                <title>{appTitle('Trading')}</title>
            </Head>
            <Layout className="flex flex-grow overflow-hidden">
                <div className="flex flex-col md:flex-row h-screen w-full">
                    <div className="flex flex-col w-full md:w-3/5 xl:w-7/12 flex-grow">
                        <div className="toolbar w-full h-1/6 max-h-16 p-1">
                            <Toolbar />
                        </div>
                        <div className="toolbar w-full h-4/6 px-1">
                            <div className="h-full border rounded shadow">
                                <TradingChart />
                            </div>
                        </div>
                        <div className="toolbar w-full h-2/6 p-1">
                            <OpenOrdersWidget />
                        </div>
                    </div>
                    <div className="flex flex-col w-full md:w-1/5 xl:w-60 2xl:w-64">
                        <div className="toolbar w-full h-full py-1">
                            <OrderBookWidget />
                        </div>
                    </div>
                    <div className="flex flex-col w-full md:w-1/5 xl:w-64 2xl:w-80">
                        <div className="toolbar w-full h-auto p-1">
                            <CreateOrderFormWidget />
                        </div>
                        <div className="toolbar w-full h-full p-1">
                            <BalancesWidget />
                        </div>
                    </div>
                </div>
            </Layout>
        </>
    )
}

export default TradingByMarket
