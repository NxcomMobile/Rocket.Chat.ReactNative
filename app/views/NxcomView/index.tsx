/* eslint-disable import/order */
import React, { useEffect } from 'react';

// Import các component cần thiết
import {
	ActivityIndicator,
	Alert,
	Text,
	View
} from 'react-native';
import { useDispatch } from 'react-redux';

import { useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationOptions } from '@react-navigation/native-stack';

// Import các component và module nội bộ
import * as HeaderButton from '../../containers/Header/components/HeaderButton';
import KeyboardView from '../../containers/KeyboardView';
import I18n from '../../i18n';
import { useAppSelector } from '../../lib/hooks';
import EventEmitter from '../../lib/methods/helpers/events';
import sharedStyles from '../Styles';
import storageService from './helper/storage_service'; // << IMPORT STORAGE SERVICE MỚI
import NxWebview from './NxWebview';
import gwServices from './service/gw_service';
import { ForumsActions } from './stores/Forums/actions';

interface NxcomViewProps {
    navigation: any;
}

const NxcomView = ({ navigation }: NxcomViewProps): React.ReactElement => {
    const dispatch = useDispatch();

    // Vẫn lấy forums và nxforumAuth từ Redux
    const { forums } = useAppSelector(state => state.forums);
    const nxforumAuth = useAppSelector(state => state.nxforumAuth);

    const [ isLoading, setIsLoading ] = React.useState(true); // Mặc định là true để tải forum đã lưu
    const [ forum, setForum ] = React.useState<{
        site: string;
        redirect_url: string;
        title?: string;
        role?: string;
    }>({
        site: '',
        redirect_url: '',
        title: '',
        role: 'guest'
    });

    // Sử dụng useFocusEffect để tải danh sách forum (nếu chưa có)
    useFocusEffect(
        React.useCallback(() => {
            const fetchInitialForums = async () => {
                if (forums && forums.length > 0) {
                    setIsLoading(false); // Đã có forums, không cần loading
                    return;
                }

                setIsLoading(true);
                try {
                    const response = await gwServices.getForumSites();
                    if (response) {
                        dispatch(ForumsActions.setForums(response));
                    }
                } catch (error) {
                    console.error('Failed to fetch forums in NxcomView:', error);
                    Alert.alert('Network Error', 'Could not load the list of forums.');
                } finally {
                    setIsLoading(false);
                }
            };
            fetchInitialForums();
        }, [ forums, dispatch ])
    );

    // useEffect để thiết lập forum mặc định hoặc forum đã được lưu
    React.useEffect(() => {
        const setInitialForum = async () => {
            if (forums && forums.length > 0) {
                // Ưu tiên 1: Lấy forum từ bộ nhớ thiết bị
                const lastFocusedSite = await storageService.getLastFocusedForum();
                const lastForum = forums.find(f => f.site === lastFocusedSite);

                if (lastForum) {
                    setForum({
                        site: lastForum.site,
                        redirect_url: lastForum.site,
                        title: lastForum.title || 'Nx Forums',
                        role: nxforumAuth.isAuthenticated ? 'user' : 'guest'
                    });
                } else { // Ưu tiên 2: Lấy forum đầu tiên nếu không có
                    setForum({
                        site: forums[ 0 ].site,
                        redirect_url: forums[ 0 ].site,
                        title: forums[ 0 ].title || 'Nx Forums',
                        role: nxforumAuth.isAuthenticated ? 'user' : 'guest'
                    });
                }
            }
        };
        setInitialForum();
    }, [ forums, nxforumAuth.isAuthenticated ]); // Chạy khi danh sách forums thay đổi

    // useEffect để lắng nghe sự kiện chuyển forum và LƯU VÀO BỘ NHỚ
    React.useEffect(() => {
        const listener = EventEmitter.addEventListener('Nxcom:changeForum', (data: any) => {
            setForum({
                site: data.site_url,
                redirect_url: data.redirect_url,
                title: data.title || 'Nx Forums',
                role: data.role || 'guest'
            });
            // LƯU TRỰC TIẾP VÀO BỘ NHỚ
            storageService.saveLastFocusedForum(data.site_url);
        });
        return () => {
            EventEmitter.removeListener('Nxcom:changeForum', listener);
        };
    }, []); // Chỉ cần chạy một lần

    // Cài đặt header (giữ nguyên)
    useEffect(() => {
        const options: NativeStackNavigationOptions = { title: forum?.title || I18n.t('NxForums') };
        options.headerLeft = () => <HeaderButton.Drawer accessibilityLabel={I18n.t('Open_sidebar')} navigation={navigation} />;
        options.headerRight = () => <HeaderButton.Item iconName='refresh' onPress={() => EventEmitter.emit('Nxcom:reloadWebView')} />;
        navigation.setOptions(options);
    }, [ navigation, forum?.title ]);

    // Render loading hoặc giao diện chính
    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size='large' />
            </View>
        );
    }

    if (!forum.site) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
                <Text style={{ textAlign: 'center' }}>No forums available. Please check your connection or select one from the sidebar.</Text>
            </View>
        );
    }

    return (
        <KeyboardView contentContainerStyle={sharedStyles.container} keyboardVerticalOffset={128}>
            <NxWebview site_url={forum.site} redirect_url={forum.redirect_url} title={forum.title} role={forum.role} />
        </KeyboardView>
    );
};

export default NxcomView;