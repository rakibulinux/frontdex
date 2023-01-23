import { PublicTradeEvent, PublicTrade } from 'features/recentTrades/types';

export const convertTradeEventToTrade = (market: string, trade: PublicTradeEvent): PublicTrade => ({
    market,
    id: trade.tid,
    created_at: new Date(trade.date * 1000).toISOString(),
    taker_type: trade.taker_type,
    price: String(trade.price),
    amount: String(trade.amount),
});

export const convertTradeEventList = (market: string, trades: PublicTradeEvent[]): PublicTrade[] =>
    trades.map(trade => convertTradeEventToTrade(market, trade));

export const extendTradeWithPriceChange = (
    trade?: PublicTrade,
    prevTrade?: PublicTrade,
): PublicTrade | undefined => {
    if (trade) {
        if (prevTrade) {
            return {
                ...trade,
                price_change: String(+(trade?.price) - +(prevTrade?.price)),
            };
        }

        return trade;
    }

    return;
};
