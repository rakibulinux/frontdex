import { Market } from "./types";

// request [1, 2, "get_markets", []]
// [2, 2, "get_markets",
//     [
//         [
//             "btcusd",      // id
//             "spot",        // type
//             "btc",         // base_unit
//             "usd",         // quote_unit
//             "enabled",     // state
//             10,            // position
//             4,             // amount_precision
//             4,             // price_precision
//             0.0001,        // min_price
//             0,             // max_price
//             0.0001,        // min_amount
//         ]
//     ]
// ]

export const formatMarkets = (payload: (string | number)[][]): Market[] => {
    let list: Market[] = [];

    if (payload) {
        list = payload.map(item => {
            const [ id, type, base_unit, quote_unit, state, position, amount_precision, price_precision, min_price, max_price, min_amount ] = item;
            return {
                id: String(id),
                name: `${String(base_unit).toUpperCase()}/${String(quote_unit).toUpperCase()}`,
                type: String(type),
                base_unit: String(base_unit),
                quote_unit: String(quote_unit),
                state: String(state),
                position: String(position),
                amount_precision: +amount_precision,
                price_precision: +price_precision,
                min_price: String(min_price),
                max_price: String(max_price),
                min_amount: String(min_amount),
            };
        });
    }

    return list;
};
