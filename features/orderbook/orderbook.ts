import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { MarketID } from 'features/markets/types';
import { OrderbookUpdatePayload } from './types';
import { handleOrderbookIncrementUpdateData, sliceArray } from 'helpers';
import Config from 'configs/app';
import { formatOrderbookInc, formatOrderbookSnap } from './helpers';

export interface OrderbookState {
    marketID?: MarketID;
    asks: string[][];
    bids: string[][];
    sequence: number | null;
    timestamp?: number | string;
    orderbookLoading: boolean;
}

export const initialOrderbookState: OrderbookState = {
    asks: [],
    bids: [],
    sequence: null,
    orderbookLoading: false,
};
// [3, "market.obi", [1, "asks", ["10", "1"]]]
const orderbookSlice = createSlice({
    name: 'orderbook',
    initialState: initialOrderbookState,
    reducers: {
        orderbookSubscribe(state, action: PayloadAction<string>) {
            state.marketID = action.payload;
        },
        orderbookIncrement(state, action: PayloadAction<string[]>) {
            const formatedDataInc = formatOrderbookInc(action.payload);

            state.sequence = formatedDataInc.sequence;

            if (formatedDataInc.asks) {
                state.asks = handleOrderbookIncrementUpdateData('asks', formatedDataInc.asks, state);
            }

            if (formatedDataInc.bids) {
                state.bids = handleOrderbookIncrementUpdateData('bids', formatedDataInc.bids, state);
            }
        },
        orderbookSnapshot(state, action: PayloadAction<any[]>) {
            const formatedDataSnap = formatOrderbookSnap(action.payload);

            state.asks = sliceArray(formatedDataSnap.asks, Config.orderBookSideLimit);
            state.bids = sliceArray(formatedDataSnap.bids, Config.orderBookSideLimit);
            state.sequence = formatedDataSnap.sequence;
            state.orderbookLoading = false;
        },
        orderbookIncrementEmptySnapshot(state) {
            state.asks = [];
            state.bids = [];
        },
        orderBookFetch(state) {
            state.orderbookLoading = true;
        },
        resetOrderBookLoading(state) {
            state.orderbookLoading = false;
        },
    },
});

export const {
    orderbookSubscribe,
    orderbookIncrement,
    orderbookSnapshot,
    orderbookIncrementEmptySnapshot,
    orderBookFetch,
    resetOrderBookLoading,
} = orderbookSlice.actions;
export default orderbookSlice.reducer;
