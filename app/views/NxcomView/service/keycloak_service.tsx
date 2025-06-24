// File: app/views/NxcomView/service/keycloak_service.tsx

import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';

import { SecureKey } from '../constants/enum'; // Import SecureKey mới
import secureService from '../helper/secure_store';
import {
    KeycloakTokenResponseForSaga,
    StoredAuthData,
    User
} from '../stores/Auth/types';

// ... (log cấu hình, discovery, CLIENT_ID, SCOPES, REDIRECT_URI_BASE như đã có)
// log(`[KeycloakService] Expo Config from Constants:${JSON.stringify(Constants, null, 2)}`);
// if (Constants.expoConfig?.extra?.eas?.projectId) {
//     log(`[KeycloakService] EAS Project ID from Constants:${Constants.expoConfig.extra.eas.projectId}`);
// }
WebBrowser.maybeCompleteAuthSession();

const extra = {
    keycloakIssuer: process.env.EXPO_PUBLIC_KEYCLOAK_ISSUER,
    keycloakClientId: process.env.EXPO_PUBLIC_KEYCLOAK_CLIENT_ID
};
// log(`[KeycloakService] Extra Config:${JSON.stringify(extra, null, 2)}`);

export const discovery = {
    authorizationEndpoint: `${extra.keycloakIssuer}/protocol/openid-connect/auth`,
    tokenEndpoint: `${extra.keycloakIssuer}/protocol/openid-connect/token`,
    revocationEndpoint: `${extra.keycloakIssuer}/protocol/openid-connect/logout`,
    userInfoEndpoint: `${extra.keycloakIssuer}/protocol/openid-connect/userinfo`
};

export const CLIENT_ID = extra.keycloakClientId || '';
export const SCOPES = [ 'openid', 'profile', 'email', 'offline_access' ];
export const REDIRECT_URI_BASE = 'nxforum://oauthredirect';


