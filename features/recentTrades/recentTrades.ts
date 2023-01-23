import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PublicTrade, RecentTradePushPayload } from './types';
import { convertTradeEventToTrade, convertTradeEventList, extendTradeWithPriceChange, sliceArray } from 'helpers';
import Config from 'configs/app';

export interface RecentTradesState {
    list: PublicTrade[];
    lastTrade?: PublicTrade;
}

export const initialRecentTradesState: RecentTradesState = {
    list: [],
};

const recentTradesSlice = createSlice({
    name: 'recentTrades',
    initialState: initialRecentTradesState,
    reducers: {
        recentTradePush(state, action: PayloadAction<RecentTradePushPayload>) {
            const lastTrades = convertTradeEventList(action.payload.market, action.payload.trades);
            const updatedList = [
                ...lastTrades,
                ...state.list,
            ];

            state.list = sliceArray(updatedList, Config.defaultStorageLimit);
            state.lastTrade = extendTradeWithPriceChange(updatedList?.[0], updatedList?.[1]);
        }
    },
});

export const { recentTradePush } = recentTradesSlice.actions;
export default recentTradesSlice.reducer;
