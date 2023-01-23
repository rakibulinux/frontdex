export type OrderStatus = 'wait' | 'done' | 'cancel' | 'pending' | 'reject' | 'trigger_wait';
export type OrderSide = 'sell' | 'buy';
export type OrderType = 'l' | 'm' | 'stop_loss' | 'stop_limit' | 'take_profit' | 'take_limit';

export interface OrderExecution {
    market: string;
    ord_type: string;
    side: OrderSide;
    volume: string;
    price?: string;
    trigger_price?: string;
}

export interface OrderCommon {
    market: string;
    id: number;
    uuid?: string;
    side: OrderSide;
    state: OrderStatus;
    ord_type: OrderType;
    price: string;
    avg_price?: string;
    remaining_volume: string;
    origin_volume: string;
    executed_volume: string;
    trades_count?: number;
    created_at: string;
    updated_at: string;
    // TODO: add trigger fields to interface
    // trigger_price?: string;
    // triggered_at?: string;
    // confirmed?: boolean;
}
