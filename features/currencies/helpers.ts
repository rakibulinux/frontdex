import { Currency } from '@openware/react-opendax/build';
import { WSRawElement } from "features/kline/types";

/**
 * currencies response event
    [
        2,
        2,
        "get_currencies",
        [
            [
                "eth",
                "0xde0b295669a9fd93d5f28d9ec85e40f4cb697bae",
                6
            ]
        ]
    ]
*/

export const currenciesArrayToObject = (el: WSRawElement[]): Currency => {
    const [ id, address, decimal ] = el;

    return {
        id: String(id),
        address: String(address || 0),
        decimal: Number(decimal || 0),
    };
};

export const formatCurrencies = (payload?: string[][]): Currency[] => {
    let list: Currency[] = [];

    if (payload) {
        for (const i of payload) {
            list = [ ...list, currenciesArrayToObject(i)];
        }
    }

    return list;
};
