import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Market } from './types';
import { buildFilterPrice, FilterPrice } from 'filters/FilterPrice';
import { formatMarkets } from './helpers';

export interface MarketsState {
    markets: Market[];
    currentMarket?: Market;
    filters: {
        [marketID: string]: FilterPrice;
    };
    marketsLoading: boolean;
}

export const initialMarketsState: MarketsState = {
    markets: [],
    filters: {},
    marketsLoading: false,
};

const marketsSlice = createSlice({
    name: 'markets',
    initialState: initialMarketsState,
    reducers: {
        saveMarkets(state, action: PayloadAction<(string | number)[][]>) {
            const list = formatMarkets(action.payload);
            // TODO: implement market filters on BE side
            // const filters = list?.reduce((result: any, market: Market) => {
            //     result[market.id as string] = result[market.id as string] || [];
            //
            //     if (market.filters) {
            //         result[market.id] = market.filters.map(buildFilterPrice);
            //     }
            //
            //     return result;
            // }, {});

            // state.filters = filters;
            state.markets = list;
            state.marketsLoading = false;
        },
        setCurrentMarket(state, action: PayloadAction<Market>) {
            state.currentMarket = action.payload;
        },
        initializeCurrentMarket(state, action: PayloadAction<Market>) {
            if (!state.currentMarket) {
                state.currentMarket = action.payload;
            }
        },
        getMarkets(state) {
            state.marketsLoading = true;
        },
        resetMarketsLoading(state) {
            state.marketsLoading = false;
        },
    },
});

export const { saveMarkets, setCurrentMarket, initializeCurrentMarket, getMarkets, resetMarketsLoading } = marketsSlice.actions;
export default marketsSlice.reducer;
