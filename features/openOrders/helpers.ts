import { OrderSide, OrderStatus } from "features/history/types";
import { WSRawElement } from "features/kline/types";
import { OrderCommon } from "features/order/types";

/**
 * orders list fetch response
// [2,2,"list_orders",[["btcusd",97,"6dcc2c8e-c295-11ea-b7ad-1831bf9834b0","sell","w","l","9120","0","0.25","0.25","0",0,15943865]]]
*/

export const orderArrayToObject = (el: WSRawElement[]): OrderCommon => {
    const [
        market,
        id,
        uuid,
        side,
        state,
        ord_type,
        price,
        avg_price,
        remaining_volume,
        origin_volume,
        executed_volume,
        trades_count,
        created_at,
        updated_at,
        // TODO: add trigger fields to interface
        // trigger_price?: string;
        // triggered_at?: string;
        // confirmed?: boolean;
    ] = el.map((e: WSRawElement) => {
        switch (typeof e) {
            case 'number':
            case 'string':
                return e;
            default:
                return 0;
        }
    });

    return {
        market: String(market),
        id: +id,
        uuid: String(uuid),
        side: String(side) as OrderSide,
        state: String(state) as OrderStatus,
        ord_type: String(ord_type) as OrderCommon['ord_type'],
        price: String(price),
        avg_price: String(avg_price),
        remaining_volume: String(remaining_volume),
        origin_volume: String(origin_volume),
        executed_volume: String(executed_volume),
        trades_count: +trades_count,
        created_at: String(created_at),
        updated_at: String(updated_at),
    };
};

export const formatOpenOrders = (payload?: string[][]): OrderCommon[] => {
    let list: OrderCommon[] = [];

    if (payload) {
        for (const i of payload) {
            list = [ ...list, orderArrayToObject(i)];
        }
    }

    return list;
};

// order update private event
// [2,"or",[1005040,5040,1633773460,"ethbtc","ask",0.05000000000000003,0.05000000000000003,"wait",248050,248050,0,"buy",1633773459,1633773460,"m",0]]

export const insertOrUpdate = (list: OrderCommon[], order: OrderCommon): OrderCommon[] => {
    const { state, id, uuid } = order;
    switch (state) {
        case 'wait':
        case 'trigger_wait':
            const index = list.findIndex((value: OrderCommon) => (value.uuid && value.uuid === uuid) || value.id === id);
            if (index === -1) {
                return [{...order}, ...list];
            }

            return list.map(item => {
                if ((item.uuid && item.uuid === order.uuid) || (item.id === order.id)) {
                    return {...order};
                }

                return item;
            });
        default:
            return list.reduce((memo: OrderCommon[], item: OrderCommon, i: number): OrderCommon[] => {
                if ((item.uuid && item.uuid !== uuid) || item.id !== id) {
                    memo.push(item);
                }

                if (item.uuid && item.uuid === uuid) {
                    memo.splice(i, 1);
                }

                return memo;
            }, []);
    }
};

export const insertIfNotExisted = (list: OrderCommon[], order: OrderCommon): OrderCommon[] => {
    const index = list.findIndex((value: OrderCommon) =>
        // OLD: order.confirmed ? value.id === order.id : value.uuid === order.uuid);
        value.uuid === order.uuid);
    return (index === -1) ? [{...order}, ...list] : [...list];
};
