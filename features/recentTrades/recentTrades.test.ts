import reducer, { initialRecentTradesState, recentTradePush } from './recentTrades';
import { convertTradeEventList, extendTradeWithPriceChange, sliceArray } from 'helpers';
import Config from 'configs/app';

test('should not change state in case of some random action', () => {
    expect(reducer(initialRecentTradesState, { type: 'Random action', payload: 'fake payload' })).toEqual(initialRecentTradesState);
});

test('should update recent trades', () => {
    const payload = {
        trades: [],
        market: '',
    };
    const lastTrades = convertTradeEventList(payload.market, payload.trades);
    const updatedList = [
        ...lastTrades,
        ...initialRecentTradesState.list,
    ];

    expect(reducer(initialRecentTradesState, recentTradePush(payload))).toEqual({
        ...initialRecentTradesState,
        list: sliceArray(updatedList, Config.defaultStorageLimit),
        lastTrade: extendTradeWithPriceChange(updatedList?.[0], updatedList?.[1]),
    });
});
