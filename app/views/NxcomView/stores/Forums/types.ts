// File: app/views/NxcomView/stores/Forums/types.ts

// Định nghĩa cho một mục Forum (giữ nguyên hoặc điều chỉnh nếu cần)
export interface Forum {
    site: string;
    title: string;
    description?: string;
    logo_small_url?: string;
    mobile_logo_url?: string;
    // Thêm các trường khác nếu API trả về
}

// Định nghĩa cho một mục Notification (ví dụ, bạn cần định nghĩa cấu trúc này)
export interface Notification {
    // id: string;
    // message: string;
    // read?: boolean;
    site: string;
    title: string | undefined;
    mobile_logo_url: string | undefined
    // Thêm các trường khác
}

// Định nghĩa cho một mục Chat (ví dụ, bạn cần định nghĩa cấu trúc này)
export interface ChatMessage {
    // id: string;
    // sender: string;
    // text: string;
    // timestamp: number;
    site: string;
    title: string | undefined;
    mobile_logo_url: string | undefined;
    // Thêm các trường khác
}

// Định nghĩa cho trạng thái của slice Forums
// Phản ánh initialState từ slice cũ của bạn
export interface ForumsState {
    forums: Forum[];
    notifications: Notification[]; // Giả sử Notification là một interface bạn sẽ định nghĩa
    chat: ChatMessage[];         // Giả sử ChatMessage là một interface bạn sẽ định nghĩa
}

// Enum cho các action types của Forums, tương ứng với reducers trong slice cũ
export enum ForumActionTypes {
    SET_FORUMS = 'forums/SET_FORUMS',
    SET_NOTIFICATIONS = 'forums/SET_NOTIFICATIONS',
    SET_CHAT = 'forums/SET_CHAT',
    CLEAR_FORUMS = 'forums/CLEAR_FORUMS',
    CLEAR_NOTIFICATIONS = 'forums/CLEAR_NOTIFICATIONS',
    CLEAR_CHAT = 'forums/CLEAR_CHAT'
}

// Interfaces cho các actions
export interface SetForumsAction {
    type: ForumActionTypes.SET_FORUMS;
    payload: Forum[];
}

export interface SetNotificationsAction {
    type: ForumActionTypes.SET_NOTIFICATIONS;
    payload: Notification[];
}

export interface SetChatAction {
    type: ForumActionTypes.SET_CHAT;
    payload: ChatMessage[];
}

export interface ClearForumsAction {
    type: ForumActionTypes.CLEAR_FORUMS;
}

export interface ClearNotificationsAction {
    type: ForumActionTypes.CLEAR_NOTIFICATIONS;
}

export interface ClearChatAction {
    type: ForumActionTypes.CLEAR_CHAT;
}

// Union type cho tất cả các actions của Forums
export type ForumAction =
    | SetForumsAction
    | SetNotificationsAction
    | SetChatAction
    | ClearForumsAction
    | ClearNotificationsAction
    | ClearChatAction;
