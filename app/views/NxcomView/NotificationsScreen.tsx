import React from 'react';

import {
    FlatList,
    RefreshControl,
    Text
} from 'react-native';
import { useDispatch } from 'react-redux';

import { useNavigation } from '@react-navigation/native';

import { useAppSelector } from '../../lib/hooks/useAppSelector';
import { SecureKey } from './constants/enum';
import secureService from './helper/secure_store';
import { NotificationGroup } from './notification_list';
import forumService from './service/forum_services';
import keycloakServices from './service/keycloak_service';
import { AuthActions } from './stores/Auth/actions';
import { ForumsActions } from './stores/Forums/actions';

const NotificationsScreen = () => {
    const { forums, notifications } = useAppSelector(state => state.forums);
    const { accessToken, isAuthenticated } = useAppSelector(state => state.nxforumAuth);
    const [ notification, setNotification ] = React.useState<any[]>([]);
    const [ loading, setLoading ] = React.useState(false);

    const navigation = useNavigation();
    const dispatch = useDispatch();
    const focused = navigation.isFocused();
    // const path = usePathname();
    React.useEffect(() => {
        if (!forums) return;
        if (!focused) return;
        getNotifications();
        // console.log(
        //     // `Current page is focused: ${focused}, current page name: ${path}`
        // );
    }, [ forums, focused ])


    React.useEffect(() => {
        if (!notifications) return;
        setNotification(notifications);
    }, [ notifications ])

    const getNotifications = async () => {
        if (!isAuthenticated) return;
        setLoading(true);
        // Chuyển danh sách site thành mảng string
        const siteUrls = Array.isArray(forums) ? forums : [];

        // Gọi chi tiết cho từng site bằng cách map qua danh sách
        const sitesDetailPromises = siteUrls.map(_site => forumService.getForumNotification(_site.site, accessToken, _site.title, _site?.mobile_logo_url));

        const chatGroupPromises = siteUrls.map(_site => forumService.getChatMessage(_site.site, accessToken, _site.title, _site?.mobile_logo_url));
        const chatResult = await Promise.all(chatGroupPromises);
        // console.log('chatGroupPromises', chatResult, JSON.stringify(chatResult))
        if (chatResult) {
            dispatch(ForumsActions.setChat(chatResult))
        }
        // Chờ tất cả các promise hoàn thành
        const result = await Promise.all(sitesDetailPromises);
        // console.log('result', result)
        if (result) {
            dispatch(ForumsActions.setNotifications(result))
        }
        setLoading(false);
    }

    const handleRefresh = async () => {
        if (!isAuthenticated) return;
        try {
            const refreshToken = await secureService.getFromSecureStore(SecureKey.KEYCLOAK_REFRESH_TOKEN);
            const response = await keycloakServices.keycloakRefreshToken(refreshToken);
            if (!response) {
                dispatch(AuthActions.loginRequest());
                return
            }
            dispatch(AuthActions.updateAccessToken(response?.accessToken || ''));
            // showAlertMessage({
            //     title: 'Refresh token',
            //     description: 'Refresh token success',
            //     type: 'success',
            //     duration: 3000
            // })
        } catch (error) {
            console.log('Refresh token thất bại:', error);
            dispatch(AuthActions.loginRequest());
        }
    }

    if (!notifications || notifications.length === 0) {
        return <Text style={{
            textAlign: 'center',
            marginTop: 20,
            color: '#888'
        }}>No notifications.</Text>;
    }

    // if (!notification) {
    //     return <View style={{
    //         flex: 1,
    //         alignItems: 'center',
    //         justifyContent: 'center'
    //     }}>
    //         {/* <LottieView
    //             source={require('@/loties/loading.json')}
    //             style={{
    //                 width: 200,
    //                 height: 200,
    //                 alignSelf: 'center'
    //             }}
    //             autoPlay
    //             loop
    //         /> */}
    //     </View>
    // }

    return (
        <FlatList
            data={notifications}
            renderItem={({ item }) => <NotificationGroup group={item} />}
            keyExtractor={(item, index: number) => `${item.title}-${item.site}-index-${index}`} // Key for the group
            contentContainerStyle={{
                // padding: 10,
                paddingBottom: 40
            }} // Add some padding
            refreshControl={<RefreshControl refreshing={loading} onRefresh={() => {
                handleRefresh().then(() => {
                    getNotifications()
                })
            }}
            />}
        />
    );
};

export default NotificationsScreen;