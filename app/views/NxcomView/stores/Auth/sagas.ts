import * as AuthSession from 'expo-auth-session'; // Cần cho kiểu TokenResponse trong initAuthSaga
// File: app/views/NxcomView/stores/Auth/sagas.ts
import {
    all,
    call,
    put,
    takeLatest
} from 'redux-saga/effects';

import { SecureKey } from '../../constants/enum';
import secureService from '../../helper/secure_store';
import gwServices from '../../service/gw_service';
import keycloakServices from '../../service/keycloak_service';
import * as AuthActions from './actions';
import {
    AuthActionTypes,
    KeycloakTokenResponseForSaga,
    StoredAuthData,
    User
} from './types';

// AUTH_DATA_KEY không còn được sử dụng khi lưu trữ các key riêng lẻ.
// const AUTH_DATA_KEY = SecureKey.KEYCLOAK_AUTH;

/**
 * Saga xử lý yêu cầu đăng nhập.
 * - Gọi keycloakServices.keycloakLogin để lấy tokens.
 * - Gọi keycloakServices.fetchUserInfo để lấy thông tin người dùng (phiên bản lean).
 * - Lưu trữ user, accessToken, và refreshToken (nếu có) vào các key riêng biệt trong SecureStore.
 * - Dispatch AuthActions.loginSuccess với user info và AuthActions.updateAccessToken với token mới.
 */
function* loginSaga(_action: ReturnType<typeof AuthActions.loginRequest>): Generator<any, void, any> {
    console.log('[AuthSaga] loginSaga triggered');
    try {
        const tokens: KeycloakTokenResponseForSaga | null = yield call(keycloakServices.keycloakLogin);
        console.log('[AuthSaga] Keycloak Tokens received:', tokens ? `accessToken: ${!!tokens.accessToken}` : 'No tokens object');

        if (tokens && tokens.accessToken) {
            // fetchUserInfo trả về User (lean version)
            const user: User | null = yield call(keycloakServices.fetchUserInfo, tokens.accessToken);
            console.log('[AuthSaga] User Info fetched:', user ? user.name : 'No user info');

            if (user) {
                // Lưu trữ từng phần riêng biệt vào SecureStore
                yield call(secureService.saveToSecureStore, SecureKey.KEYCLOAK_USER_INFO, JSON.stringify(user));
                yield call(secureService.saveToSecureStore, SecureKey.KEYCLOAK_ACCESS_TOKEN, JSON.stringify(tokens.accessToken));
                if (tokens.refreshToken) {
                    yield call(secureService.saveToSecureStore, SecureKey.KEYCLOAK_REFRESH_TOKEN, JSON.stringify(tokens.refreshToken));
                } else {
                    // Nếu không có refreshToken mới, xóa refreshToken cũ (nếu có) khỏi SecureStore
                    yield call(secureService.deleteFromSecureStore, SecureKey.KEYCLOAK_REFRESH_TOKEN);
                }
                // Cân nhắc lưu trữ các thông tin khác như idToken hoặc thời gian hết hạn nếu cần
                // if (tokens.idToken) {
                //     yield call(secureService.saveToSecureStore, SecureKey.KEYCLOAK_ID_TOKEN, JSON.stringify(tokens.idToken));
                // }
                // if (tokens.issuedAt && tokens.expiresIn) { // Ví dụ tính toán và lưu thời gian hết hạn
                //     const accessTokenExpiresAt = (tokens.issuedAt + tokens.expiresIn) * 1000; // Chuyển sang mili giây
                //     yield call(secureService.saveToSecureStore, SecureKey.KEYCLOAK_ACCESS_TOKEN_EXPIRES_AT, JSON.stringify(accessTokenExpiresAt));
                // }
                console.log('[AuthSaga] Auth data (user, accessToken, refreshToken) saved to SecureStore under individual keys.');

                yield put(AuthActions.loginSuccess(user)); // Dispatch thông tin user (lean)
                yield put(AuthActions.updateAccessToken(tokens.accessToken)); // Dispatch accessToken mới
            } else {
                console.error('[AuthSaga] Failed to fetch user information after obtaining tokens.');
                yield put(AuthActions.loginFailure('Không thể lấy thông tin người dùng.'));
            }
        } else {
            // Xử lý trường hợp keycloakLogin trả về null hoặc object token không hợp lệ
            if (!tokens) {
                console.error('[AuthSaga] Login failed: No tokens object received from keycloakLogin service.');
                yield put(AuthActions.loginFailure('Đăng nhập thất bại: không nhận được token từ dịch vụ.'));
                return;
            }
            console.error('[AuthSaga] Login failed: Tokens object received but accessToken is missing.');
            yield put(AuthActions.loginFailure('Đăng nhập thất bại: token không hợp lệ.'));
        }
    } catch (error: any) {
        console.error('[AuthSaga] Error during login process (loginSaga):', error.message, error);
        const errorMessage = error.message || 'Lỗi không xác định trong quá trình đăng nhập.';
        yield put(AuthActions.loginFailure(errorMessage));
    }
}

