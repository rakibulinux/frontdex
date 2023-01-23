import { Balance, Currency, DEFAULT_CCY_PRECISION, Wallet } from '@openware/react-opendax/build';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface WalletsState {
    wallets: Wallet[];
    loading: boolean;
}

const initialState: WalletsState = {
    wallets: [],
    loading: true,
};

const walletsSlice = createSlice({
    name: 'wallets',
    initialState,
    reducers: {
        saveWallets(state, action: PayloadAction<{ balances: Balance[], currencies: Currency[]}>) {
            state.loading = false;
            state.wallets = action.payload.balances.map(b => {
                const curInfo: Currency | undefined = action.payload.currencies.find(c => c.id === b.symbol);
 
                return {
                    ...b,
                    address: curInfo?.address || "",
                    decimal: curInfo?.decimal || DEFAULT_CCY_PRECISION,
                };
            });
        }
    },
});

export const { saveWallets } = walletsSlice.actions;
export default walletsSlice.reducer;
