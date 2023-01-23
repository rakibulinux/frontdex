import { MarketSelector } from '@openware/react-opendax/build';
import { useAppDispatch, useAppSelector } from 'app/hooks';
import { toggleMarketSelector } from 'features/globalSettings/globalSettings';
import { setCurrentMarket } from 'features/markets/markets';
import * as React from 'react';
import { CryptoIcon } from 'components/CryptoIcon';

interface MarketSelectorListProps {
    shouldShowMarketSelector: boolean
}

export const MarketSelectorList: React.FC<MarketSelectorListProps> = ({
    shouldShowMarketSelector,
}: MarketSelectorListProps) => {
    const dispatch = useAppDispatch()

    const currentMarket = useAppSelector((state) => state.markets.currentMarket)
    const markets = useAppSelector((state) => state.markets.markets)
    const tickers = useAppSelector((state) => state.tickers.tickers)

    const marketSelectorNodeRef = React.useRef<HTMLDivElement | null>(null)

    React.useEffect(() => {
        document.addEventListener('click', handleClickOutside, true)

        return () => {
            document.removeEventListener('click', handleClickOutside, true)
        }
    }, [shouldShowMarketSelector])

    const handleClickOutside = React.useCallback(
        (event) => {
            if (
                shouldShowMarketSelector &&
                marketSelectorNodeRef !== null &&
                marketSelectorNodeRef.current &&
                !marketSelectorNodeRef.current.contains(event.target)
            ) {
                dispatch(toggleMarketSelector(false))
            }
        },
        [shouldShowMarketSelector, marketSelectorNodeRef],
    )

    const handleSetCurrentMarket = React.useCallback(
        (marketKey: string) => {
            const selectedMarket = markets.find(
                (market) => market.id === marketKey,
            )

            if (selectedMarket) {
                dispatch(setCurrentMarket(selectedMarket))
                dispatch(toggleMarketSelector(false))
            }
        },
        [markets],
    )

    if (!shouldShowMarketSelector) {
        return null
    }

    return (
        <>
            <div
                className="absolute top-0 left-0 h-screen z-50"
                ref={marketSelectorNodeRef}
            >
                <MarketSelector
                    markets={markets}
                    tickers={tickers}
                    selectedKey={currentMarket?.id || ''}
                    setCurrentMarket={handleSetCurrentMarket}
                    customHeaderIcon={CryptoIcon}
                />
            </div>
            <div className="absolute top-0 left-0 h-screen w-screen z-20 backdrop-filter backdrop-blur" />
        </>
    )
};
