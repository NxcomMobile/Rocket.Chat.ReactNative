import React from 'react';

import {
    StyleSheet,
    Text,
    View
} from 'react-native';

import { useAppSelector } from '../../../lib/hooks/useAppSelector';

const UserHeader = ({ user }: { user: any }) => {
    // const dispatch = useDispatch();
    // const insets = useSafeAreaInsets();
    const { isAuthenticated } = useAppSelector(state => state.nxforumAuth);
    // Hàm lấy chữ cái đầu cho avatar
    const getInitials = (name: string) => {
        if (!name) return 'NN';
        const names = name.split(' ');
        return names.map(n => n[ 0 ]).join('').toUpperCase().slice(0, 2);
    };
    // const handleLogout = async () => {
    //     try {
    //         dispatch(AuthActions.logout());
    //         console.log('Đăng xuất thành công');
    //     } catch (error) {
    //         console.log('Đăng xuất thất bại:', error);
    //     }
    // };

    // const handleRefresh = async () => {
    //     try {
    //         const response = await keycloakServices.keycloakRefreshToken();
    //         dispatch(AuthActions.updateAccessToken(response?.accessToken || ''));
    //         // showAlertMessage({
    //         //     title: 'Refresh token',
    //         //     description: 'Refresh token success',
    //         //     type: 'success'
    //         // })
    //     } catch (error) {
    //         console.log('Refresh token thất bại:', error);
    //         dispatch(AuthActions.loginRequest());
    //     }
    // }

    // const handleLogin = async () => {
    //     try {
    //         dispatch(AuthActions.loginRequest());
    //     } catch (error) {
    //         console.log('Login Error:', error);
    //     }
    // };


    return (
        <>
            <View >
                {
                    isAuthenticated ? <View style={[ styles.header, {
                        // paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 60) + 20 : insets.top// Đẩy nội dung xuống dưới status bar

                    } ]}>
                        {/* Avatar */}
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>{getInitials(user?.name)}</Text>
                        </View>

                        {/* Thông tin chính */}
                        <View style={styles.infoContainer}>
                            <Text style={styles.name}>{user?.name || ''}</Text>
                            <Text style={styles.email}>{user?.email || ''}</Text>
                        </View>
                        {/* <Entypo.Button name="log-out" onPress={handleLogout}/> */}
                    </View>
                        // : <View style={{
                        //     flex: 1,
                        //     alignItems: 'center',
                        //     justifyContent: 'center'
                        // }}>
                        //     <Pressable onPress={handleLogin} style={{
                        //         alignSelf: 'center',
                        //         justifyContent: 'center',
                        //         alignItems: 'center',                                // marginBottom: 60,
                        //         width: 250,
                        //         height: 60
                        //     }}>
                        //         <HeaderButton.Item
                        //             title={I18n.t('Login')}
                        //             // accessibilityLabel={I18n.t('Edit_profile')}
                        //             testID='nxforums-login-button'
                        //             // icon='edit'
                        //             onPress={() => {
                        //                 handleLogin();
                        //                 // navigation.navigate('EditProfileView');
                        //             }}
                        //         />
                        //         <Text style={{
                        //             // fontWeight: 'bold',
                        //             fontSize: 24,
                        //             color: 'white',
                        //             fontFamily: 'Labrada_700Bold_Italic',
                        //             position: 'absolute',
                        //             alignSelf: 'center',
                        //             paddingBottom: 10
                        //         }}>Login</Text>
                        //     </Pressable>
                        // </View>
                        : null
                }
            </View>
        </>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#007AFF',
        padding: 20,
        margin: 20,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 5
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15
    },
    avatarText: {
        color: '#007AFF',
        fontSize: 24,
        fontWeight: 'bold'
    },
    infoContainer: {
        flex: 1
    },
    name: {
        fontSize: 22,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 4
    },
    email: {
        fontSize: 16,
        color: '#e6f0ff'
    }
});

export default UserHeader;