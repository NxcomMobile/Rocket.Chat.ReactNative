// redux/auth/authTypes.ts (Giữ lại phần enum và các interfaces)

export interface User {
    sub: string; // Bắt buộc, dùng làm ID định danh user
    name?: string;
    preferred_username?: string;
    email?: string;
    email_verified?: boolean;
}

export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    loaded: boolean;
    error: string | null;
    isLoading: boolean;
    accessToken: string;
    role: 'user' | 'guest';
}

// Interface cho token response từ keycloak_service để saga dễ làm việc
// (Nếu keycloakLogin trả về kiểu này)
export interface KeycloakTokenResponseForSaga {
    accessToken: string;
    expiresIn?: number;
    idToken?: string;
    issuedAt?: number;
    refreshToken?: string;
    scope?: string;
    tokenType?: string;
    [ key: string ]: any; // Cho phép các trường khác
}
// Interface cho dữ liệu sẽ được lưu vào SecureStore (kết hợp token và user)
export interface StoredAuthData {
    user: User;
    accessToken: string;
    refreshToken?: string; // Tùy chọn
    // Bạn có thể thêm các trường khác từ KeycloakTokenResponse nếu cần, ví dụ: expiresIn, idToken
    // Ví dụ: idToken?: string;
    // accessTokenExpiresAt?: number; // Thời điểm accessToken hết hạn (timestamp)
}

// Đây là phần quan trọng cho Redux truyền thống
export enum AuthActionTypes {
    LOGIN_REQUEST = 'auth/LOGIN_REQUEST',
    LOGIN_SUCCESS = 'auth/LOGIN_SUCCESS',
    LOGIN_FAILURE = 'auth/LOGIN_FAILURE',
    LOGOUT = 'auth/LOGOUT',
    LOGOUT_SUCCESS = 'auth/LOGOUT_SUCCESS', // Thêm nếu cần xử lý sau khi logout thành công trong reducer
    UPDATE_ACCESS_TOKEN = 'auth/UPDATE_ACCESS_TOKEN',
    REFRESH_TOKEN = 'auth/REFRESH_TOKEN',
    LOGIN_GUEST = 'auth/LOGIN_GUEST', // Thêm action type cho loginGuest

    // Action types mới cho việc khởi tạo trạng thái xác thực
    INIT_AUTH_REQUEST = 'auth/INIT_AUTH_REQUEST',
    INIT_AUTH_SUCCESS = 'auth/INIT_AUTH_SUCCESS', // Khi khôi phục thành công
    INIT_AUTH_FAILURE = 'auth/INIT_AUTH_FAILURE'  // Khi không có dữ liệu hoặc lỗi
}

export interface LoginRequestAction {
    type: AuthActionTypes.LOGIN_REQUEST;
}

export interface LoginSuccessAction {
    type: AuthActionTypes.LOGIN_SUCCESS;
    payload: User;
}

export interface LoginFailureAction {
    type: AuthActionTypes.LOGIN_FAILURE;
    payload: string;
}

export interface LogoutAction {
    type: AuthActionTypes.LOGOUT;
}

export interface LogoutSuccessAction { // Nếu bạn muốn có action riêng cho logout success
    type: AuthActionTypes.LOGOUT_SUCCESS;
}

export interface UpdateAccessTokenAction {
    type: AuthActionTypes.UPDATE_ACCESS_TOKEN;
    payload: string;
}

export interface RefreshTokenAction {
    type: AuthActionTypes.REFRESH_TOKEN;
    payload: Partial<User>; // Giả sử payload là một phần của User
}

export interface LoginGuestAction {
    type: AuthActionTypes.LOGIN_GUEST;
}


// Union type cho tất cả các hành động xác thực
// Payload của INIT_AUTH_SUCCESS sẽ là StoredAuthData đã được khôi phục
// Định nghĩa cho các action mới
export interface InitAuthRequestAction {
    type: AuthActionTypes.INIT_AUTH_REQUEST;
}

// Payload của INIT_AUTH_SUCCESS sẽ là StoredAuthData đã được khôi phục
export interface InitAuthSuccessAction {
    type: AuthActionTypes.INIT_AUTH_SUCCESS;
    payload: StoredAuthData;
}

export interface InitAuthFailureAction {
    type: AuthActionTypes.INIT_AUTH_FAILURE;
}

// Cập nhật AuthAction union type
export type AuthAction =
    | { type: AuthActionTypes.LOGIN_REQUEST }
    | { type: AuthActionTypes.LOGIN_SUCCESS; payload: User } // Payload hiện tại chỉ là User
    | { type: AuthActionTypes.LOGIN_GUEST }
    | { type: AuthActionTypes.LOGIN_FAILURE; payload: string }
    | { type: AuthActionTypes.LOGOUT }
    | { type: AuthActionTypes.LOGOUT_SUCCESS }
    | { type: AuthActionTypes.UPDATE_ACCESS_TOKEN; payload: string }
    | { type: AuthActionTypes.REFRESH_TOKEN; payload: Partial<User> } // Giả sử
    | InitAuthRequestAction
    | InitAuthSuccessAction
    | InitAuthFailureAction;