import React, { useEffect } from 'react';

import {
    ActivityIndicator,
    StyleSheet,
    View
} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import WebView from 'react-native-webview';

import { useAppSelector } from '../../lib/hooks';
import EventEmitter from '../../lib/methods/helpers/events';
import { getFcmToken } from '../../lib/notifications';
import { convertHttpToHttps } from './utils';

interface NxWebviewProps {
    site_url: string;
    redirect_url: string;
    title?: string;
    role?: string;
}
const NxWebview = ({
    site_url,
    redirect_url,
    role
}: NxWebviewProps): React.ReactElement => {
    const [ site, setSite ] = React.useState<string>();
    const { accessToken, isAuthenticated } = useAppSelector(state => state.nxforumAuth);
    const [ headers, setHeaders ] = React.useState<any>();
    const webviewRef = React.useRef<WebView>(null);
    // const [forum, setForum] = React.useState<any>();
    React.useEffect(() => {
        const lístener = EventEmitter.addEventListener('Nxcom:reloadWebView', () => {
            if (webviewRef.current) {
                webviewRef.current.reload();
            }
        }
        );
        return () => {
            EventEmitter.removeListener('Nxcom:reloadWebView', lístener);
        };
    }
        , []);

    useEffect(() => {
        if (role === 'guest') {
            setHeaders({});
            setSite(site_url);
            webviewRef.current?.reload();

        } else if (accessToken && site_url && redirect_url) {
            updateHeader();
            webviewRef.current?.reload();
        }
    }, [ accessToken, site_url, redirect_url, role ]);

    const updateHeader = async () => {
        const header = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
            'Device-Id': await DeviceInfo.getUniqueId(),
            'Message-Token': getFcmToken(),
            'Device-Name': await DeviceInfo.getDeviceName()
        }
        console.log('header', header);
        setHeaders(header);
        setSite(`${convertHttpToHttps(site_url)}/mobile-keycloak-auth/verify?redirect_url=${convertHttpToHttps(redirect_url)}`);

    }
    return (
        <View style={styles.container}>
            {headers && site ?

                <WebView
                    ref={webviewRef}
                    source={{
                        uri: site, headers: { ...headers }
                    }}
                    // incognito={true}

                    onLoadStart={(syntheticEvent) => {

                        // xoá cookie cũ của trang web

                        // console.log('WebView onLoadStart', syntheticEvent.nativeEvent);

                        // const { nativeEvent } = syntheticEvent;
                        // console.log('WebView started loading:', nativeEvent);
                    }
                    }
                    scrollEnabled
                    style={styles.webview}
                    startInLoadingState={true} // Hiển thị loading khi tải
                    renderLoading={() => (
                        <ActivityIndicator size={'large'} />
                    )}
                    onError={(syntheticEvent) => {
                        const { nativeEvent } = syntheticEvent;
                        console.error('WebView General Error:', {
                            code: nativeEvent.code,
                            description: nativeEvent.description,
                            url: nativeEvent.url
                        });
                    }}
                    onHttpError={(syntheticEvent) => {
                        const { nativeEvent } = syntheticEvent;
                        console.error('WebView HTTP Error:', {
                            statusCode: nativeEvent.statusCode,
                            description: nativeEvent.description,
                            url: nativeEvent.url
                        });
                        if (nativeEvent.statusCode == 401) {
                            // handleUnauthorizedError()
                        }
                    }}
                    onMessage={(event) => {
                        // console.log('WebView message received:', event.nativeEvent.data);
                        // const data = JSON.parse(event.nativeEvent.data);
                        // if (data.type === 'refreshToken') {
                        //     setRefreshToken(!refreshToken);
                        // }
                    }}
                    onLoadEnd={() => console.log('WebView loaded:', site)}
                />

                : <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <ActivityIndicator size={'large'} />
                </View>

            }
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff'
    },
    webview: {
        flex: 1
    }
});

export default NxWebview;