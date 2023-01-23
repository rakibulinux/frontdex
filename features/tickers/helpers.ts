import { Ticker } from "./types";

/**
[3, "tickers", [["btczar",15.22854008805878,1633615640.648,0.13604162478665846,0.14720922085123486,0.0010152360058705854,0.13198901459872112,10,0,"-3.07%"] ...
 * 
 */

export const formatTicker = (events: string[][]): { [pair: string]: Ticker } => {
    const tickers: any = {};
    const keys = [ 'name', 'at', 'amount', 'avg_price', 'high', 'last', 'low', 'open', 'price_change_percent', 'volume'];

    for (const i of events) {
        for (const keyIndex in keys) {
            tickers[i[0]] = {
                ...tickers[i[0]],
                [keys[keyIndex]]: i[keyIndex],
            }; 
        }
    }

    return tickers;
};
