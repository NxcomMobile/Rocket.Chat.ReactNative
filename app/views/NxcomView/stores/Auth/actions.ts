// redux/auth/authActions.ts
import {
	AuthActionTypes,
	StoredAuthData,
	User
} from './types';

export const loginRequest = () => ({
    type: AuthActionTypes.LOGIN_REQUEST
});

export const loginSuccess = (user: User) => ({
    type: AuthActionTypes.LOGIN_SUCCESS,
    payload: user
});

export const loginGuest = () => ({
    type: AuthActionTypes.LOGIN_GUEST
});

export const loginFailure = (error: string) => ({
    type: AuthActionTypes.LOGIN_FAILURE,
    payload: error
});

export const logout = () => ({ // Đây là action để saga lắng nghe
    type: AuthActionTypes.LOGOUT
});

export const logoutSuccess = () => ({ // Action này có thể được dispatch từ saga sau khi logout thành công
    type: AuthActionTypes.LOGOUT_SUCCESS
});

export const updateAccessToken = (token: string) => ({
    type: AuthActionTypes.UPDATE_ACCESS_TOKEN,
    payload: token
});

export const refreshToken = (userUpdate: Partial<User>) => ({
    type: AuthActionTypes.REFRESH_TOKEN,
    payload: userUpdate
});


// Actions mới cho việc khởi tạo trạng thái xác thực
export const initAuthRequest = () => ({
    type: AuthActionTypes.INIT_AUTH_REQUEST
});

// initAuthSuccess sẽ nhận StoredAuthData (bao gồm user và tokens)
export const initAuthSuccess = (data: StoredAuthData) => ({
    type: AuthActionTypes.INIT_AUTH_SUCCESS,
    payload: data
});

export const initAuthFailure = () => ({
    type: AuthActionTypes.INIT_AUTH_FAILURE
});

// Tập hợp các action creators để dễ dàng import
// Đây là một cách để mô phỏng AuthActions từ createSlice nếu bạn muốn giữ cấu trúc tương tự
export const AuthActions = {
    loginRequest,
    loginSuccess,
    loginGuest,
    loginFailure,
    logout, // Saga sẽ lắng nghe action này
    logoutSuccess, // Saga có thể dispatch action này, reducer sẽ xử lý
    updateAccessToken,
    refreshToken,
    initAuthRequest,
    initAuthSuccess,
    initAuthFailure
};