/**
 * Saga xử lý yêu cầu đăng xuất.
 * - Gọi keycloakServices.keycloakLogout (đã bao gồm việc xóa các key khỏi SecureStore).
 * - Gọi gwServices.client_logout (nếu có).
 * - Dispatch AuthActions.logoutSuccess.
 */
function* logoutSaga(_action: ReturnType<typeof AuthActions.logout>): Generator<any, void, any> {
    console.log('[AuthSaga] logoutSaga triggered');
    try {
        yield call(keycloakServices.keycloakLogout); // Hàm này đã được cập nhật để xóa các key riêng lẻ
        if (gwServices && typeof gwServices.client_logout === 'function') { // Kiểm tra nếu gwServices và hàm tồn tại
            yield call(gwServices.client_logout);
        }
        yield put(AuthActions.logoutSuccess());
        console.log('[AuthSaga] Logout successful, SecureStore keys cleared, Redux state reset.');
    } catch (error: any) {
        console.error('[AuthSaga] Error during logout (logoutSaga):', error.message, error);
        // Ngay cả khi có lỗi, vẫn dispatch logoutSuccess để đảm bảo state được reset
        yield put(AuthActions.logoutSuccess());
    }
}

/**
 * Saga để khởi tạo trạng thái xác thực khi ứng dụng khởi động.
 * - Đọc user, accessToken, refreshToken từ các key riêng biệt trong SecureStore.
 * - Nếu có refreshToken và user: thử làm mới token.
 * - Nếu thành công: fetch lại user info, lưu token mới và user info mới, dispatch INIT_AUTH_SUCCESS.
 * - Nếu thất bại: xóa auth data, dispatch INIT_AUTH_FAILURE.
 * - Nếu không có refreshToken nhưng có accessToken và user: thử xác thực accessToken cũ.
 * - Nếu thành công: dispatch INIT_AUTH_SUCCESS với dữ liệu cũ (user có thể đã được cập nhật).
 * - Nếu thất bại: xóa auth data, dispatch INIT_AUTH_FAILURE.
 * - Nếu không có đủ dữ liệu: dispatch INIT_AUTH_FAILURE.
 */
