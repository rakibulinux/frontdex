export type WSRawElement = string | number;

export interface KlineTimeRange {
    from: number;
    to: number;
}

export interface KlineEvent {
    time: number;
    close: number;
    open: number;
    high: number;
    low: number;
    volume: number;
    avg: number;
}

export interface KlineChangeSubscription {
    marketId: string;
    period: string;
}
