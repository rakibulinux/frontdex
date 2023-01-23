export interface PublicTrade {
    id: number;
    price: string;
    total?: string;
    amount: string;
    market: string;
    created_at: string;
    taker_type: string;
    price_change?: string;
}

export interface PublicTradeEvent {
    tid: number;
    taker_type: 'buy' | 'sell';
    date: number;
    price: string;
    amount: string;
}

export interface RecentTradePushPayload {
    trades: PublicTradeEvent[],
    market: string,
}
