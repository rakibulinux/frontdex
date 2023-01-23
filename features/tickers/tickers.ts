import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { formatTicker } from './helpers';
import { Ticker } from './types';

export interface TickersState {
    tickers: {
        [pair: string]: Ticker;
    };
}

export const initialTickersState: TickersState = {
    tickers: {},
};

const tickersSlice = createSlice({
    name: 'tickers',
    initialState: initialTickersState,
    reducers: {
        setTickers(state, action: PayloadAction<string[][]>) {
            state.tickers = formatTicker(action.payload);
        },
    },
});

export const { setTickers } = tickersSlice.actions;
export default tickersSlice.reducer;
