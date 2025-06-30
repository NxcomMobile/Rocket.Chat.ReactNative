// File: NxcomView/helper/storage_service.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

const LAST_FOCUSED_FORUM_KEY = 'nxforum_last_focused_forum';

/**
 * Lưu URL của forum được xem lần cuối vào bộ nhớ.
 * @param siteUrl URL của trang forum.
 */
const saveLastFocusedForum = async (siteUrl: string): Promise<void> => {
    try {
        await AsyncStorage.setItem(LAST_FOCUSED_FORUM_KEY, siteUrl);
    } catch (error) {
        console.error('Error saving last focused forum to AsyncStorage:', error);
    }
};

/**
 * Lấy URL của forum được xem lần cuối từ bộ nhớ.
 * @returns URL của trang forum hoặc null nếu không có.
 */
const getLastFocusedForum = async (): Promise<string | null> => {
    try {
        return await AsyncStorage.getItem(LAST_FOCUSED_FORUM_KEY);
    } catch (error) {
        console.error('Error retrieving last focused forum from AsyncStorage:', error);
        return null;
    }
};

const storageService = {
    saveLastFocusedForum,
    getLastFocusedForum
};

export default storageService;