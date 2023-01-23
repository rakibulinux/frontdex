import { Balance } from '@openware/react-opendax/build';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { formatBalances } from './helpers';

export interface BalancesState {
    balances: Balance[];
    loading: boolean;
}

export const initialBalancesState: BalancesState = {
    balances: [],
    loading: true,
};

const balancesSlice = createSlice({
    name: 'balances',
    initialState: initialBalancesState,
    reducers: {
        updateBalances(state, action: PayloadAction<string[][]>) {
            state.balances = formatBalances(action.payload);
            state.loading = false;
        },
    },
});

export const { updateBalances } = balancesSlice.actions;
export default balancesSlice.reducer;
