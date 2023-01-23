import reducer, {
    initialOrderbookState,
    orderbookSubscribe,
    orderbookIncrement,
    orderbookSnapshot,
    orderbookIncrementEmptySnapshot,
    orderBookFetch,
    resetOrderBookLoading,
} from './orderbook';


test('should not update state by random action', () => {
    expect(reducer(initialOrderbookState, { type: 'Random action', payload: 'fake payload' })).toEqual(initialOrderbookState);
});

test('should subscribe orderbook', () => {
    const marketIDPayload = 'market.obi';

    expect(reducer(initialOrderbookState, orderbookSubscribe(marketIDPayload))).toEqual({
        ...initialOrderbookState,
        marketID: marketIDPayload,
    });
});

test('should update orderbook when orderbookIncrement action is dispatched', () => {
    const bidsPayload = [23, "bids", [['10.55', '1.81724'],['11.49', '1.644']]];
    const asksPayload = [198, "asks", [['1.556', '1.81724'],['2.34', '1.644']]];

    expect(reducer(initialOrderbookState, orderbookIncrement(bidsPayload as string[]))).toEqual(
        {
            ...initialOrderbookState,
            sequence: 23,
            asks: [],
            bids: [['11.49', '1.644'],['10.55', '1.81724']],
        }
    );
    expect(reducer(initialOrderbookState, orderbookIncrement(asksPayload as string[]))).toEqual(
        {
            ...initialOrderbookState,
            sequence: 198,
            asks: [['1.556', '1.81724'],['2.34', '1.644']],
            bids: [],
        }
    );
});

test('should update orderbook when orderbookSnapshot action is dispatched', () => {
    const payload = [
        198,
        [['15.0', '16.969489754175868'], ['20.0', '95.46948975417587'], ['20.5', '25.469489754175868'], ['30.0', '16.469489754175868']],
        [['10.95', '16.969489754175868'], ['10.90', '60.46948975417587'], ['10.85', '50.46948975417587'], ['10.70', '25.469489754175868']],
    ];
    const result = {
        ...initialOrderbookState,
        sequence: 198,
        asks: [['15.0', '16.969489754175868'], ['20.0', '95.46948975417587'], ['20.5', '25.469489754175868'], ['30.0', '16.469489754175868']],
        bids: [['10.95', '16.969489754175868'], ['10.90', '60.46948975417587'], ['10.85', '50.46948975417587'], ['10.70', '25.469489754175868']],
    };

    expect(reducer(initialOrderbookState, orderbookSnapshot(payload as any[]))).toEqual(result);
});

test('should empty orderbook', () => {
    expect(reducer(initialOrderbookState, orderbookIncrementEmptySnapshot())).toEqual({
        ...initialOrderbookState,
        asks: [],
        bids: [],
    });
});

test('should fetch orderbook', () => {
    expect(reducer(initialOrderbookState, orderBookFetch())).toEqual({
        ...initialOrderbookState,
        orderbookLoading: true,
    });
});

test('should reset orderbook loading', () => {
    expect(reducer(initialOrderbookState, resetOrderBookLoading())).toEqual({
        ...initialOrderbookState,
        orderbookLoading: false,
    });
});
