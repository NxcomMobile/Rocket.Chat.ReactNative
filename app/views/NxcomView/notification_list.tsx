import React, { useState } from 'react';

import {
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withTiming
} from 'react-native-reanimated';

import { CustomIcon } from '../../containers/CustomIcon';
import Navigation from '../../lib/navigation/appNavigation';
import UnreadChannels from './component/unread_channels';
import { convertHttpToHttps } from './utils';

const getNotificationIcon = (type: number) => {
    switch (type) {
        case 1:
        case 2:
        case 3:
        case 9:
        case 10:
        case 17:
            return <CustomIcon name='arrow-back' size={20} color='#666' />;
        case 5:
        case 19:
        case 25:
            return <CustomIcon name='heart' size={20} color='#e74c3c' />;
        case 6:
        case 7:
            return <CustomIcon name='mail' size={20} color='#3498db' />;
        case 18:
        case 24:
            return <CustomIcon name='book' size={20} color='#f39c12' />;
        case 20:
        case 21:
        case 22:
        case 23:
        case 37:
            return <CustomIcon name='flag' size={20} color='#9b59b6' />;
        case 4:
        case 8:
        case 11:
        case 12:
        case 13:
        case 14:
        case 15:
        case 16:
        case 26:
        case 27:
        case 28:
            return <CustomIcon name='notification' size={20} color='#9b59b6' />;
        default:
            return null;
    }
};


/**
 * @param {{ notification: Notification }} props
 */
