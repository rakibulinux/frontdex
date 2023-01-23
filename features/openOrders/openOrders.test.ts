import reducer, { initialOpenOrdersState, saveOpenOrders, resetOpenOrdersLoading, openOrdersFetch, updateOpenOrders } from './openOrders';
import { formatOpenOrders, insertOrUpdate, orderArrayToObject } from './helpers';
import { OpenOrdersState } from './openOrders';
import { sliceArray } from 'helpers';
import Config from 'configs/app';

test('should not change state in case of some random action', () => {
    expect(reducer(initialOpenOrdersState, { type: 'Random action', payload: 'fake payload' })).toEqual(initialOpenOrdersState);
});

test('should not change existing state in case of some random action', () => {
    const existingState: OpenOrdersState = {
        list: [{
            market: 'btceth',
            id: 10097,
            uuid: '6dcc2c8e-c295-11ea-b7ad-1831bf9834b0',
            side: 'buy',
            state: 'wait',
            ord_type: 'l',
            price: '9122',
            avg_price: '0',
            remaining_volume: '0.3',
            origin_volume: '0.3',
            executed_volume: '0',
            trades_count: 0,
            created_at: '15943865',
            updated_at: '15943865',
        }],
        openOrdersLoading: false,
    };
    expect(reducer(existingState, { type: 'Random action' })).toEqual(existingState);
});

test('should successfully update open orders list when saveOpenOrders action is dispatched', () => {
    const initialOpenOrdersState = {
        list: [],
        openOrdersLoading: true,
    };
    const fakeOpenOrders = [
        ['btcusd', '97', '6dcc2c8e-c295-11ea-b7ad-1831bf9834b0', 'sell', 'w', 'l', '9120', '0', '0.25', '0.25', '0', '0', '15943865'],
        ['btceth', '97', '6dcc2c8e-c295-11ea-b7ad-1831bf9834b0', 'buy', 'w', 'l', '9122', '0', '0.3', '0.3', '0', '0', '15943865'],
    ];
    const convertedFakeOpenOrders = formatOpenOrders(fakeOpenOrders);
    expect(reducer(initialOpenOrdersState, saveOpenOrders(fakeOpenOrders))).toEqual({
        list: convertedFakeOpenOrders,
        openOrdersLoading: false,
    });
});

test('should successfully update open orders list when updateOpenOrders action is dispatched', () => {
    let fakeOpenOrders = [
        ['btcusd', '97', '6dcc2c8e-c295-11ea-b7ad-1831bf9834b0', 'sell', 'w', 'l', '9120', '0', '0.25', '0.25', '0', '0', '15943865'],
        ['btceth', '98', '6dcc2c8e-c295-11ea-b7ad-1831bf9834b0', 'buy', 'w', 'l', '9122', '0', '0.3', '0.3', '0', '0', '15943865'],
    ];
    let convertedFakeOpenOrders = formatOpenOrders(fakeOpenOrders);
    const initialOpenOrdersState = {
        list: convertedFakeOpenOrders,
        openOrdersLoading: false,
    };
    const fakeOpenOrder = ['btcusd', '97', '6dcc2c8e-c295-11ea-b7ad-1831bf9834b0', 'sell', 'w', 'l', '9120', '0', '0.2', '0.25', '0.05', '0', '15943865'];
    convertedFakeOpenOrders = sliceArray(insertOrUpdate(convertedFakeOpenOrders, orderArrayToObject(fakeOpenOrder)), Config.defaultStorageLimit);
    expect(reducer(initialOpenOrdersState, updateOpenOrders(fakeOpenOrder))).toEqual({
        list: convertedFakeOpenOrders,
        openOrdersLoading: false,
    });
});

test('should successfully set loading variable to true when openOrdersFetch action is dispatched', () => {
    const initialOpenOrdersState = {
        list: [],
        openOrdersLoading: false,
    };
    expect(reducer(initialOpenOrdersState, openOrdersFetch())).toEqual({
        list: [],
        openOrdersLoading: true,
    });
});

test('should successfully reset loading when resetOpenOrdersLoading action is dispatched', () => {
    const initialOpenOrdersState = {
        list: [],
        openOrdersLoading: true,
    };
    expect(reducer(initialOpenOrdersState, resetOpenOrdersLoading())).toEqual({
        list: [],
        openOrdersLoading: false,
    });
});
