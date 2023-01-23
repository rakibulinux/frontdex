import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface OrderState {
    currentPrice: string;
}

export const initialOrderState: OrderState = {
    currentPrice: '',
};

const orderSlice = createSlice({
    name: 'order',
    initialState: initialOrderState,
    reducers: {
        setCurrentPrice(state, action: PayloadAction<string>) {
            state.currentPrice = action.payload;
        },
        // TODO: create_order response returns 'uuid' of order, WS can write it here to state
    },
});

export const { setCurrentPrice } = orderSlice.actions;
export default orderSlice.reducer;
