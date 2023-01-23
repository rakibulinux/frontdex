import { Balance } from '@openware/react-opendax/build';
import { WSRawElement } from "features/kline/types";

/**
 * balance update event
 *
    [
        4,
        "bu",
        [
            ["eth", "1000000000", "0"],
            ["trst", "1000000000", "0"],
            ["usd", "999999999", "0"],
        ]
    ]
*/

export const balancesArrayToObject = (el: WSRawElement[]): Balance => {
    const [ symbol, balance, locked ] = el;

    return {
        symbol: String(symbol),
        balance: Number(balance || 0),
        locked: Number(locked || 0),
    };
};

export const formatBalances = (payload?: string[][]): Balance[] => {
    let list: Balance[] = [];

    if (payload) {
        for (const i of payload) {
            list = [ ...list, balancesArrayToObject(i)];
        }
    }

    return list;
};
