// File: app/views/NxcomView/stores/Forums/actions.ts

import {
	ChatMessage,
	Forum,
	ForumActionTypes,
	Notification
} from './types';

// Action Creators tương ứng với các reducers trong slice cũ

export const setForums = (forums: Forum[]): { type: ForumActionTypes.SET_FORUMS; payload: Forum[] } => ({
    type: ForumActionTypes.SET_FORUMS,
    payload: forums
});

export const setNotifications = (notifications: Notification[]): { type: ForumActionTypes.SET_NOTIFICATIONS; payload: Notification[] } => ({
    type: ForumActionTypes.SET_NOTIFICATIONS,
    payload: notifications
});

export const setChat = (chatMessages: ChatMessage[]): { type: ForumActionTypes.SET_CHAT; payload: ChatMessage[] } => ({
    type: ForumActionTypes.SET_CHAT,
    payload: chatMessages
});

export const clearForums = (): { type: ForumActionTypes.CLEAR_FORUMS } => ({
    type: ForumActionTypes.CLEAR_FORUMS
});

export const clearNotifications = (): { type: ForumActionTypes.CLEAR_NOTIFICATIONS } => ({
    type: ForumActionTypes.CLEAR_NOTIFICATIONS
});

export const clearChat = (): { type: ForumActionTypes.CLEAR_CHAT } => ({
    type: ForumActionTypes.CLEAR_CHAT
});

// Bạn có thể export một object chứa tất cả actions nếu muốn, tương tự slice cũ
export const ForumsActions = {
    setForums,
    setNotifications,
    setChat,
    clearForums,
    clearNotifications,
    clearChat
};