const NotificationItem = ({ notification }: any) => {
    const opacity = useSharedValue(1);  // Initial opacity
    const { notification_type, data, created_at, site_url, topic_id, post_number, slug } = notification; // Include slug
    // const router = useRouter();
    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value
        // height: height.value,
    }));

    /**
     * @param {number} type
     * @param {NotificationData} data
     */
    const renderNotificationContent = (type: number, data: any) => {
        const {
            original_username,
            topic_title,
            display_username,
            badge_name,
            username,
            count,
            message
        } = data;

        switch (type) {
            case 1: // mentioned
                return (
                    <Text style={styles.notificationText}>
                        <Text style={styles.bold}>{original_username}</Text> mentioned you in the post "<Text
                            style={styles.bold}>{topic_title}</Text>".
                    </Text>
                );
            case 2: // replied
                return (
                    <Text style={styles.notificationText}>
                        <Text style={styles.bold}>{original_username}</Text> replied to your post in the topic "<Text
                            style={styles.bold}>{topic_title}</Text>".
                    </Text>
                );
            case 3: // quoted
                return (
                    <Text style={styles.notificationText}>
                        <Text style={styles.bold}>{original_username}</Text> quoted your post in the topic "<Text
                            style={styles.bold}>{topic_title}</Text>".
                    </Text>
                );
            case 4: // edited
                return (
                    <Text style={styles.notificationText}>
                        <Text style={styles.bold}>{original_username}</Text> edited the post "<Text
                            style={styles.bold}>{topic_title}</Text>".
                    </Text>
                );
            case 5: // liked
                return (
                    <Text style={styles.notificationText}>
                        <Text style={styles.bold}>{original_username}</Text> liked your post in the topic "<Text
                            style={styles.bold}>{topic_title}</Text>".
                    </Text>
                );
            case 6: // private_message
                return (
                    <Text style={styles.notificationText}>
                        <Text style={styles.bold}>{original_username}</Text> sent you a private message titled "<Text
                            style={styles.bold}>{topic_title}</Text>".
                    </Text>
                );
            case 7: // invited_to_private_message
                return (
                    <Text style={styles.notificationText}>
                        <Text style={styles.bold}>{original_username}</Text> invited you to the private message "<Text
                            style={styles.bold}>{topic_title}</Text>".
                    </Text>
                );
            case 8: // invitee_accepted
                return (
                    <Text style={styles.notificationText}><Text style={styles.bold}>{original_username}</Text> accepted
                        your invitation.</Text>
                );
            case 9: // posted
                return (
                    <Text style={styles.notificationText}>
                        <Text style={styles.bold}>{original_username}</Text> posted in the topic "<Text
                            style={styles.bold}>{topic_title}</Text>".
                    </Text>
                );
            case 10: // moved_post
                return (
                    <Text style={styles.notificationText}>
                        Your post was moved to the topic "<Text style={styles.bold}>{topic_title}</Text>" by <Text
                            style={styles.bold}>{original_username}</Text>.
                    </Text>
                );
            case 11: // linked
                return (
                    <Text style={styles.notificationText}>
                        <Text style={styles.bold}>{original_username}</Text> linked to your post in the topic "<Text
                            style={styles.bold}>{topic_title}</Text>".
                    </Text>
                );
            case 12: // granted_badge
                return (
                    <Text style={styles.notificationText}>
                        You were granted the badge <Text style={styles.bold}>{badge_name}</Text>.
                    </Text>
                );
            case 13: // invited_to_topic
                return (
                    <Text style={styles.notificationText}>
                        <Text style={styles.bold}>{original_username}</Text> invited you to the topic "<Text
                            style={styles.bold}>{topic_title}</Text>".
                    </Text>
                );
            case 14: // custom
                return (
                    <Text style={styles.notificationText}>
                        Custom notification: {message}
                    </Text>
                );
            case 15: // group_mentioned
                return (
                    <Text style={styles.notificationText}>
                        Your group was mentioned by <Text style={styles.bold}>{original_username}</Text> in the topic
                        "<Text style={styles.bold}>{topic_title}</Text>".
                    </Text>
                );
            case 16: // group_message_summary
                return <Text style={styles.notificationText}>Group message summary.</Text>;

            case 17: // watching_first_post
                return (
                    <Text style={styles.notificationText}>
                        <Text style={styles.bold}>{original_username}</Text> posted a new post in the topic "<Text
                            style={styles.bold}>{topic_title}</Text>" that you are watching.
                    </Text>
                );
            case 18: // topic_reminder
                return (
                    <Text style={styles.notificationText}>
                        Reminder about the topic "<Text style={styles.bold}>{topic_title}</Text>".
                    </Text>
                );
            case 19: // liked_consolidated
                return (
                    <Text style={styles.notificationText}>
                        <Text style={styles.bold}>{username}</Text> and {count} others liked your post.
                    </Text>
                );
            case 20: // post_approved
                return (
                    <Text style={styles.notificationText}>
                        Your post in the topic "<Text style={styles.bold}>{topic_title}</Text>" has been approved.
                    </Text>
                );
            case 21: // code_review_commit_approved
                return <Text style={styles.notificationText}>Code review commit has been approved.</Text>;
            case 22: // membership_request_accepted
                return <Text style={styles.notificationText}>Your membership request has been accepted.</Text>;
            case 23: // membership_request_consolidated
                return <Text style={styles.notificationText}>Membership request has been processed.</Text>;
            case 24: // bookmark_reminder
                return (
                    <Text style={styles.notificationText}>
                        Reminder about your bookmark in the topic "<Text style={styles.bold}>{topic_title}</Text>".
                    </Text>
                );
            case 25: // reaction
                return (
                    <Text style={styles.notificationText}>
                        <Text style={styles.bold}>{username}</Text> reacted to your post.
                    </Text>
                );
            case 26: // votes_released
                return (
                    <Text style={styles.notificationText}>
                        Votes in the topic "<Text style={styles.bold}>{topic_title}</Text>" have been released.
                    </Text>
                );
            case 27: // event_reminder
                return <Text style={styles.notificationText}>Event reminder.</Text>;
            case 28: // event_invitation
                return (
                    <Text style={styles.notificationText}>
                        <Text style={styles.bold}>{original_username}</Text> invited you to an event.
                    </Text>
                );
            case 37:
                return (
                    <Text style={styles.notificationText}>
                        Admin notice.
                    </Text>
                )
            default:
                return <Text style={styles.notificationText}>Notification type: {type}</Text>;
        }
    };
    // --- Helper Function ---

    // Updated generatePostUrl function
    const generatePostUrl = (siteUrl: string, slug: string | null, topicId: number | null, postNumber: number | null): string => {
        if (!topicId || !slug) {
            return siteUrl; // Fallback to site URL if no topic ID or slug.
        }

        const baseUrl = `${convertHttpToHttps(siteUrl)}/t/${slug}/${topicId}`;

        if (postNumber) {
            return `${baseUrl}/${postNumber}`;
        }

        return baseUrl;
    };
    const handlePress = async (site_url: string) => {
        const siteConverted = convertHttpToHttps(site_url);
        const url = generatePostUrl(siteConverted, slug, topic_id, post_number);
        console.log('url', url);
        Navigation.navigate('NxWebview', {
            site_url: siteConverted, redirect_url: url, title: ''
        });
        // router.push({
        //     pathname: '/webview', // Đường dẫn mới
        //     params: { site_url: siteConverted, redirect_url: url, title: '' },
        // });
    };
    return (
        <TouchableOpacity onPress={() => handlePress(site_url)}>
            <Animated.View style={[ styles.notificationItem, {
                backgroundColor: notification?.read ? 'transparent' : '#e6e6e6',
                flexDirection: 'row',
                flex: 1
            }, animatedStyle ]}>
                {getNotificationIcon(notification.notification_type)}
                {renderNotificationContent(notification.notification_type, notification.data)}
            </Animated.View>
        </TouchableOpacity>
    );
};


