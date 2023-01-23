import reducer, { initialTickersState, setTickers } from './tickers';

test('should not change state in case of some random action', () => {
    expect(reducer(initialTickersState, { type: 'Random action', payload: 'fake payload' })).toEqual(initialTickersState);
});

test('should update tickers', () => {
    const payload = [
        [
            "btcusd",
            14.701417290480794,
            1634798092.462,
            0.13133266112829511,
            0.14211370047464766,
            0.000980094486032053,
            0.13672151196616128,
            10,
            "+3.94%",
            0
        ],
        [
            "ethusd",
            15.293726190991649,
            1634798092.462,
            0.13662395397285873,
            0.1478393531795859,
            0.0010195817460661098,
            0.131426440809692,
            10,
            "-3.95%",
            0
        ]
    ];
    const expected = {
        btcusd: {
            name: 'btcusd',
            at: 14.701417290480794,
            amount: 1634798092.462,
            avg_price: 0.13133266112829511,
            high: 0.14211370047464766,
            last: 0.000980094486032053,
            low: 0.13672151196616128,
            open: 10,
            price_change_percent:"+3.94%",
            volume: 0
        },
        ethusd: {
            name: 'ethusd',
            at: 15.293726190991649,
            amount: 1634798092.462,
            avg_price: 0.13662395397285873,
            high: 0.1478393531795859,
            last: 0.0010195817460661098,
            low: 0.131426440809692,
            open: 10,
            price_change_percent: "-3.95%",
            volume: 0,
        },
    };
    expect(reducer(initialTickersState, setTickers(payload as string[][]))).toEqual({
        ...initialTickersState,
        tickers: expected,
    });
});
