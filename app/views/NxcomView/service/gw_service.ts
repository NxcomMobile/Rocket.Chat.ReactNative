import DeviceInfo from 'react-native-device-info';

import { _gwUrl } from '../constants';

// Hàm lấy danh sách các site diễn đàn
export const getForumSites = async () => {
    try {
        const response = await fetch(`${_gwUrl}/api/method/nxmobilegw.api.get_forum_sites`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.status === 200) {
            const data = await response.json();
            const sites = data.message;
            const siteUrls = Array.isArray(sites) ? sites : [];
            const sitesDetailPromises = siteUrls.map(site => getSiteDetail(site));
            const result = await Promise.all(sitesDetailPromises);
            return result.filter(site => site !== null);
        }
        // NÉM LỖI nếu response từ gateway không thành công
        throw new Error(`Failed to fetch site list from gateway. Status: ${response.status}`);
    } catch (error) {
        console.error('Error fetching forum sites:', error);
        throw error; // NÉM LẠI LỖI để component gọi nó có thể bắt
    }
};

// Hàm lấy chi tiết một site
export const getSiteDetail = async (site: any) => {
    try {
        const response = await fetch(`${site}/site/basic-info.json`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.status === 200) {
            const data = await response.json();
            return {
                ...data,
                site
            };
        }
        // Trả về null nếu chỉ một site con bị lỗi để Promise.all không bị dừng
        return null;
    } catch (error) {
        console.error('Error fetching site detail for:', site, error);
        // Trả về null để không làm hỏng toàn bộ Promise.all
        return null;
    }
};

export const client_logout = async () => {
    try {
        console.log('client_logout')
        const device_id = await DeviceInfo.getUniqueId();
        await fetch(`${_gwUrl}/api/method/nxmobilegw.api.client_logout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ device_id })
        }).then((res) => {
            console.log('client_logout res', res)

        })
        return true;
    } catch (error) {
        console.error('Error fetching site detail:', error);
        return false;
    }
};

const gwServices = {
    getForumSites,
    client_logout
}
export default gwServices;