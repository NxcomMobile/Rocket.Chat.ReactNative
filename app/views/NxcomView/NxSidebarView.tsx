/* eslint-disable import/order */
import React from 'react';

import {
	Button,
	SafeAreaView,
	StyleSheet,
	Text,
	TouchableWithoutFeedback,
	View
} from 'react-native';
import { useDispatch } from 'react-redux';

import {
	DrawerContentComponentProps,
	DrawerContentScrollView
} from '@react-navigation/drawer';

import Avatar from '../../containers/Avatar';
import { themes } from '../../lib/constants';
import { useAppSelector } from '../../lib/hooks';
import { ThemeContext } from '../../theme';
import sharedStyles from '../Styles';
import ForumItem from './component/forum_item';
import gwServices from './service/gw_service';
import { AuthActions } from './stores/Auth/actions';
import { ForumsActions } from './stores/Forums/actions';

const NxSidebar = (props: DrawerContentComponentProps) => {
    const { theme } = React.useContext(ThemeContext);
    // TODO: Tùy chỉnh nội dung và các mục menu cho NxSidebar tại đây
    // Ví dụ: bạn có thể muốn các mục menu khác hoặc một tiêu đề khác
    const { isMasterDetail } = useAppSelector((state) => state.app);
    const nxforumAuth = useAppSelector((state) => state.nxforumAuth);
    const { forums } = useAppSelector(state => state.forums);

    const dispatch = useDispatch();
    const onPressUser = () => {
        if (!nxforumAuth?.isAuthenticated) {
            dispatch(AuthActions.loginRequest());
            return;
        }
        const { navigation } = props;
        if (isMasterDetail) {
            return;
        }
        navigation?.closeDrawer();
    };
    ``
    React.useEffect(() => {
        // console.log('NxSidebar mounted');
        getForums();
    }
        , []);

    const getForums = async () => {
        // console.log('getForums');
        // setLoading(true)
        const response = await gwServices.getForumSites();
        if (response) {
            // setForums(response);
            dispatch(ForumsActions.setForums(response));
            // setLoading(false)
        } else {
            // setLoading(false)
        }
    };


    const renderForumItem = ({ forum }: { forum: any; index: number }) => <ForumItem forum={forum} />;
    return (
        <SafeAreaView style={[ styles.container ]}>
            <DrawerContentScrollView {...props}>
                <TouchableWithoutFeedback onPress={onPressUser} testID='sidebar-close-drawer'>
                    <View style={[ styles.header, { backgroundColor: themes[ theme! ].surfaceRoom } ]}>
                        <Avatar text={nxforumAuth.user?.name} style={styles.avatar} size={30} />
                        <View style={styles.headerTextContainer}>
                            <View style={styles.headerUsername}>
                                <Text numberOfLines={1} style={[ styles.username, { color: themes[ theme! ].fontTitlesLabels } ]}>
                                    {nxforumAuth.user?.name || 'Login'}
                                </Text>
                            </View>
                            {/* <Text
                                style={[ styles.currentServerText, { color: themes[ theme! ].fontTitlesLabels } ]}
                                numberOfLines={1}
                                accessibilityLabel={`Connected to ${baseUrl}`}>
                                {Site_Name}
                            </Text> */}
                        </View>
                    </View>
                </TouchableWithoutFeedback>
                {/* Render the list of forums */}
                {forums && forums.map((forum: any, index: number) => renderForumItem({ forum, index }))}
                {nxforumAuth?.isAuthenticated && <Button
                    title='Logout'
                    onPress={() => dispatch(AuthActions.logout())}
                />}
            </DrawerContentScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    header: {
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#ccc'
    },
    headerTextContainer: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'flex-start'
    },
    headerUsername: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    username: {
        fontSize: 14,
        ...sharedStyles.textMedium
    },
    avatar: {
        marginHorizontal: 10
    }
    // currentServerText: {
    //     fontSize: 14,
    //     ...sharedStyles.textSemibold
    // }
});

export default NxSidebar;