/**
 * @param {{ group: GroupedNotification }} props
 */
export const NotificationGroup = ({ group, chat }: { group: any, chat?: any }) => {
    const [ expanded, setExpanded ] = useState(true); // Controls expansion of each group
    const rotation = useSharedValue(0); // For animating a dropdown arrow (optional)

    const animatedArrowStyle = useAnimatedStyle(() => ({
        transform: [ { rotateZ: `${rotation.value}deg` } ]
    }));
    const toggleExpanded = () => {
        // Animate rotation (optional)
        rotation.value = withTiming(expanded ? 0 : 180, { duration: 300, easing: Easing.bezier(0.25, 0.1, 0.25, 1) });

        setExpanded(!expanded);
    };

    return (
        <View style={styles.groupContainer}>
            <TouchableOpacity style={styles.groupHeader} onPress={toggleExpanded}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start' }}>
                    <Image source={{ uri: group.mobile_logo_url }}
                        style={{
                            width: 40,
                            height: 40,
                            marginRight: 10,
                            backgroundColor: '#fff',
                            padding: 4,
                            borderRadius: 50
                        }}
                        resizeMode={'contain'} />
                    <View>
                        <Text style={styles.groupTitle}>{group.title}</Text>
                        <Text style={styles.groupSite}>{group.site}</Text>
                    </View>
                </View>
                <Animated.Text style={[ styles.arrow, animatedArrowStyle ]}>▾</Animated.Text>
            </TouchableOpacity>

            {expanded && (<>
                <View style={{
                    margin: 10,
                    backgroundColor: 'transparent',
                    borderBottomWidth: 1,
                    borderBottomColor: '#ddd'
                }}>
                    <UnreadChannels site={group.site} />
                </View>
                <FlatList
                    data={group.notifications}
                    renderItem={({ item }) => <NotificationItem notification={item} />}
                    keyExtractor={(item) => item.id} // Use a unique key
                />
            </>
            )}

        </View>
    );
};

const styles = StyleSheet.create({
    listContainer: {
        // padding: 10,
        paddingBottom: 40
    },
    groupContainer: {
        marginBottom: 10,
        borderColor: '#ddd',
        borderWidth: 1,
        borderRadius: 5
    },
    groupHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
        backgroundColor: '#f1e2ff',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd'
    },
    groupTitle: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    groupSite: {
        fontStyle: 'italic',
        fontSize: 12,
        color: '#5faafd',
        textDecorationLine: 'underline'
    },
    arrow: {
        fontSize: 20, // Adjust size as needed
        color: '#888' // Adjust color as needed
    },
    notificationItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        backgroundColor: 'red'
    },
    notificationText: {
        fontSize: 14,
        flex: 1,
        marginLeft: 8
        // backgroundColor: 'green'
        // lineHeight: 20,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 20,
        color: '#888'
    },
    bold: { fontWeight: 'bold' },
    chatChannelItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        flexDirection: 'row',
        alignItems: 'center'// Center items vertically in chat channel items
    },
    chatChannelTitle: {
        fontSize: 14,
        fontWeight: 'bold'
    },
    unreadCount: {
        fontSize: 12,
        color: 'red',
        fontWeight: 'bold'
    }
});