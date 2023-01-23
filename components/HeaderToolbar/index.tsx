import { HeaderToolbar, Spinner } from '@openware/react-opendax/build';
import { useAppDispatch, useAppSelector } from 'app/hooks';
import { CryptoIcon } from 'components/CryptoIcon';
import { toggleMarketSelector } from 'features/globalSettings/globalSettings';
import { Market } from 'features/markets/types';
import { Ticker } from 'features/tickers/types';
import * as React from 'react';

const defaultTicker: Ticker = {
    amount: '0',
    avg_price: '0',
    high: '0',
    last: '0',
    low: '0',
    open: '0',
    price_change_percent: '+0.00%',
    volume: '0',
    name: '',
    at: 0,
};

export const Toolbar: React.FC = () => {
    const dispatch = useAppDispatch()

    const currentMarket: Market | undefined = useAppSelector(
        (state) => state.markets.currentMarket,
    )
    const tickers = useAppSelector((state) => state.tickers.tickers)
    const marketsLoading = useAppSelector(
        (state) => state.markets.marketsLoading,
    )

    // TODO: Use Decimal in Toolbar in components
    const formatTicker = React.useMemo(() => {
        const tic =
            (currentMarket && tickers[currentMarket.id]) || defaultTicker

        return {
            name: tic.name,
            at: tic.at,
            avg_price: tic.avg_price,
            open: tic.open,
            low: tic.low,
            last: tic.last,
            high: tic.high,
            amount: tic.amount,
            volume: tic.volume,
            price_change_percent: tic.price_change_percent,
        }
    }, [currentMarket, tickers])

    const handleOpenMarketSelector = React.useCallback(() => {
        dispatch(toggleMarketSelector(true))
    }, [])

    const renderToolbarNode = React.useMemo(() => {
        if (marketsLoading) {
            return <Spinner />
        }

        if (!currentMarket) {
            return null
        }

        return (
            <HeaderToolbar
                classNameToolbar="flex justify-items-center border shadow rounded h-full w-full md:text-xs overflow-x-auto overflow-y-hidden no-scrollbar"
                classNameCurrencyBlockPicker="flex items-center ml-5 cursor-pointer"
                currentMarket={currentMarket}
                ticker={formatTicker}
                allMarketsLabel="All markets"
                lastPriceLabel="Last price"
                changePriceLabel="24h Change"
                highPriceLabel="24h High"
                lowPriceLabel="24h Low"
                pricePrecision={currentMarket.price_precision}
                amountPrecision={currentMarket.amount_precision}
                onArrowIconClick={handleOpenMarketSelector}
                customHeaderIcon={<CryptoIcon code={currentMarket.base_unit} classNameImage="w-8" />}
            />
        )
    }, [currentMarket, formatTicker, marketsLoading])

    return renderToolbarNode
};
