import DeviceInfo from 'react-native-device-info';

import { _gwUrl } from '../constants';

// Hàm lấy danh sách các site diễn đàn
export const getForumSites = async () => {
    try {
        const response = await fetch(`${_gwUrl}/api/method/nxmobilegw.api.get_forum_sites`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
                // Thêm các header khác nếu cần, như Authorization
            }
        });

        if (response.status === 200) {
            const data = await response.json();
            const sites = data.message; // Lấy danh sách site từ response

            // Chuyển danh sách site thành mảng string
            const siteUrls = Array.isArray(sites) ? sites : [];

            // Gọi chi tiết cho từng site bằng cách map qua danh sách
            const sitesDetailPromises = siteUrls.map(site => getSiteDetail(site));

            // Chờ tất cả các promise hoàn thành
            const result = await Promise.all(sitesDetailPromises);

            // Lọc bỏ các giá trị null và trả về danh sách site hợp lệ
            return result.filter(site => site !== null);
        }
        return [];
    } catch (error) {
        console.error('Error fetching forum sites:', error);
        return [];
    }
};

// Hàm lấy chi tiết một site
export const getSiteDetail = async (site: any) => {
    try {
        const response = await fetch(`${site}/site/basic-info.json`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
                // Thêm các header khác nếu cần
            }
        });

        if (response.status === 200) {
            const data = await response.json();

            // Tạo đối tượng Site từ dữ liệu JSON, thêm thuộc tính 'site'
            return {
                ...data,
                site
            };
        }
        return null;
    } catch (error) {
        console.error('Error fetching site detail:', error);
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
                // Thêm các header khác nếu cần
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