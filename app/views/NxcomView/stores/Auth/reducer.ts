// File: app/views/NxcomView/stores/Auth/reducer.ts

import {
    AuthAction,
    AuthActionTypes,
    AuthState
} from './types';

const initialState: AuthState = {
    user: null,
    isAuthenticated: false,
    isLoading: false, // Ban đầu không loading
    error: null,
    accessToken: '',
    role: 'guest',
    loaded: false // QUAN TRỌNG: Ban đầu là false, sẽ thành true sau khi initAuthSaga chạy
};

const authReducer = (state: AuthState = initialState, action: AuthAction): AuthState => {
    switch (action.type) {
        case AuthActionTypes.INIT_AUTH_REQUEST:
            return {
                ...state,
                isLoading: true, // Cho biết đang kiểm tra SecureStore
                loaded: false,
                error: null
            };
        case AuthActionTypes.INIT_AUTH_SUCCESS:
            // Khôi phục trạng thái từ SecureStore
            return {
                ...state,
                user: action.payload.user,
                accessToken: action.payload.accessToken,
                // refreshToken: action.payload.refreshToken, // Nếu bạn quản lý trong state
                isAuthenticated: true,
                isLoading: false,
                loaded: true, // Đánh dấu đã hoàn tất quá trình khôi phục
                error: null,
                role: action.payload.user ? 'user' : 'guest'
            };
        case AuthActionTypes.INIT_AUTH_FAILURE:
            // Không có dữ liệu hoặc lỗi khi đọc, coi như chưa đăng nhập
            return {
                ...state,
                user: null,
                isAuthenticated: false,
                isLoading: false,
                loaded: true, // Đánh dấu đã hoàn tất quá trình khôi phục
                accessToken: '',
                // refreshToken: undefined,
                error: null, // Có thể không set lỗi ở đây nếu chỉ đơn giản là không có dữ liệu
                role: 'guest'
            };
        case AuthActionTypes.LOGIN_REQUEST:
            return {
                ...state,
                isLoading: true,
                error: null
            };
        case AuthActionTypes.LOGIN_SUCCESS:
            // Saga đã lưu token và user vào SecureStore
            // Reducer này cập nhật state từ user info.
            // accessToken sẽ được cập nhật riêng qua UPDATE_ACCESS_TOKEN nếu cần thiết
            // hoặc đã được cập nhật sẵn nếu là lần đầu đăng nhập (do initAuthSuccess).
            return {
                ...state,
                user: action.payload, // LOGIN_SUCCESS chỉ mang payload là User
                isAuthenticated: true,
                isLoading: false,
                error: null,
                role: 'user'
                // `loaded` không thay đổi ở đây, nó chỉ liên quan đến lần init đầu tiên
            };
        case AuthActionTypes.LOGIN_GUEST:
            return {
                ...state,
                user: { /* ... thông tin guest user ... */
                    email: '',
                    email_verified: false,
                    // family_name: 'Guest',
                    // given_name: 'Guest',
                    name: 'Guest',
                    preferred_username: 'Guest',
                    sub: ''
                },
                isAuthenticated: false,
                isLoading: false,
                loaded: true, // Nếu login guest, coi như đã init xong
                accessToken: '',
                error: null,
                role: 'guest'
            };
        case AuthActionTypes.LOGIN_FAILURE:
            return {
                ...state,
                isLoading: false,
                error: action.payload,
                isAuthenticated: false,
                user: null,
                accessToken: '', // Xóa accessToken khi login thất bại
                role: 'guest'
            };
        case AuthActionTypes.LOGOUT:
            return {
                ...state,
                isLoading: true // Có thể cho loading khi bắt đầu logout
            };
        case AuthActionTypes.LOGOUT_SUCCESS:
            // Reset về gần như initialState, nhưng giữ lại 'loaded: true'
            return {
                ...initialState, // Reset user, isAuthenticated, error, accessToken, role
                loaded: true // Đã từng load, giờ logout
            };
        case AuthActionTypes.UPDATE_ACCESS_TOKEN:
            // Action này được saga gọi sau khi có token (cả login và init)
            return {
                ...state,
                accessToken: action.payload
            };
        case AuthActionTypes.REFRESH_TOKEN:
            return {
                ...state,
                user: state.user ? { ...state.user, ...action.payload } : null
            };
        default:
            return state;
    }
};

export default authReducer;
