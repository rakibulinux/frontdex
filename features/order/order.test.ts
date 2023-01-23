import reducer, { initialOrderState, setCurrentPrice } from './order';

test('should not change state in case of some random action', () => {
    expect(reducer(initialOrderState, { type: 'Random action', payload: 'random fake payload', })).toEqual({
        currentPrice: '',
    });
});

test('should successfully update currentPrice in the store', () => {
    expect(reducer(initialOrderState, setCurrentPrice('10'))).toEqual({
        currentPrice: '10',
    });
});
