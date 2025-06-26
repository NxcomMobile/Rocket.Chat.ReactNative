import React from 'react';

import {
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useDispatch } from 'react-redux';

// import keycloakServices from '@/services/keycloak_service';
// import { useAppDispatch } from '@/store';
// import { AuthActions } from '@/store/Auth/slices';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useAppSelector } from '../../../lib/hooks';
import EventEmitter from '../../../lib/methods/helpers/events';
import { NxcomStackNavigatorParamList } from '../../../stacks/types';
import { SecureKey } from '../constants/enum';
import secureService from '../helper/secure_store';
import forumService from '../service/forum_services';
import keycloakServices from '../service/keycloak_service';
import { AuthActions } from '../stores/Auth/actions';
import R from './R';

const ForumItem = ({ forum }: { forum: any }) => {
    const navigation = useNavigation<NativeStackNavigationProp<NxcomStackNavigatorParamList, 'NxWebview'>>();
    const { accessToken, isAuthenticated } = useAppSelector(state => state.nxforumAuth);
    const dispatch = useDispatch();
    const handlePress = async () => {
        // return;
        if (!isAuthenticated) {
            // Alert.alert(
            //     'Thông báo',
            //     'Bạn chưa đăng nhập diễn đàn này, bạn có muốn tham gia với tư cách là khách?',
            //     [
            //         {
            //             text: 'Không',
            //             onPress: () => console.log('Cancel Pressed'),
            //             style: 'cancel'
            //         },
            //         {
            //             text: 'Có',
            //             onPress: () => {
            //                 EventEmitter.emit('Nxcom:changeForum', {
            //                     site_url: forum.site,
            //                     redirect_url: forum.site,
            //                     title: forum.title,
            //                     role: 'guest'
            //                 }); // Cast to TEventEmitterEmmitArgs
            //                 // Navigation.navigate('NxWebview', {
            //                 //     site_url: forum.site,
            //                 //     redirect_url: forum.site,
            //                 //     title: forum.title,
            //                 //     role: 'guest'
            //                 // });
            //             }
            //         }
            //     ])
            // return;
            userNotExist();
            return;
        }
        // R.Loading.show();
        const checkUser = await forumService.checkExitsUser(forum.site, accessToken)
        if (checkUser.status === 200) {
            R.Loading.hide();
            if (checkUser.data && checkUser?.data?.exists) {
                EventEmitter.emit('Nxcom:changeForum', {
                    site_url: forum.site, redirect_url: forum.site, title: forum.title, role: 'user'
                }); // Cast to TEventEmitterEmmitArgs
                // Navigation.navigate('NxWebview', {
                //     site_url: forum.site, redirect_url: forum.site, title: forum.title
                // });
            } else {
                userNotExist();
            }
        } else if (checkUser.status === 401) {
            refreshToken().then(
                async () => {
                    const checkUser = await forumService.checkExitsUser(forum.site, accessToken)
                    R.Loading.hide();
                    if (checkUser.data && checkUser?.data?.exists) {
                        // Navigation.navigate('NxWebview', {
                        //     site_url: forum.site, redirect_url: forum.site, title: forum.title
                        // });
                        EventEmitter.emit('Nxcom:changeForum', {
                            site_url: forum.site, redirect_url: forum.site, title: forum.title, role: 'user'
                        }); // Cast to TEventEmitterEmmitArgs
                    } else {
                        userNotExist();
                    }
                }
            );
        } else {
            R.Loading.hide();
            userNotExist();
        }
    };

    const userNotExist = () => {
        EventEmitter.emit('Nxcom:changeForum', { // Cast to TEventEmitterEmmitArgs
            site_url: forum.site,
            redirect_url: forum.site,
            title: forum.title,
            role: 'guest'
        });
        // Alert.alert(
        //     'Thông báo',
        //     'Bạn chưa tham gia diễn đàn này, bạn có muốn tham gia với tư cách là khách?',
        //     [
        //         {
        //             text: 'Không',
        //             onPress: () => console.log('Cancel Pressed'),
        //             style: 'cancel'
        //         },
        //         {
        //             text: 'Có',
        //             onPress: () => {
        //                 EventEmitter.emit('Nxcom:changeForum', { // Cast to TEventEmitterEmmitArgs
        //                     site_url: forum.site,
        //                     redirect_url: forum.site,
        //                     title: forum.title,
        //                     role: 'guest'
        //                 });
        //                 // Navigation.navigate('NxWebview', {
        //                 //     site_url: forum.site,
        //                 //     redirect_url: forum.site,
        //                 //     title: forum.title,
        //                 //     role: 'guest'
        //                 // });
        //             }
        //         }
        //     ])
    }

    const refreshToken = async () => {
        try {
            const refreshToken = await secureService.getFromSecureStore(SecureKey.KEYCLOAK_REFRESH_TOKEN);

            const response = await keycloakServices.keycloakRefreshToken(refreshToken);
            dispatch(AuthActions.updateAccessToken(response?.accessToken || ''));
        } catch (error) {
            console.log('Refresh token thất bại:', error);
            dispatch(AuthActions.loginRequest());
        }
    };

    return (
        <TouchableOpacity key={forum.site} style={styles.container} onPress={handlePress}>
            <Image source={{ uri: forum.logo_small_url }} style={styles.logo} resizeMode={'contain'} />
            <View style={styles.infoContainer}>
                <Text style={[ styles.title ]}>{forum.title}</Text>
                <Text style={styles.description}>{forum.description}</Text>
                <Text style={styles.siteUrl}>{forum.site}</Text>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        // alignItems: 'center',
        // backgroundColor: '#fff',
        padding: 15,
        marginVertical: 8,
        marginHorizontal: 16
        // borderRadius: 12,
        // shadowColor: '#000',
        // shadowOffset: { width: 0, height: 2 },
        // shadowOpacity: 0.1,
        // shadowRadius: 4,
        // elevation: 3
    },
    logo: {
        width: 30,
        height: 30,
        borderRadius: 25,
        marginRight: 15
    },
    infoContainer: {
        flex: 1
    },
    title: {
        fontSize: 14,
        fontWeight: '700',
        // color: '#333',
        marginBottom: 4
    },
    description: {
        fontSize: 12,
        color: '#666',
        marginBottom: 4,
        lineHeight: 18
    },
    siteUrl: {
        fontSize: 12,
        color: '#007AFF',
        textDecorationLine: 'underline'
    }
});

export default ForumItem;