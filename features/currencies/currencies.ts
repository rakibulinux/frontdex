import { Currency } from '@openware/react-opendax/build';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { formatCurrencies } from './helpers';

export interface CurrenciesState {
    list: Currency[];
    loading: boolean;
}

const initialState: CurrenciesState = {
    list: [],
    loading: true,
};

const currenciesSlice = createSlice({
    name: 'currencies',
    initialState,
    reducers: {
        saveCurrencies(state, action: PayloadAction<string[][]>) {
            state.list = formatCurrencies(action.payload);
            state.loading = false;
        },
    },
});

export const { saveCurrencies } = currenciesSlice.actions;
export default currenciesSlice.reducer;
