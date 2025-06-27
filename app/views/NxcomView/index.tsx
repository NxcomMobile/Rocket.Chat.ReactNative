/* eslint-disable import/order */
import React, { useLayoutEffect } from 'react';

import { NativeStackNavigationOptions } from '@react-navigation/native-stack';

import * as HeaderButton from '../../containers/Header/components/HeaderButton';
import KeyboardView from '../../containers/KeyboardView';
import I18n from '../../i18n';
import { useAppSelector } from '../../lib/hooks';
import EventEmitter from '../../lib/methods/helpers/events';
import sharedStyles from '../Styles';
import NxWebview from './NxWebview';

const NxcomView = ({ navigation }: any): React.ReactElement => {
    // const dispatch = useDispatch();
    const { isMasterDetail } = useAppSelector((state) => state.app);
    const nxforumAuth = useAppSelector((state) => state.nxforumAuth);
    // const [ tabs, setTabs ] = React.useState<any>([])

    const { forums } = useAppSelector((state) => state.forums);
    const options: NativeStackNavigationOptions = {
        title: I18n.t('NxForums')
    };

    const [ forum, setForum ] = React.useState<{
        site: string,
        redirect_url: string,
        title?: string,
        role?: string

    }>({
        site: '',
        redirect_url: '',
        title: '',
        role: 'guest'
    });

    React.useEffect(() => {
        console.log('NxcomView mounted', forums, nxforumAuth);

        if (forums && !forum.site && !forum.redirect_url) {
            setForum({
                site: forums?.[ 0 ]?.site,
                redirect_url: forums?.[ 0 ]?.site,
                title: forums?.[ 0 ]?.title || 'Nx Forums',
                role: nxforumAuth.isAuthenticated ? 'user' : 'guest'
            });
        }
    }, [ forums, nxforumAuth.isAuthenticated ]);

    React.useEffect(() => {
        const listener = EventEmitter.addEventListener('Nxcom:changeForum', (data: any) => {
            console.log('CHANGE_FORUM event received', data);
            setForum({
                site: data.site_url,
                redirect_url: data.redirect_url,
                title: data.title || 'Nx Forums',
                role: data.role || 'guest'
            });
        });
        return () => {
            EventEmitter.removeListener('Nxcom:changeForum', listener);
        };
    }, []);


    useLayoutEffect(() => {
        // const options: NativeStackNavigationOptions = {
        //     title: I18n.t('NxForums')
        // };

        // if (!isMasterDetail) {
        //     options.headerLeft = () => <HeaderButton.Drawer accessibilityLabel={I18n.t('Open_sidebar')} navigation={navigation} />;
        // }
        options.headerLeft = () => <HeaderButton.Drawer accessibilityLabel={I18n.t('Open_sidebar')} navigation={navigation} />;

        options.headerRight = () => <HeaderButton.Item iconName='refresh' onPress={() => EventEmitter.emit('Nxcom:reloadWebView')} />;

        navigation.setOptions(options);
    }, []);


    return (
        <KeyboardView contentContainerStyle={sharedStyles.container} keyboardVerticalOffset={128}>
            {/* <StatusBar />
            <SafeAreaView testID='forum-view'>
                <UserHeader user={nxforumAuth.user} />
                <View />
            </SafeAreaView> */}
            <NxWebview site_url={forum.site} redirect_url={forum.redirect_url} title={forum.title} role={forum.role} />
        </KeyboardView>
    );
};

export default NxcomView;
