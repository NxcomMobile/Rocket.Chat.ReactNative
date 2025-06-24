// redux/auth/authSlice.ts
import {
	createSlice,
	PayloadAction
} from '@reduxjs/toolkit';

import { AuthState } from './types';

const initialState: AuthState = {
    user: null,
    isAuthenticated: false,
    loaded: false,
    error: null,
    isLoading: false,
    accessToken: '',
    role: 'guest'
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        loginRequest: (state) => {
            state.isLoading = true;
            // state.error = null;
        },
        loginSuccess: (state, action: PayloadAction<any>) => {
            state.user = action.payload;
            state.isAuthenticated = true;
            state.isLoading = false;
            state.loaded = true;
            state.error = null;
            state.role = 'user'
        },
        loginGuest: (state) => {
            state.user = {
                email: '',
                email_verified: false,
                family_name: 'Guest',
                given_name: 'Guest',
                name: 'Guest',
                preferred_username: 'Guest',
                sub: ''
            };
            state.isAuthenticated = false;
            state.isLoading = false;
            state.loaded = true;
            state.error = null;
            state.role = 'guest';
        },
        loginFailure: (state, action: PayloadAction<string>) => {
            state.loaded = true;
            state.isLoading = false;
            state.error = action.payload;
        },
        logout: (state) => {
            state.user = null;
            state.loaded = true;
            state.isAuthenticated = false;
            state.role = 'guest'
        },
        updateAccessToken: (state, action: PayloadAction<string>) => {
            // console.log('updateAccessToken', action.payload);
            state.accessToken = action.payload
        },
        refreshToken: (state, action: PayloadAction<Partial<any>>) => {
            if (state.user) {
                state.user = { ...state.user, ...action.payload };
            }
        }
    }
});
export const AuthActions = authSlice.actions;
export const { loginRequest, loginSuccess, loginFailure, logout, refreshToken } =
    authSlice.actions;
export default authSlice.reducer;