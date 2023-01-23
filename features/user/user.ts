import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from './types';

export interface UserState {
    user: User;
    userLoading: boolean;
}

const initialUserState: UserState = {
    user: {
        created_at: '',
        email: '',
        email_change_confirm_status: 0,
        id: '',
        last_sign_in_at: '',
        phone: '',
        role: '',
        updated_at: '',
    },
    userLoading: false,
};

const userSlice = createSlice({
    name: 'user',
    initialState: initialUserState,
    reducers: {
        setUser(state, action: PayloadAction<User>) {
            state.user = action.payload;
        },
        getUser(state) {
            state.userLoading = true;
        },
        resetUserLoading(state) {
            state.userLoading = false;
        },
    },
});

export const { setUser, getUser, resetUserLoading } = userSlice.actions;
export default userSlice.reducer;
