import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { klineArrayToObject } from 'helpers';
import { KlineTimeRange, KlineEvent, WSRawElement, KlineChangeSubscription } from './types';

export interface KlineState {
    data: any;
    kLineLoading: boolean;
    last?: KlineEvent;
    marketId?: string;
    period?: string;
    range: KlineTimeRange;
    message?: string;
}

export const initialKLineState: KlineState = {
    last: undefined,
    marketId: undefined,
    period: undefined,
    message: undefined,
    data: [],
    range: {
        from: 0,
        to: 0,
    },
    kLineLoading: false,
};

const klineSlice = createSlice({
    name: 'kline',
    initialState: initialKLineState,
    reducers: {
        klineSave(state, action: PayloadAction<any[]>) {
            state.data = action.payload;
            state.kLineLoading = false;
        },
        klinePush(state, action: PayloadAction<{ kline: WSRawElement[], marketId: string, period: string }>) {
            state.marketId = action.payload.marketId;
            state.period = action.payload.period;
            state.last = klineArrayToObject(action.payload.kline);
        },
        klineUpdateTimeRange(state, action: PayloadAction<KlineTimeRange>) {
            state.range = action.payload;
        },
        klineUpdatePeriod(state, action: PayloadAction<string>) {
            state.period = action.payload;
        },
        klineSubscribe(state, action: PayloadAction<KlineChangeSubscription>) {
            state.marketId = action.payload.marketId;
            state.period = action.payload.period;
            state.message = 'subscribe';
        },
        klineUnsubscribe(state, action: PayloadAction<KlineChangeSubscription>) {
            state.marketId = action.payload.marketId;
            state.period = action.payload.period;
            state.message = 'unsubscribe';
        },
        klineFetch(state) {
            state.kLineLoading = true;
        },
        resetKlineLoading(state) {
            state.kLineLoading = false;
        },
    },
});

export const {
    klinePush,
    klineUpdateTimeRange,
    klineUpdatePeriod,
    klineSubscribe,
    klineUnsubscribe,
    klineSave,
    klineFetch,
    resetKlineLoading,
} = klineSlice.actions;
export default klineSlice.reducer;
