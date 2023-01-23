import Config from 'configs/app';
import { Market } from 'features/markets/types';
// import { Market, Ticker, TickerEvent } from '@openware/react-opendax/build';

export const DEFAULT_TRADING_VIEW_INTERVAL = "15";

export const isTradingPage = (route: string) => route?.split('/')[1] === 'trading';
export const generateSocketURI = (s: string[]) => `${Config.finexUrl(window)}?stream=${s.sort().join('&stream=')}`;

export const streamsBuilder = (
    withAuth: boolean,
    market: Market | undefined,
    route: string,
    periodString?: string
) => {
    let publicStreams: string[] = [];
    let privateStreams: string[] = [];

    switch (route.split('/')[1]) {
        case 'trading':
            publicStreams = [
                'tickers',
                ...marketStreams(market, periodString).channels,
            ];

            break;
        case 'orders':
        case 'history':
        default:
            break;
    }

    if (withAuth) {
        privateStreams = [ ...privateStreams, 'order', 'trade', 'bu' ];
    }

    return {
        public: publicStreams.filter(i => !!i),
        private: privateStreams.filter(i => !!i),
    };
};

export const periodsMapNumber: { [pair: string]: number } = {
    '1m': 1,
    '5m': 5,
    '15m': 15,
    '30m': 30,
    '1h': 60,
    '2h': 120,
    '4h': 240,
    '6h': 360,
    '12h': 720,
    '1d': 1440,
    '3d': 4320,
    '1w': 10080,
};

export const periodsMapString: { [pair: number]: string } = {
    1: '1m',
    5: '5m',
    15: '15m',
    30: '30m',
    60: '1h',
    120: '2h',
    240: '4h',
    360: '6h',
    720: '12h',
    1440: '1d',
    4320: '3d',
    10080: '1w',
};

export const periodStringToMinutes = (period: string): number => periodsMapNumber[period] || +DEFAULT_TRADING_VIEW_INTERVAL;
export const periodMinutesToString = (period: number): string => periodsMapString[period] || periodsMapString[+DEFAULT_TRADING_VIEW_INTERVAL];

export const marketKlineStreams = (marketId: string, periodString: string) => ({
    channels: [
        `${marketId}.kline-${periodString}`,
    ],
});

export const marketStreams = (market?: Market, periodString?: string) => {
    if (market && Config.incrementalOrderBook) {
        return {
            channels: [
                `${market.id}.obi`,
                `${market.id}.obs`,
                ...(periodString ? marketKlineStreams(market.id, periodString).channels : []),
            ].filter(i => !!i)
        };
    } else {
        return { channels: [] };
    }
};
