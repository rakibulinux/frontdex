import reducer, {
    initialKLineState,
    klineSave,
    klinePush,
    klineUpdateTimeRange,
    klineUpdatePeriod,
    klineSubscribe,
    klineUnsubscribe,
    klineFetch,
    resetKlineLoading,
} from './kline';

test('should not change state in case of some random action', () => {
    expect(reducer(initialKLineState, { type: 'Random action', payload: 'Fake Data' })).toEqual(initialKLineState);
});

test('should not change state in case of some random action when state is not initial', () => {
    const klineState = {
        last: undefined,
        marketId: undefined,
        period: undefined,
        message: undefined,
        data: [],
        range: {
            from: 1634702400,
            to: 2114355600,
        },
        kLineLoading: false,
    }

    expect(reducer(klineState, { type: 'Random action', payload: 'Fake Data' })).toEqual(klineState);
});

test('should successfuly dispatch save kline', () => {
    const fakeKline = [
        [
            1634794200,
            8.182858402905623,
            8.266191736238957,
            7.968875168893649,
            8.052208502226982,
            54.5714600726406,
        ],
        [
            1634794200,
            8.182858402905623,
            8.266191736238957,
            7.968875168893649,
            8.052208502226982,
            54.5714600726406,
        ],
    ];

    expect(reducer(initialKLineState, klineSave(fakeKline))).toEqual({
        ...initialKLineState,
        data: fakeKline,
        kLineLoading: false,
    });
});

test('should push kline', () => {
    const payload = {
        marketId: 'btcusd',
        kline: [
            1634807700,
            6.495457625520311,
            6.578790958853644,
            6.329163459144082,
            6.412496792477415,
            12.386440638007773,
            12.386440638007773,
        ],
        period: '15m',
    };
    expect(reducer(initialKLineState, klinePush(payload))).toEqual({
        ...initialKLineState,
        marketId: 'btcusd',
        period: '15m',
        last: {
            time: 1634807700000,
            open: 6.495457625520311,
            high: 6.578790958853644,
            low: 6.329163459144082,
            close: 6.412496792477415,
            volume: 12.386440638007773,
            avg: 12.386440638007773,
        }
    });
});

test('should update kline time range', () => {
    const payload = {
        from: 1634702400,
        to: 2114355600,
    };
    expect(reducer(initialKLineState, klineUpdateTimeRange(payload))).toEqual({
        ...initialKLineState,
        range: payload,
    });
});

test('should update kline period', () => {
    const payload = '1h';

    expect(reducer(initialKLineState, klineUpdatePeriod(payload))).toEqual({
        ...initialKLineState,
        period: payload,
    });
});

test('should subscribe kline', () => {
    const payload = {
        marketId: 'btcusd',
        period: '15m',
    };

    expect(reducer(initialKLineState, klineSubscribe(payload))).toEqual({
        ...initialKLineState,
        marketId: 'btcusd',
        period: '15m',
        message: 'subscribe',
    });
});

test('should unsubscribe kline', () => {
    const payload = {
        marketId: 'ethbtc',
        period: '4h',
    };

    expect(reducer(initialKLineState, klineUnsubscribe(payload))).toEqual({
        ...initialKLineState,
        marketId: 'ethbtc',
        period: '4h',
        message: 'unsubscribe',
    });
});

test('should fetch kline', () => {
    expect(reducer(initialKLineState, klineFetch())).toEqual({
        ...initialKLineState,
        kLineLoading: true,
    });
});

test('should reset kline loading', () => {
    expect(reducer(initialKLineState, resetKlineLoading())).toEqual({
        ...initialKLineState,
        kLineLoading: false,
    });
});
