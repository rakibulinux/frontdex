import { useAppDispatch, useAppSelector } from 'app/hooks'
import { klineFetch } from 'features/kline/kline'
import { getMarkets, initializeCurrentMarket } from 'features/markets/markets'
import { openOrdersFetch } from 'features/openOrders/openOrders'
import { orderBookFetch } from 'features/orderbook/orderbook'
import { useRouter } from 'next/router'
import { FC, useEffect } from 'react'
import { REQUEST_CODE, useWebSocketContext } from 'websockets/WebSockets'

const Trading: FC = (): JSX.Element | null => {
    const markets = useAppSelector((state) => state.markets.markets)
    const currentMarket = useAppSelector((state) => state.markets.currentMarket)

    const postMessage = useWebSocketContext()
    const dispatch = useAppDispatch()
    const router = useRouter()

    useEffect(() => {
        dispatch(getMarkets())
        dispatch(klineFetch())
        dispatch(orderBookFetch())
        dispatch(openOrdersFetch())

        postMessage([REQUEST_CODE, 12, 'get_markets', []])
    }, [])

    useEffect(() => {
        if (!currentMarket && markets.length) {
            dispatch(initializeCurrentMarket(markets[0]))

            postMessage([
                REQUEST_CODE,
                13,
                'get_klines',
                [markets[0].id, '15m', 1, 2],
            ])
            router.push(`/trading/${markets[0].id}`)
        }
    }, [currentMarket, markets])

    return <></>
}

export default Trading
