import {
	PermissionsAndroid,
	Platform
} from 'react-native';
import {
	Notification,
	NotificationAction,
	NotificationCategory,
	NotificationCompletion,
	Notifications,
	Registered,
	RegistrationError
} from 'react-native-notifications';

import messaging from '@react-native-firebase/messaging'; // <--- THÊM IMPORT NÀY

import { INotification } from '../../definitions';
import I18n from '../../i18n';
import { isIOS } from '../methods/helpers';
import { store as reduxStore } from '../store/auxStore';

export let deviceToken = '';
export let fcmToken = '';
export const setNotificationsBadgeCount = (count = 0): void => {
	if (isIOS) {
		Notifications.ios.setBadgeCount(count);
	}
};

export const removeAllNotifications = (): void => {
	Notifications.removeAllDeliveredNotifications();
};

let configured = false;

export const pushNotificationConfigure = (onNotification: (notification: INotification) => void): Promise<any> => {
	if (configured) {
		return Promise.resolve({ configured: true });
	}

	configured = true;

	if (isIOS) {
		// init
		Notifications.ios.registerRemoteNotifications();

		const notificationAction = new NotificationAction('REPLY_ACTION', 'background', I18n.t('Reply'), true, {
			buttonTitle: I18n.t('Reply'),
			placeholder: I18n.t('Type_message')
		});
		const acceptAction = new NotificationAction('ACCEPT_ACTION', 'foreground', I18n.t('accept'), true);
		const rejectAction = new NotificationAction('DECLINE_ACTION', 'foreground', I18n.t('decline'), true);

		const notificationCategory = new NotificationCategory('MESSAGE', [ notificationAction ]);
		const videoConfCategory = new NotificationCategory('VIDEOCONF', [ acceptAction, rejectAction ]);

		Notifications.setCategories([ videoConfCategory, notificationCategory ]);
	} else if (Platform.OS === 'android' && Platform.constants.Version >= 33) {
		// @ts-ignore
		PermissionsAndroid.request('android.permission.POST_NOTIFICATIONS').then(permissionStatus => {
			if (permissionStatus === 'granted') {
				Notifications.registerRemoteNotifications();
			} else {
				// TODO: Ask user to enable notifications
			}
		});
	} else {
		Notifications.registerRemoteNotifications();
	}

	Notifications.events().registerRemoteNotificationsRegistered(async (event: Registered) => {
		deviceToken = event.deviceToken;
		console.log('[Push Notification]  Device token registered:', deviceToken);

		if (deviceToken && isIOS) {
			try {
				// Bước 1: Đưa APNs token cho Firebase
				await messaging().setAPNSToken(deviceToken);

				// Bước 2: Sau khi set thành công, gọi getToken() để lấy FCM token
				const token = await messaging().getToken();
				console.log('[Push Notification] Successfully bridged to FCM token:', token);

				// Bước 3: Lưu FCM token vào biến toàn cục của bạn
				fcmToken = token;

				// Tại đây, bạn có thể gọi hàm để gửi fcmToken lên server của mình
				// ví dụ: sendTokenToServer(fcmToken);

			} catch (error) {
				console.error('[Push Notification] Error bridging APNs to FCM token:', error);
			}
		}
	});

	Notifications.events().registerRemoteNotificationsRegistrationFailed((event: RegistrationError) => {
		// TODO: Handle error
		console.log(event);
	});

	Notifications.events().registerNotificationReceivedForeground(
		(notification: Notification, completion: (response: NotificationCompletion) => void) => {
			completion({ alert: false, sound: false, badge: false });
		}
	);

	Notifications.events().registerNotificationOpened((notification: Notification, completion: () => void) => {
		if (isIOS) {
			const { background } = reduxStore.getState().app;
			if (background) {
				onNotification(notification);
			}
		} else {
			onNotification(notification);
		}
		completion();
	});

	Notifications.events().registerNotificationReceivedBackground(
		(notification: Notification, completion: (response: any) => void) => {
			completion({ alert: true, sound: true, badge: false });
		}
	);

	return Notifications.getInitialNotification();
};
