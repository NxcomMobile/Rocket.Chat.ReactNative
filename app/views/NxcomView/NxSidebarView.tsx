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
import ForumItem from './component/forum_item';
// Không cần import gwServices và ForumsActions ở đây nữa
import { AuthActions } from './stores/Auth/actions';

const NxSidebar = (props: DrawerContentComponentProps) => {
    const { theme } = React.useContext(ThemeContext);
    const { isMasterDetail } = useAppSelector((state) => state.app);
    const nxforumAuth = useAppSelector((state) => state.nxforumAuth);
    // Dữ liệu forums sẽ được lấy trực tiếp từ Redux state
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

    // ĐÃ XÓA useEffect gọi getForums() ở đây.

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
                        </View>
                    </View>
                </TouchableWithoutFeedback>
                {/* Render danh sách forums đã có sẵn */}
                {forums && forums.map((forum: any, index: number) => renderForumItem({ forum, index }))}
                {nxforumAuth?.isAuthenticated && <Button
                    title='Logout'
                    onPress={() => dispatch(AuthActions.logout())}
                />}
            </DrawerContentScrollView>
        </SafeAreaView>
    );
};

// ... styles không đổi ...
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
        fontSize: 14
        // ...sharedStyles.textMedium
    },
    avatar: {
        marginHorizontal: 10
    }
});

export default NxSidebar;