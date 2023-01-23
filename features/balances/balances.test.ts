import reducer, { initialBalancesState, updateBalances } from './balances';

test('should not change state in case of some random action with default balances state', () => {
    expect(reducer(initialBalancesState, { type: 'Random action', payload: 10 })).toEqual({
        balances: [],
        loading: true,
    });
});

test('should not change state in case of some random action when state is already changed', () => {
    const fakeBalancesState = {
        loading: false,
        balances: [
            {
                symbol: 'btc',
                balance: 0.8,
                locked: 0.1,
            },
        ],
    };
    const someFakeData = 'Fake data';
    expect(reducer(fakeBalancesState, { type: 'Random action', payload: someFakeData })).toEqual({
        loading: false,
        balances: [
            {
                symbol: 'btc',
                balance: 0.8,
                locked: 0.1,
            },
        ],
    });
});

test('should change list value when updateBalances action is dispatched', () => {
    const fakeBalanceData = [
        ["eth", "1000000000", "0"],
        ["usd", "999999999", "0"],
    ];

    expect(reducer(initialBalancesState, updateBalances(fakeBalanceData))).toEqual({
        loading: false,
        balances: [
            {
                symbol: 'eth',
                balance: 1000000000,
                locked: 0,
            },
            {
                symbol: 'usd',
                balance: 999999999,
                locked: 0,
            },
        ],
    });
});
