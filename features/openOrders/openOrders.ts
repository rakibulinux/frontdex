import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { formatOpenOrders, insertOrUpdate, orderArrayToObject } from './helpers';
import { OrderCommon } from 'features/order/types';
import { sliceArray } from 'helpers';
import Config from 'configs/app';

export interface OpenOrdersState {
    list: OrderCommon[];
    openOrdersLoading: boolean;
}

export const initialOpenOrdersState: OpenOrdersState = {
    list: [],
    openOrdersLoading: false,
};

const openOrdersSlice = createSlice({
    name: 'openOrders',
    initialState: initialOpenOrdersState,
    reducers: {
        saveOpenOrders(state, action: PayloadAction<string[][]>) {
            state.list = formatOpenOrders(action.payload);
            state.openOrdersLoading = false;
        },
        updateOpenOrders(state, action: PayloadAction<string[]>) {
            state.list = sliceArray(insertOrUpdate(state.list, orderArrayToObject(action.payload)), Config.defaultStorageLimit);
        },
        openOrdersFetch(state) {
            state.openOrdersLoading = true;
        },
        resetOpenOrdersLoading(state) {
            state.openOrdersLoading = false;
        },
    },
});

export const { openOrdersFetch, saveOpenOrders, updateOpenOrders, resetOpenOrdersLoading } = openOrdersSlice.actions;
export default openOrdersSlice.reducer;
