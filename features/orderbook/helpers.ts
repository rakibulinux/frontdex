import { OrderbookUpdatePayload } from "./types";

/*
    Example: [3, "market.obs", [0, [["10", "1"]], [["5", "1"]]]]
    Example: [3, "market.obi", [1, "asks", ["10", "1"]]]
*/

export const formatOrderbookInc = (payload?: any[]): OrderbookUpdatePayload => {
    let data: any = {};

    if (payload && payload.length) {
        data['sequence'] = payload[0];
        data[payload[1]] = payload[2];
    }

    return data as OrderbookUpdatePayload;
};

export const formatOrderbookSnap = (payload?: any[]): OrderbookUpdatePayload => {
    let data: OrderbookUpdatePayload = {
        sequence: null,
        asks: null,
        bids: null
    };

    if (payload && payload.length) {
        data = {
            sequence: payload[0],
            asks: payload[1],
            bids: payload[2],
        }
    }

    return data;
};