import EJSON from 'ejson';

import {
	appInit,
	appStart
} from '../../actions/app';
import {
	deepLinkingClickCallPush,
	deepLinkingOpen
} from '../../actions/deepLinking';
import {
	INotification,
	RootEnum,
	SubscriptionType
} from '../../definitions';
import EventEmitter from '../methods/helpers/events';
import Navigation from '../navigation/appNavigation';
import { store } from '../store/auxStore';
import {
	deviceToken,
	fcmToken,
	pushNotificationConfigure,
	removeAllNotifications,
	setNotificationsBadgeCount
} from './push';

interface IEjson {
	rid: string;
	name: string;
	sender: { username: string; name: string };
	type: string;
	host: string;
	messageId: string;
}


const handleBackgroundNotification = async (notification: any) => {
	// Background state - app đã được khởi tạo, chỉ cần switch root
	store.dispatch(appStart({ root: RootEnum.ROOT_NX }));
	await new Promise(resolve => setTimeout(resolve, 500));

	// Navigate to forum via event system
	EventEmitter.emit('Nxcom:changeForum' as any, {
		site_url: notification.site_url,
		redirect_url: notification.post_url || notification.site_url,
		title: notification.title || 'Forum',
		role: 'user'
	} as any);
};

const handleKilledNotification = async (notification: any) => {
	try {
		// 1. First initialize the app
		await store.dispatch(appInit());

		// 2. Add small delay to allow init to complete
		await new Promise(resolve => setTimeout(resolve, 500));

		// 3. Force switch to NX root
		await store.dispatch(appStart({ root: RootEnum.ROOT_NX, forceUpdate: true }));

		// 4. Wait for navigation and login to be ready
		let ready = false;
		const waitForReady = new Promise<void>(resolve => {
			const check = () => {
				const state = store.getState();
				const isLoggedIn = state.login?.isAuthenticated;
				const isNavigationReady = Navigation.navigationRef.current?.isReady();

				if (isLoggedIn && isNavigationReady) {
					ready = true;
					resolve();
				} else {
					setTimeout(check, 100);
				}
			};
			check();
		});

		// Add timeout
		await Promise.race([
			waitForReady,
			new Promise(resolve => setTimeout(resolve, 5000)) // Increased timeout
		]);

		if (!ready) {
			console.warn('Navigation or login not ready after timeout');
			store.dispatch(appInit()); // Retry app init as fallback
			return;
		}

		// 4. Add small delay to let final state settle
		await new Promise(resolve => setTimeout(resolve, 300));

		// 5. Navigate to forum
		EventEmitter.emit('Nxcom:changeForum' as any, {
			site_url: notification.site_url,
			redirect_url: notification.post_url || notification.site_url,
			title: notification.title || 'Forum',
			role: 'user'
		} as any);

	} catch (error) {
		console.warn('Error handling killed state notification:', error);
		store.dispatch(appInit());
	}
};

const handleForumNotification = async (notification: any) => {
	try {
		// Determine app state and handle accordingly
		if (Navigation.navigationRef.current?.isReady()) {
			await handleBackgroundNotification(notification);
		} else {
			await handleKilledNotification(notification);
		}
	} catch (error) {
		console.warn('Error handling forum notification:', error);
		store.dispatch(appInit());
	}
};

export const onNotification = async (push: INotification): Promise<void> => {
	const identifier = String(push?.payload?.action?.identifier);
	if (identifier === 'ACCEPT_ACTION' || identifier === 'DECLINE_ACTION') {
		if (push?.payload && push?.payload?.ejson) {
			const notification = EJSON.parse(push?.payload?.ejson);
			store.dispatch(deepLinkingClickCallPush({ ...notification, event: identifier === 'ACCEPT_ACTION' ? 'accept' : 'decline' }));
			return;
		}
	}
	if (push?.payload) {
		try {
			const notification = push?.payload;

			// Handle forum notifications with site_url
			if (notification.site_url) {
				await handleForumNotification(notification);
				return;
			}

			// Handle regular Rocket.Chat notifications
			if (notification.ejson) {
				const { rid, name, sender, type, host, messageId }: IEjson = EJSON.parse(notification.ejson);

				const types: Record<string, string> = {
					c: 'channel',
					d: 'direct',
					p: 'group',
					l: 'channels'
				};
				let roomName = type === SubscriptionType.DIRECT ? sender.username : name;
				if (type === SubscriptionType.OMNICHANNEL) {
					roomName = sender.name;
				}

				const params = {
					host,
					rid,
					messageId,
					path: `${types[ type ]}/${roomName}`
				};
				store.dispatch(deepLinkingOpen(params));
				return;
			}
		} catch (e) {
			console.warn(e);
		}
	}
	store.dispatch(appInit());
};

export const getDeviceToken = (): string => deviceToken;
export const getFcmToken = (): string => fcmToken;
export const setBadgeCount = (count?: number): void => setNotificationsBadgeCount(count);
export const removeNotificationsAndBadge = () => {
	removeAllNotifications();
	setBadgeCount();
};
export const initializePushNotifications = (): Promise<INotification> | undefined => {
	setBadgeCount();
	return pushNotificationConfigure(onNotification);
};
