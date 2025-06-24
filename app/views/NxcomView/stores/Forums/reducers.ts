// File: app/views/NxcomView/stores/Forums/reducers.ts

import {
	ForumAction,
	ForumActionTypes,
	ForumsState
} from './types';

// Trạng thái khởi tạo cho slice Forums, giống hệt initialState của slice cũ
const initialForumsState: ForumsState = {
    forums: [],
    notifications: [],
    chat: []
};

const forumsReducer = (state: ForumsState = initialForumsState, action: ForumAction): ForumsState => {
    // console.log('[ForumsReducer] Action received:', action.type, 'Payload:', (action as any).payload); // Để debug nếu cần

    switch (action.type) {
        case ForumActionTypes.SET_FORUMS:
            // Cập nhật state.forums với dữ liệu từ action.payload
            return {
                ...state,
                forums: action.payload // action là SetForumsAction
            };

        case ForumActionTypes.SET_NOTIFICATIONS:
            // Cập nhật state.notifications với dữ liệu từ action.payload
            return {
                ...state,
                notifications: action.payload // action là SetNotificationsAction
            };

        case ForumActionTypes.SET_CHAT:
            // Cập nhật state.chat với dữ liệu từ action.payload
            return {
                ...state,
                chat: action.payload // action là SetChatAction
            };

        case ForumActionTypes.CLEAR_FORUMS:
            // Đặt state.forums về mảng rỗng
            return {
                ...state,
                forums: []
            };

        case ForumActionTypes.CLEAR_NOTIFICATIONS:
            // Đặt state.notifications về mảng rỗng
            return {
                ...state,
                notifications: []
            };

        case ForumActionTypes.CLEAR_CHAT:
            // Đặt state.chat về mảng rỗng
            return {
                ...state,
                chat: []
            };

        default:
            // Nếu action không khớp, trả về trạng thái hiện tại.
            return state;
    }
};

export default forumsReducer;
