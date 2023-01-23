import reducer, { initialMarketsState, saveMarkets, setCurrentMarket, initializeCurrentMarket, getMarkets, resetMarketsLoading } from './markets';
import { Market } from './types';

const marketPayload: Market = {
    id: 'ethusdt',
    name: 'ETH/USDT',
    type: 'spot',
    base_unit: 'eth',
    quote_unit: 'usdt',
    state: 'enabled',
    position: '101',
    amount_precision: 4,
    price_precision: 4,
    min_price: '0.0001',
    max_price: '0',
    min_amount: '0.0001'
};

test('should not change state in case of some random action', () => {
    expect(reducer(initialMarketsState, { type: 'Random action', payload: 'fake payload' })).toEqual(initialMarketsState);
});

test('should save markets', () => {
    const payload = [
        ['ethusdt', 'spot', 'eth', 'usdt', 'enabled', '101', 4, 4, '0.0001', '0', '0.0001'],
        ['adausdt', 'spot', 'ada', 'usdt', 'enabled', '102', 2, 4, '0.01', '0', '0.0001'],
        ['dotusdt', 'spot', 'dot', 'usdt', 'enabled', '103', 2, 4, '0.01', '0', '0.0001'],
        ['ethdot', 'spot', 'eth', 'dot', 'enabled', '104', 4, 4, '0.0001', '0', '0.0001'],
        ['wbtcusdt', 'spot', 'wbtc', 'usdt', 'enabled', '100', 4, 4, '0.0001', '0', '0.0001'],
    ];

    const markets = [
        {
            id: 'ethusdt',
            name: 'ETH/USDT',
            type: 'spot',
            base_unit: 'eth',
            quote_unit: 'usdt',
            state: 'enabled',
            position: '101',
            amount_precision: 4,
            price_precision: 4,
            min_price: '0.0001',
            max_price: '0',
            min_amount: '0.0001'
        },
        {
            id: 'adausdt',
            name: 'ADA/USDT',
            type: 'spot',
            base_unit: 'ada',
            quote_unit: 'usdt',
            state: 'enabled',
            position: '102',
            amount_precision: 2,
            price_precision: 4,
            min_price: '0.01',
            max_price: '0',
            min_amount: '0.0001'
        },
        {
            id: 'dotusdt',
            name: 'DOT/USDT',
            type: 'spot',
            base_unit: 'dot',
            quote_unit: 'usdt',
            state: 'enabled',
            position: '103',
            amount_precision: 2,
            price_precision: 4,
            min_price: '0.01',
            max_price: '0',
            min_amount: '0.0001'
        },
        {
            id: 'ethdot',
            name: 'ETH/DOT',
            type: 'spot',
            base_unit: 'eth',
            quote_unit: 'dot',
            state: 'enabled',
            position: '104',
            amount_precision: 4,
            price_precision: 4,
            min_price: '0.0001',
            max_price: '0',
            min_amount: '0.0001'
        },
        {
            id: 'wbtcusdt',
            name: 'WBTC/USDT',
            type: 'spot',
            base_unit: 'wbtc',
            quote_unit: 'usdt',
            state: 'enabled',
            position: '100',
            amount_precision: 4,
            price_precision: 4,
            min_price: '0.0001',
            max_price: '0',
            min_amount: '0.0001'
        }
    ]

    expect(reducer(initialMarketsState, saveMarkets(payload))).toEqual({
        ...initialMarketsState,
        marketsLoading: false,
        markets,
    });
});

test('should set current market', () => {
    expect(reducer(initialMarketsState, setCurrentMarket(marketPayload))).toEqual({
        ...initialMarketsState,
        currentMarket: marketPayload,
    });
});

test('should initialize current market on top of empty currentMarket', () => {
    expect(reducer(initialMarketsState, initializeCurrentMarket(marketPayload))).toEqual({
        ...initialMarketsState,
        currentMarket: marketPayload,
    });
});

test('should not change current market if currentMarket exist', () => {
    const fakeState = {
        markets: [],
        filters: {},
        marketsLoading: false,
        currentMarket: {
            id: 'wbtcusdt',
            name: 'WBTC/USDT',
            type: 'spot',
            base_unit: 'wbtc',
            quote_unit: 'usdt',
            state: 'enabled',
            position: '100',
            amount_precision: 4,
            price_precision: 4,
            min_price: '0.0001',
            max_price: '0',
            min_amount: '0.0001'
        }
    }

    expect(reducer(fakeState, initializeCurrentMarket(marketPayload))).toEqual({
        ...initialMarketsState,
        currentMarket: fakeState.currentMarket,
    });
});

test('should update loading state when getMarkets action is dispatched', () => {
    expect(reducer(initialMarketsState, getMarkets())).toEqual({
        ...initialMarketsState,
        marketsLoading: true,
    });
});

test('should update loading state when resetMarketsLoading action is dispatched', () => {
    expect(reducer(initialMarketsState, resetMarketsLoading())).toEqual({
        ...initialMarketsState,
        marketsLoading: false,
    });
});
