export interface Deposit {
    currency: string;
    id: number;
    amount: string;
    blockchain_key: string;
    fee: string;
    txid: string;
    created_at: string;
    confirmations: number | string;
    completed_at: string;
    state: string;
    price?: number;
}

export interface Withdraw {
    currency: string;
    id: number;
    type: string;
    amount: string;
    fee: string;
    blockchain_txid: string;
    blockchain_key: string;
    rid: string;
    state: string;
    created_at: string;
    updated_at: string;
    completed_at: string;
    done_at: string;
    price?: number;
}

export interface Trade {
    id: number;
    price: string;
    total?: string;
    amount: string;
    market: string;
    created_at: string;
    taker_type: string;
    price_change?: string;
    side?: string;
    order_id?: number;
}

export type OrderStatus = 'wait' | 'done' | 'cancel' | 'pending' | 'reject' | 'trigger_wait';
export type OrderSide = 'sell' | 'buy';
export type OrderType = 'limit' | 'market' | 'stop_loss' | 'stop_limit' | 'take_profit' | 'take_limit';
export type OrderKind = 'bid' | 'ask';

export interface Order {
    price: string;
    state: OrderStatus;
    remaining_volume: string;
    origin_volume: string;
    executed_volume?: string;
    side: OrderSide;
    market: string;
    ord_type?: OrderType;
    avg_price?: string;
    volume?: number;
    trigger_price?: string;
    created_at?: string;
    updated_at?: string;
    triggered_at?: string;
    confirmed?: boolean;
    uuid?: string;
    id?: number;
    kind?: OrderKind;
    trades_count?: number;
}
