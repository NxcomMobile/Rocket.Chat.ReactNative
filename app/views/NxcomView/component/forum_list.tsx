import React from 'react';

import {
    FlatList,
    RefreshControl,
    StyleSheet,
    View
} from 'react-native';
import { useDispatch } from 'react-redux';

import { useAppSelector } from '../../../lib/hooks/useAppSelector';
import { SecureKey } from '../constants/enum';
import secureService from '../helper/secure_store';
import gwServices from '../service/gw_service';
import keycloakServices from '../service/keycloak_service';
import { AuthActions } from '../stores/Auth/actions';
import { ForumsActions } from '../stores/Forums/actions';
import ForumItem from './forum_item';

// import gwServices from "@/services/gw_service";
// import LottieView from "lottie-react-native";
// import {useAppDispatch, useAppSelector} from "@/store";
// import ForumItem from "@/app/components/forum_item";
// import keycloakServices from "@/services/keycloak_service";
// import {AuthActions} from "@/store/Auth/slices";
// import {showAlertMessage} from "@/app/components/index";
// import {ForumsActions} from "@/store/Forums/slices";


const ForumList = () => {
    // const [ forums, setForums ] = React.useState<any>([]);
    const [ loading, setLoading ] = React.useState(false);
    const dispatch = useDispatch();
    const { forums } = useAppSelector(state => state.forums);
    const { isAuthenticated, } = useAppSelector(state => state.nxforumAuth);
    React.useEffect(() => {
        getForums();
    }, []);

    // React.useEffect(() => {
    //     if (!forums) return;
    //     console.log('forums', forums);

    //     // setForums(forums);
    // }
    //     , [ forums ]);
    // const renderItem = ({ item }: { item: any }) => <Text>{item.title}</Text>
    const renderItem = ({ item }: { item: any }) => <ForumItem forum={item} />;
    const getForums = async () => {
        // console.log('getForums');
        setLoading(true)
        const response = await gwServices.getForumSites();
        // response = [...response, {
        //     description: 'Server test',
        //     logo_small_url: 'http://chuyenmon.eup.vn/images/discourse-logo-sketch-small.png',
        //     site: 'http://127.0.0.1:4200',
        //     title: 'Diễn đàn test',
        // }]
        // console.log('res', response)
        if (response) {
            // setForums(response);
            dispatch(ForumsActions.setForums(response));
            setLoading(false)
        } else {
            setLoading(false)
        }
    };

    // useEffect(() => {
    //     // getForums();
    //     setForums([ {
    //         description: 'Server test',
    //         logo_small_url: 'http://chuyenmon.eup.vn/images/discourse-logo-sketch-small.png',
    //         site: 'http://127.0.0.1:4200',
    //         title: 'Diễn đàn test',
    //     } ]);
    // }, []);

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
    return (
        <View style={styles.container}>
            {forums?.length > 0
                ? <FlatList
                    data={forums}
                    style={{ backgroundColor: 'transparent' }}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.site} // Dùng site làm key duy nhất
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                    ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
                    refreshControl={<RefreshControl refreshing={loading} onRefresh={() => {
                        handleRefresh().then(() => {
                            // getForums()
                        })
                    }} />}
                />
                : <View style={{
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    {/* <LottieView
                        source={require('@/loties/loading.json')}
                        style={{
                            width: 200,
                            height: 200,
                            alignSelf: 'center'
                        }}
                        autoPlay
                        loop
                    /> */}
                </View>
            }
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1
        // paddingVertical: 20,
        // marginTop: 20
        // backgroundColor: '#f5f5f5',
    },
    listContainer: {
        // paddingBottom: 20,
    }
});

export default React.memo(ForumList);