export const fetchUserInfo = async (accessToken: string): Promise<User | null> => {
    try {
        const response = await fetch(discovery.userInfoEndpoint, {
            method: 'GET',
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        if (!response.ok) {
            console.error(`[KeycloakService] Failed to fetch user info. Status: ${response.status}`);
            const errorData = await response.text();
            console.error(`[KeycloakService] User info error response: ${errorData}`);
            return null;
        }
        const fullUserInfo: any = await response.json();
        const leanUser: User = { // Tạo User object đã được tinh gọn
            sub: fullUserInfo.sub,
            name: fullUserInfo.name,
            preferred_username: fullUserInfo.preferred_username,
            email: fullUserInfo.email,
            email_verified: fullUserInfo.email_verified
            // family_name: fullUserInfo.family_name,
            // given_name: fullUserInfo.given_name
        };
        return leanUser;
    } catch (error) {
        console.error('[KeycloakService] Error fetching user info:', error);
        return null;
    }
};

export const keycloakLogin = async (): Promise<KeycloakTokenResponseForSaga | null> => {
    try {
        const REDIRECT_URI = AuthSession.makeRedirectUri({ scheme: 'nxforum', path: 'oauthredirect' });
        const authRequest = new AuthSession.AuthRequest({
            clientId: CLIENT_ID,
            redirectUri: REDIRECT_URI,
            scopes: SCOPES,
            responseType: 'code',
            usePKCE: true
        });
        const result = await authRequest.promptAsync(discovery);
        console.log('[KeycloakService] Auth prompt result type:', result.type);
        if (result.type === 'success') {
            const { code } = result.params;
            if (!code) {
                console.error('[KeycloakService] Auth success but no code in params.');
                throw new Error('Đăng nhập thất bại: không nhận được mã ủy quyền.');
            }
            const newTokens = await exchangeCodeForToken(code, authRequest.codeVerifier);
            console.log('[KeycloakService] Tokens exchanged successfully:', !!newTokens?.accessToken);
            return newTokens as KeycloakTokenResponseForSaga; // Trả về token để saga xử lý lưu trữ
        }
        console.warn('[KeycloakService] Auth prompt was not successful:', result.type, result);
        // const errorDescription = result.?.error_description || result.params?.error || `Loại kết quả: ${result.type}`;
        throw new Error(`Đăng nhập thất bại: ${JSON.stringify(result, null, 2)}`);

    } catch (error) {
        console.error('[KeycloakService] Login Error in keycloakLogin:', error);
        throw error;
    }
};

const exchangeCodeForToken = async (code: string, codeVerifier: string | undefined): Promise<AuthSession.TokenResponse | null> => {
    const REDIRECT_URI = AuthSession.makeRedirectUri({ scheme: 'nxforum', path: 'oauthredirect' });
    try {
        return await AuthSession.exchangeCodeAsync(
            { clientId: CLIENT_ID, code, redirectUri: REDIRECT_URI, extraParams: { code_verifier: codeVerifier || '' } },
            { tokenEndpoint: discovery.tokenEndpoint }
        );
    } catch (error: any) {
        console.error('[KeycloakService] Error exchanging code for token:', error.message, error.response?.data);
        throw error;
    }
};

export const keycloakLogout = async () => {
    try {
        // Không cần đọc token từ store để revoke. Chỉ cần xóa các key đã lưu.
        await secureService.deleteFromSecureStore(SecureKey.KEYCLOAK_USER_INFO);
        await secureService.deleteFromSecureStore(SecureKey.KEYCLOAK_ACCESS_TOKEN);
        await secureService.deleteFromSecureStore(SecureKey.KEYCLOAK_REFRESH_TOKEN);
        // await secureService.deleteFromSecureStore(SecureKey.KEYCLOAK_ID_TOKEN); // Nếu bạn lưu
        // await secureService.deleteFromSecureStore(SecureKey.KEYCLOAK_ACCESS_TOKEN_EXPIRES_AT); // Nếu bạn lưu
        console.log('[KeycloakService] All individual auth keys removed from SecureStore on logout.');
    } catch (error) {
        console.error('[KeycloakService] Logout Error while deleting keys:', error);
        // Vẫn cố gắng xóa nếu có lỗi
        await Promise.allSettled([
            secureService.deleteFromSecureStore(SecureKey.KEYCLOAK_USER_INFO),
            secureService.deleteFromSecureStore(SecureKey.KEYCLOAK_ACCESS_TOKEN),
            secureService.deleteFromSecureStore(SecureKey.KEYCLOAK_REFRESH_TOKEN)
        ]);
    }
};

export const keycloakRefreshToken = async (refreshTokenValue: string): Promise<AuthSession.TokenResponse | null> => {
    if (!refreshTokenValue) {
        console.warn('[KeycloakService] keycloakRefreshToken: No refreshTokenValue provided.');
        return null;
    }
    try {
        console.log('[KeycloakService] Attempting to refresh token using provided refreshToken.');
        const newTokens = await AuthSession.refreshAsync(
            { clientId: CLIENT_ID, refreshToken: refreshTokenValue, scopes: SCOPES },
            { tokenEndpoint: discovery.tokenEndpoint }
        );
        console.log('[KeycloakService] Token refreshed successfully via keycloakRefreshToken:', !!newTokens?.accessToken);
        return newTokens; // Saga sẽ xử lý việc lưu trữ token mới
    } catch (error: any) {
        console.warn('[KeycloakService] Token Refresh Error in keycloakRefreshToken:', error, error.message);
        if (error.code === 'invalid_grant' || (error.message && error.message.toLowerCase().includes('invalid_grant'))) {
            console.warn('[KeycloakService] Refresh token is likely invalid or expired.');
        }
        return null;
    }
};

// Hàm mới để đọc từng phần dữ liệu và tái tạo StoredAuthData
export const getStoredAuthData = async (): Promise<StoredAuthData | null> => {
    try {
        const userInfoString = await secureService.getFromSecureStore(SecureKey.KEYCLOAK_USER_INFO);
        const accessToken = await secureService.getFromSecureStore(SecureKey.KEYCLOAK_ACCESS_TOKEN);
        const refreshToken = await secureService.getFromSecureStore(SecureKey.KEYCLOAK_REFRESH_TOKEN);

        if (userInfoString && accessToken) {
            const user: User = JSON.parse(userInfoString); // Đã là JSON string
            return {
                user,
                accessToken: JSON.parse(accessToken), // accessToken cũng được lưu dưới dạng JSON string
                refreshToken: refreshToken ? JSON.parse(refreshToken) : undefined
            };
        }
        return null;
    } catch (error) {
        console.error('[KeycloakService] Error retrieving stored auth data:', error);
        // Nếu có lỗi, xóa các key để tránh trạng thái không nhất quán
        await Promise.allSettled([
            secureService.deleteFromSecureStore(SecureKey.KEYCLOAK_USER_INFO),
            secureService.deleteFromSecureStore(SecureKey.KEYCLOAK_ACCESS_TOKEN),
            secureService.deleteFromSecureStore(SecureKey.KEYCLOAK_REFRESH_TOKEN)
        ]);
        return null;
    }
};


const keycloakServices = {
    keycloakLogin,
    keycloakLogout,
    keycloakRefreshToken,
    getStoredAuthData, // Đổi tên hàm
    fetchUserInfo
};

export default keycloakServices;

