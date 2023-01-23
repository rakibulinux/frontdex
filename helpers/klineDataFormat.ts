import { WSRawElement, KlineEvent } from 'features/kline/types';

export const klineArrayToObject = (el: WSRawElement[]): KlineEvent => {
    const [time, open, high, low, close, volume, avg] = el.map((e: WSRawElement) => {
        switch (typeof e) {
            case 'number':
                return e;
            case 'string':
                return Number.parseFloat(e);
            default:
                return 0;
                // TODO: change null klineUpdateMarketIdin mockserver
                // throw (new Error(`unexpected type ${typeof e} in kline: ${el}`));
        }
    });

    return {
        time: time * 1e3,
        open,
        high,
        low,
        close,
        volume,
        avg,
    };
};
