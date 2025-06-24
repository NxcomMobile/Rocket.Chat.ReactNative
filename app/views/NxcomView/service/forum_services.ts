export const getForumNotification = async (site: string, accessToken: string, title?: string, mobile_logo_url?: string) => {
    try {
        let data = { site, title, mobile_logo_url }
        const response = await fetch(`${site}/keycloak-notifications`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
                // Thêm các header khác nếu cần, như Authorization
            }
        });

        if (response.status === 200) {
            data = { ...data, ...(await response.json()) };
            return data;
        }
        return data;
    } catch (error) {
        console.error('Error fetching forum sites:', error);
        return { site, title, mobile_logo_url };
    }
};
export const getChatMessage = async (site: string, accessToken: string, title?: string, mobile_logo_url?: string) => {
    try {
        let data = { site, title, mobile_logo_url }
        const response = await fetch(`${site}/keycloak-notifications/chat-messages`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
                // Thêm các header khác nếu cần, như Authorization
            }
        });

        if (response.status === 200) {
            // console.log('res chat', JSON.stringify(await response.json()))
            data = { ...data, ...(await response.json()) };
            return data;
        }
        return data;
    } catch (error) {
        console.error('Error fetching forum sites:', error);
        return { site, title, mobile_logo_url };
    }
};


export const checkExitsUser = async (site: string, accessToken: string) => {
    try {
        const response = await fetch(`${site}/mobile-keycloak-auth/exists`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
                // Thêm các header khác nếu cần, như Authorization
            }
        });
        return {
            status: response.status,
            data: await response.json()
        };
    } catch (error) {
        console.error('Error fetching forum sites:', error);
        return {
            status: 500,
            data: {}
        };
    }
};

const forumService = {
    getForumNotification,
    getChatMessage,
    checkExitsUser
}
export default forumService;