function* initAuthSaga(): Generator<any, void, any> {
    console.log('[AuthSaga] initAuthSaga - Bắt đầu khởi tạo xác thực');
    try {
        // Sử dụng hàm getStoredAuthData đã được cập nhật để đọc các key riêng lẻ
        const storedAuthData: StoredAuthData | null = yield call(keycloakServices.getStoredAuthData);

        if (storedAuthData && storedAuthData.user) { // Cần có user để tiếp tục
            const { user: storedUser, accessToken: storedAccessToken, refreshToken: storedRefreshToken } = storedAuthData;
            console.log('[AuthSaga] initAuthSaga - Đã tải StoredAuthData. User:', storedUser.name, 'Has RefreshToken:', !!storedRefreshToken);

            if (storedRefreshToken) {
                console.log('[AuthSaga] initAuthSaga - Tìm thấy refreshToken, thử làm mới token...');
                const newTokens: AuthSession.TokenResponse | null = yield call(
                    keycloakServices.keycloakRefreshToken,
                    storedRefreshToken // Truyền refreshToken đã đọc được
                );

                if (newTokens && newTokens.accessToken) {
                    console.log('[AuthSaga] initAuthSaga - Làm mới token thành công.', newTokens);
                    // Fetch lại user info với token mới để đảm bảo thông tin user là mới nhất (và là lean version)
                    const refreshedUser: User | null = yield call(keycloakServices.fetchUserInfo, newTokens.accessToken);

                    if (refreshedUser) {
                        // Lưu lại các thông tin mới vào các key riêng biệt
                        yield call(secureService.saveToSecureStore, SecureKey.KEYCLOAK_USER_INFO, JSON.stringify(refreshedUser));
                        yield call(secureService.saveToSecureStore, SecureKey.KEYCLOAK_ACCESS_TOKEN, JSON.stringify(newTokens.accessToken));
                        yield call(secureService.saveToSecureStore, SecureKey.KEYCLOAK_REFRESH_TOKEN, JSON.stringify(newTokens.refreshToken));

                        // if (newTokens.idToken) yield call(secureService.saveToSecureStore, SecureKey.KEYCLOAK_ID_TOKEN, JSON.stringify(newTokens.idToken));

                        const successPayload: StoredAuthData = {
                            user: refreshedUser,
                            accessToken: newTokens.accessToken,
                            refreshToken: newTokens.refreshToken || storedRefreshToken
                        };
                        yield put(AuthActions.initAuthSuccess(successPayload));
                        console.log('[AuthSaga] initAuthSaga - Đã dispatch initAuthSuccess với token đã làm mới.');
                    } else {
                        console.warn('[AuthSaga] initAuthSaga - Làm mới token thành công nhưng không fetch được user info mới. Xóa dữ liệu cũ.');
                        yield call(keycloakServices.keycloakLogout); // Xóa tất cả các key
                        yield put(AuthActions.initAuthFailure());
                    }
                } else {
                    // Làm mới token thất bại (ví dụ: refreshToken hết hạn/không hợp lệ)
                    console.warn('[AuthSaga] initAuthSaga - Làm mới token thất bại. Xóa dữ liệu cũ.');
                    yield call(keycloakServices.keycloakLogout); // Xóa tất cả các key
                    yield put(AuthActions.initAuthFailure());
                }
            } else if (storedUser && storedAccessToken) {
                // Không có refreshToken, nhưng có accessToken và user -> thử dùng accessToken hiện tại
                console.log('[AuthSaga] initAuthSaga - Không có refreshToken, thử xác thực accessToken hiện có.');
                const stillValidUser: User | null = yield call(keycloakServices.fetchUserInfo, storedAccessToken);
                if (stillValidUser) {
                    // AccessToken cũ vẫn còn dùng được
                    console.log('[AuthSaga] initAuthSaga - AccessToken cũ còn hợp lệ.');
                    // Cập nhật lại user trong SecureStore phòng trường hợp fetchUserInfo trả về thông tin mới hơn (dù vẫn là lean)
                    yield call(secureService.saveToSecureStore, SecureKey.KEYCLOAK_USER_INFO, JSON.stringify(stillValidUser));

                    const successPayload: StoredAuthData = { user: stillValidUser, accessToken: storedAccessToken, refreshToken: undefined };
                    yield put(AuthActions.initAuthSuccess(successPayload));
                } else {
                    console.warn('[AuthSaga] initAuthSaga - AccessToken cũ không còn hợp lệ. Xóa dữ liệu.');
                    yield call(keycloakServices.keycloakLogout); // Xóa tất cả các key
                    yield put(AuthActions.initAuthFailure());
                }
            } else {
                // Dữ liệu lưu trữ không đầy đủ (ví dụ, có user nhưng không có accessToken)
                console.warn('[AuthSaga] initAuthSaga - Dữ liệu lưu trữ không đầy đủ. Xóa.');
                yield call(keycloakServices.keycloakLogout);
                yield put(AuthActions.initAuthFailure());
            }
        } else {
            // Không tìm thấy dữ liệu trong SecureStore (có thể là lần chạy đầu tiên hoặc đã logout)
            console.log('[AuthSaga] initAuthSaga - Không tìm thấy dữ liệu xác thực trong SecureStore.');
            yield put(AuthActions.initAuthFailure());
        }
    } catch (error: any) { // Bắt lỗi chung, ví dụ lỗi parse JSON từ getStoredAuthData
        console.error('[AuthSaga] initAuthSaga - Lỗi nghiêm trọng:', error.message, error);
        // Nếu có lỗi khi đọc hoặc parse, coi như không có dữ liệu và dọn dẹp
        yield call(keycloakServices.keycloakLogout);
        yield put(AuthActions.initAuthFailure());
    }
}

function* watchAuthSaga() {
    yield all([
        takeLatest(AuthActionTypes.LOGIN_REQUEST, loginSaga),
        takeLatest(AuthActionTypes.LOGOUT, logoutSaga),
        takeLatest(AuthActionTypes.INIT_AUTH_REQUEST, initAuthSaga)
    ]);
}

export default watchAuthSaga;
