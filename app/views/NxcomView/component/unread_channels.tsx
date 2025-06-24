import React, { useEffect } from 'react';

import {
	FlatList,
	Image,
	StyleSheet,
	Text,
	TouchableOpacity,
	View
} from 'react-native';

import { useAppSelector } from '../../../lib/hooks/useAppSelector';

// Component hiển thị danh sách channel có unread_count > 0
const UnreadChannels = ({ site }: { site: string }) => {
    const { chat } = useAppSelector(state => state.forums);
    // const router = useRouter();
    // const [loaddingUnread, setLoaddingUnread] = React.useState<boolean>(false);
    const [ unreadChannels, setUnreadChannels ] = React.useState<any[]>([]);
    // Lọc các channel có unread_count > 0 và following: true
    const getUnreadChannels = () => {
        // setLoaddingUnread(true);
        const siteData = chat.find((data: any) => data.site === site);
        if (!siteData) return [];
        if (!siteData?.public_channels && !siteData?.direct_message_channels) return []
        const allChannels = [
            ...siteData?.public_channels,
            ...siteData?.direct_message_channels
        ];

        const unread = allChannels
            .filter(channel => {
                const channelId = channel.channel.id.toString();
                const tracking = siteData.tracking.channel_tracking[ channelId ];
                return tracking && tracking.unread_count > 0;
            })
            .map(channel => ({
                ...channel,
                id: channel.channel.id,
                title: channel.channel.title,
                avatar: channel.channel.chatable.users?.[ 0 ]?.avatar_template || null,
                unreadCount: siteData.tracking.channel_tracking[ channel.channel.id.toString() ].unread_count,
                site
            }));
        // setLoaddingUnread(false);
        setUnreadChannels(unread);
    };
    useEffect(() => {
        if (!chat) return;
        getUnreadChannels();
    }, [ chat ]);

    const getChannelUrl = (channelData: any) => {
        const { site } = channelData;
        const slug = channelData.channel.slug || channelData.channel.title.toLowerCase();
        const chatChannelId = channelData.channel.current_user_membership.chat_channel_id; // Dùng chat_channel_id
        return `${site}/chat/c/${slug}/${chatChannelId}`;
    };

    const handlePress = async (channel: any) => {
        const chatUrl = getChannelUrl(channel);
        console.log('handlePress', channel, chatUrl);
        // const siteConverted = convertHttpToHttps(site_url);
        // const url = generatePostUrl(siteConverted, slug, topic_id, post_number);
        //
        // router.push({
        //     pathname: '/webview', // Đường dẫn mới
        //     params: {site_url: channel.site, redirect_url: chatUrl, title: channel?.title || ''},
        // });
    };
    // useEffect(() => {
    //     console.log('unreadChannels', unreadChannels);
    // }, [unreadChannels]);
    // Render mỗi item là một circle avatar với badge
    const renderItem = ({ item }: { item: any }) => {
        const avatarUrl = item.avatar
            ? `${site}${item.avatar.replace('{size}', '64')}`
            : 'https://via.placeholder.com/64'; // Placeholder nếu không có avatar

        return (
            <TouchableOpacity style={styles.avatarContainer} onPress={() => handlePress(item)}>
                <Image source={{ uri: avatarUrl }} style={styles.avatar} />
                {item.unreadCount > 0 && (
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>
                            {item.unreadCount > 9 ? '9+' : item.unreadCount}
                        </Text>
                    </View>
                )}
                <Text style={styles.channelTitle}>{item.title}</Text>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            {unreadChannels.length > 0 ? (
                <FlatList
                    data={unreadChannels}
                    renderItem={renderItem}
                    keyExtractor={item => item.id.toString()}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                />
            ) : (
                <Text style={styles.noUnreadText}>No unread messages</Text>
            )}
        </View>
    );
};


export default React.memo(UnreadChannels)

// Styles
const styles = StyleSheet.create({
    container: {
        paddingVertical: 10
    },
    avatarContainer: {
        alignItems: 'center',
        marginHorizontal: 10
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 32
    },
    badge: {
        position: 'absolute',
        top: 0,
        right: 0,
        backgroundColor: 'red',
        borderRadius: 10,
        width: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center'
    },
    badgeText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold'
    },
    channelTitle: {
        marginTop: 5,
        fontSize: 12,
        color: '#333'
    },
    noUnreadText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center'
    }
});