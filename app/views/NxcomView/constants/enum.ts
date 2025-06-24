//   export enum StorageKey {
//     ACCESS_TOKEN = '[nxforum]access_token',
//     REFRESH_TOKEN = '[nxforum]refresh_token',
//     THEME_MODE = '[nxforum]theme_mode',
// }

export enum SecureKey {
  KEYCLOAK_AUTH = 'nxforum_keycloak_auth',
  KEYCLOAK_USER_INFO = 'nxforum_keycloak_user_info',         // Chỉ lưu User (lean version)
  KEYCLOAK_ACCESS_TOKEN = 'nxforum_keycloak_access_token',   // Chỉ lưu accessToken
  KEYCLOAK_REFRESH_TOKEN = 'nxforum_keycloak_refresh_token', // Chỉ lưu refreshToken
}

export default {
  SecureKey
}