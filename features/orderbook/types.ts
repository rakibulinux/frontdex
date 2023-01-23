export interface OrderbookUpdatePayload {
    sequence: number | null;
    asks: string[][] | string[] | null;
    bids: string[][] | string[] | null;
}

export interface OrderbookPricesItem {
    [key: string]: string;
}
