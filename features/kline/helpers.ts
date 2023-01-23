import { klineArrayToObject } from "helpers";
import { KlineEvent, WSRawElement } from "./types";

/**
 * [3,"btcusd.kline-15m",[null,7.702511305289551,null, null,null,1,42.56278263223878]]
              [marketId, period, roundedTime, open, high, low, close, volume, avg]];
 */

export const formatKline = (data: any[]): {last: KlineEvent} => (
    {
        last: klineArrayToObject(data.slice(2)),
    }
);
