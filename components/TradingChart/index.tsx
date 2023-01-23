import { Chart, Spinner } from '@openware/react-opendax/build'
import { useAppDispatch, useAppSelector } from 'app/hooks'
import {
    KlineState,
    klineSubscribe,
    klineUnsubscribe,
    klineUpdatePeriod,
    klineUpdateTimeRange,
} from 'features/kline/kline'
import { KlineTimeRange } from 'features/kline/types'
import React, { useCallback } from 'react'
import { klineArrayToObject } from './helpers'

export const TradingChart: React.FC = () => {
    const dispatch = useAppDispatch()

    const markets = useAppSelector((state) => state.markets.markets)
    const currentMarket = useAppSelector((state) => state.markets.currentMarket)
    const kline = useAppSelector((state) => state.kline)
    const kLineLoading = useAppSelector((state) => state.kline.kLineLoading)

    const handleSubscribeKline = useCallback(
        (marketId: string, period: string) =>
            dispatch(klineSubscribe({ marketId, period })),
        [currentMarket],
    )

    const handleUnsubscribeKline = useCallback(
        (marketId: string, period: string) =>
            dispatch(klineUnsubscribe({ marketId, period })),
        [currentMarket],
    )

    const handleUpdatePeriodAndTimeRange = useCallback(
        (range: KlineTimeRange, period: string) => {
            if (range !== kline.range) {
                dispatch(klineUpdateTimeRange(range))
            }

            if (period !== kline.period) {
                dispatch(klineUpdatePeriod(period))
            }
        },
        [kline.period, kline.range],
    )

    const handleFetchKline = useCallback(
        (
            _marketId: string,
            _period: number,
            _from: number,
            _to: number,
            onHistoryCallback: any,
            kline: KlineState,
        ) => {
            const promise = new Promise(function(resolve, _reject) {
                setTimeout(() => resolve(kline.data), 2000);
            });

            return promise.then((res: any) => {
                if (res?.length < 1) {
                    return onHistoryCallback([], { noData: true });
                }

                const bars = res.map(klineArrayToObject);

                return onHistoryCallback(bars, { noData: false });
            }).catch((_err: any) => {
                return onHistoryCallback([], { noData: false });
            });
        },
        [],
    )

    const renderChart = React.useMemo(() => {
        if (kLineLoading) {
            return <Spinner />
        }

        return (
            <Chart
                markets={markets}
                currentMarket={currentMarket}
                kline={kline}
                fetchKline={handleFetchKline}
                klineSubscribe={handleSubscribeKline}
                klineUnsubscribe={handleUnsubscribeKline}
                klineUpdatePeriodAndTimeRange={handleUpdatePeriodAndTimeRange}
                isPreview={false}
                lang="en" // TODO: take from global config
                colorTheme="light" // TODO: take from global config
            />
        )
    }, [markets, currentMarket, kline, kLineLoading])

    return renderChart
}

export default TradingChart;
