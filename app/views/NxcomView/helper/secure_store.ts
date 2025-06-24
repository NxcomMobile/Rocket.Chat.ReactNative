import * as SecureStore from 'expo-secure-store';

export const saveToSecureStore = async (key: string, value: any) => {
    try {
        await SecureStore.setItemAsync(key, JSON.stringify(value));
        console.log(`Saved ${key} to SecureStore.`);
    } catch (error) {
        console.error(`Error saving ${key} to SecureStore:`, error);
    }
};

export const getFromSecureStore = async (key: string) => {
    try {
        const value = await SecureStore.getItemAsync(key);
        return value ? JSON.parse(value) : null;
    } catch (error) {
        console.error(`Error retrieving ${key} from SecureStore:`, error);
        return null;
    }
};

export const deleteFromSecureStore = async (key: string) => {
    try {
        await SecureStore.deleteItemAsync(key);
        console.log(`Deleted ${key} from SecureStore.`);
    } catch (error) {
        console.error(`Error deleting ${key} from SecureStore:`, error);
    }
};

const secureService = {
    saveToSecureStore,
    getFromSecureStore,
    deleteFromSecureStore
};
export default secureService;