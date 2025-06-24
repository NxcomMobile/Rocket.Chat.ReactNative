import {
	all,
	call,
	delay,
	put,
	select,
	take,
	takeLatest
} from 'redux-saga/effects';

import * as types from '../actions/actionsTypes';
import {
	appInit,
	appStart
} from '../actions/app';
import {
	inviteLinksRequest,
	inviteLinksSetToken
} from '../actions/inviteLinks';
import { loginRequest } from '../actions/login';
import {
	selectServerRequest,
	serverInitAdd
} from '../actions/server';
import { shareSetParams } from '../actions/share';
import { RootEnum } from '../definitions';
import {
	CURRENT_SERVER,
	TOKEN_KEY
} from '../lib/constants';
import database from '../lib/database';
import { getServerById } from '../lib/database/services/Server';
import {
	canOpenRoom,
	getServerInfo
} from '../lib/methods';
import {
	emitter,
	getUidDirectMessage
} from '../lib/methods/helpers';
import EventEmitter from '../lib/methods/helpers/events';
import {
	goRoom,
	navigateToRoom
} from '../lib/methods/helpers/goRoom';
import { localAuthenticate } from '../lib/methods/helpers/localAuthentication';
import log from '../lib/methods/helpers/log';
import UserPreferences from '../lib/methods/userPreferences';
import { videoConfJoin } from '../lib/methods/videoConf';
import Navigation from '../lib/navigation/appNavigation';
import { Services } from '../lib/services';
import sdk from '../lib/services/sdk';

const roomTypes = {
	channel: 'c',
	direct: 'd',
	group: 'p',
	channels: 'l'
};

const handleInviteLink = function* handleInviteLink({ params, requireLogin = false }) {
	if (params.path && params.path.startsWith('invite/')) {
		const token = params.path.replace('invite/', '');
		if (requireLogin) {
			yield put(inviteLinksSetToken(token));
		} else {
			yield put(inviteLinksRequest(token));
		}
	}
};

const waitForNavigation = () => {
	if (Navigation.navigationRef.current) {
		return Promise.resolve();
	}
	return new Promise(resolve => {
		const listener = () => {
			emitter.off('navigationReady', listener);
			resolve();
		};

		emitter.on('navigationReady', listener);
	});
};

const navigate = function* navigate({ params }) {
	if (params.path || params.rid) {
		let type;
		let name;
		let jumpToThreadId;
		if (params.path) {
			// Following this pattern: {channelType}/{channelName}/thread/{threadId}
			[ type, name, , jumpToThreadId ] = params.path.split('/');
		}
		if (type !== 'invite' || params.rid) {
			const room = yield canOpenRoom(params);
			if (room) {
				const item = {
					name,
					t: roomTypes[ type ],
					roomUserId: getUidDirectMessage(room),
					...room
				};

				const isMasterDetail = yield select(state => state.app.isMasterDetail);
				const jumpToMessageId = params.messageId;

				yield waitForNavigation();
				yield goRoom({ item, isMasterDetail, jumpToMessageId, jumpToThreadId, popToRoot: true });
			}
		} else {
			yield handleInviteLink({ params });
		}
	}
	yield put(appStart({ root: RootEnum.ROOT_INSIDE }));
};

const fallbackNavigation = function* fallbackNavigation() {
	const currentRoot = yield select(state => state.app.root);
	if (currentRoot) {
		return;
	}
	yield put(appInit());
};

const handleOAuth = function* handleOAuth({ params }) {
	const { credentialToken, credentialSecret } = params;
	try {
		yield Services.loginOAuthOrSso({ oauth: { credentialToken, credentialSecret } }, false);
	} catch (e) {
		log(e);
	}
};

const handleShareExtension = function* handleOpen({ params }) {
	const server = UserPreferences.getString(CURRENT_SERVER);
	const user = UserPreferences.getString(`${TOKEN_KEY}-${server}`);

	if (!user) {
		yield put(appInit());
		return;
	}

	yield put(appStart({ root: RootEnum.ROOT_LOADING_SHARE_EXTENSION }));
	yield localAuthenticate(server);
	const serverRecord = yield getServerById(server);
	if (!serverRecord) {
		return;
	}
	yield put(selectServerRequest(server, serverRecord.version));
	if (sdk.current?.client?.host !== server) {
		yield take(types.LOGIN.SUCCESS);
	}
	yield put(shareSetParams(params));
	yield put(appStart({ root: RootEnum.ROOT_SHARE_EXTENSION }));
};

const handleOpen = function* handleOpen({ params }) {
	if (params.type === 'shareextension') {
		yield handleShareExtension({ params });
		return;
	}
	if (params.type === 'oauth') {
		yield handleOAuth({ params });
		return;
	}

	// If there's no host on the deep link params and the app is opened, just call appInit()
	let { host } = params;
	if (!host) {
		yield fallbackNavigation();
		return;
	}

	// If there's host, continue
	if (!/^(http|https)/.test(host)) {
		if (/^localhost(:\d+)?/.test(host)) {
			host = `http://${host}`;
		} else {
			host = `https://${host}`;
		}
	} else {
		// Notification should always come from https
		host = host.replace('http://', 'https://');
	}
	// remove last "/" from host
	if (host.slice(-1) === '/') {
		host = host.slice(0, host.length - 1);
	}

	const [ server, user ] = yield all([
		UserPreferences.getString(CURRENT_SERVER),
		UserPreferences.getString(`${TOKEN_KEY}-${host}`)
	]);

	const serverRecord = yield getServerById(host);

	// TODO: needs better test
	// if deep link is from same server
	if (server === host && user && serverRecord) {
		const connected = yield select(state => state.server.connected);
		if (!connected) {
			yield localAuthenticate(host);
			yield put(selectServerRequest(host, serverRecord.version, true));
			yield take(types.LOGIN.SUCCESS);
		}
		yield navigate({ params });
	} else {
		// search if deep link's server already exists
		try {
			if (user && serverRecord) {
				yield localAuthenticate(host);
				yield put(selectServerRequest(host, serverRecord.version, true, true));
				yield take(types.LOGIN.SUCCESS);
				yield navigate({ params });
				return;
			}
		} catch (e) {
			// do nothing?
		}
		// if deep link is from a different server
		const result = yield getServerInfo(host);
		if (!result.success) {
			// Fallback to prevent the app from being stuck on splash screen
			yield fallbackNavigation();
			return;
		}
		yield put(appStart({ root: RootEnum.ROOT_OUTSIDE }));
		yield put(serverInitAdd(server));
		yield delay(1000);
		EventEmitter.emit('NewServer', { server: host });

		if (params.token) {
			yield take(types.SERVER.SELECT_SUCCESS);
			yield put(loginRequest({ resume: params.token }, true));
			yield take(types.LOGIN.SUCCESS);
			yield navigate({ params });
		} else {
			yield handleInviteLink({ params, requireLogin: true });
		}
	}
};

const handleNavigateCallRoom = function* handleNavigateCallRoom({ params }) {
	try {
		yield put(appStart({ root: RootEnum.ROOT_INSIDE }));
		const db = database.active;
		const subsCollection = db.get('subscriptions');
		const room = yield subsCollection.find(params.rid);
		if (room) {
			const isMasterDetail = yield select(state => state.app.isMasterDetail);
			yield navigateToRoom({ item: room, isMasterDetail, popToRoot: true });
			const uid = params.caller._id;
			const { rid, callId, event } = params;
			if (event === 'accept') {
				yield call(Services.notifyUser, `${uid}/video-conference`, {
					action: 'accepted',
					params: { uid, rid, callId }
				});
				yield videoConfJoin(callId, true, false, true);
			} else if (event === 'decline') {
				yield call(Services.notifyUser, `${uid}/video-conference`, {
					action: 'rejected',
					params: { uid, rid, callId }
				});
			}
		}
	} catch (e) {
		log(e);
	}
};

const handleClickCallPush = function* handleClickCallPush({ params }) {
	let { host } = params;

	if (host.slice(-1) === '/') {
		host = host.slice(0, host.length - 1);
	}

	const [ server, user ] = yield all([
		UserPreferences.getString(CURRENT_SERVER),
		UserPreferences.getString(`${TOKEN_KEY}-${host}`)
	]);

	const serverRecord = yield getServerById(host);

	if (server === host && user && serverRecord) {
		const connected = yield select(state => state.server.connected);
		if (!connected) {
			yield localAuthenticate(host);
			yield put(selectServerRequest(host, serverRecord.version, true));
			yield take(types.LOGIN.SUCCESS);
		}
		yield handleNavigateCallRoom({ params });
	} else {
		if (user && serverRecord) {
			yield localAuthenticate(host);
			yield put(selectServerRequest(host, serverRecord.version, true, true));
			yield take(types.LOGIN.SUCCESS);
			yield handleNavigateCallRoom({ params });
			return;
		}
		// if deep link is from a different server
		const result = yield Services.getServerInfo(host);
		if (!result.success) {
			// Fallback to prevent the app from being stuck on splash screen
			yield fallbackNavigation();
			return;
		}
		yield put(appStart({ root: RootEnum.ROOT_OUTSIDE }));
		yield put(serverInitAdd(server));
		yield delay(1000);
		EventEmitter.emit('NewServer', { server: host });
		if (params.token) {
			yield take(types.SERVER.SELECT_SUCCESS);
			yield put(loginRequest({ resume: params.token }, true));
			yield take(types.LOGIN.SUCCESS);
			yield handleNavigateCallRoom({ params });
		}
	}
};

const waitForNavigationNxforum = () => {
	// log('[waitForNavigation] Called.');

	// Kiểm tra xem navigation đã sẵn sàng hoàn toàn chưa bằng phương thức chuẩn của React Navigation.
	// Đây là cách kiểm tra đáng tin cậy nhất nếu Navigation.navigationRef là một NavigationContainerRef.
	if (Navigation.navigationRef.current?.isReady()) {
		// log('[waitForNavigationNxforum] Navigation ref.isReady() is true. Resolving immediately.');
		return Promise.resolve();
	}

	// log('[waitForNavigationNxforum] Navigation not fully ready yet (or ref not set). Setting up promise and listener for "navigationReady" event.');
	return new Promise(resolve => {
		const listener = () => {
			// log('[waitForNavigationNxforum] "navigationReady" event received via emitter. Resolving.');
			emitter.off('navigationReady', listener); // Quan trọng: dọn dẹp listener
			resolve();
		};

		// Đăng ký lắng nghe sự kiện tùy chỉnh
		emitter.on('navigationReady', listener);
		// log('[waitForNavigationNxforum] Subscribed to "navigationReady" event.');

		// Kiểm tra lại sau khi đăng ký để xử lý race condition:
		// Điều gì sẽ xảy ra nếu onReady được kích hoạt (và do đó isReady() trở thành true)
		// *giữa* lần kiểm tra ban đầu ở trên và việc gọi emitter.on()?
		if (Navigation.navigationRef.current?.isReady()) {
			// log('[waitForNavigationNxforum] Navigation ref.isReady() is true (checked AFTER subscribing). Resolving and cleaning up listener.');
			emitter.off('navigationReady', listener); // Dọn dẹp listener vì không còn cần thiết nữa
			resolve();
		} else {
			// log('[waitForNavigationNxforum] Still waiting for "navigationReady" event via emitter.');
		}

		// DEVELOPMENT ONLY: Optional timeout for debugging hangs in waitForNavigation
		// setTimeout(() => {
		// 	if (!Navigation.navigationRef.current?.isReady()) {
		// 		log('[waitForNavigation] DEV TIMEOUT: Still waiting for "navigationReady" after 15s. The "navigationReady" event might not have been emitted, or isReady() is not becoming true.');
		// 	}
		// }, 15000);
	});
};

const handleOpenNxWebViewViaSaga = function* handleOpenNxWebViewViaSaga({ params }) {
	// Saga này chỉ chịu trách nhiệm điều hướng.
	// Nó kỳ vọng `params` chứa `site_url` và `redirect_url` (nếu cần từ action).
	const { site_url, redirect_url } = params;
	// log(`handleOpenNxWebViewViaSaga: site_url: ${site_url}, redirect_url: ${redirect_url}`);

	// Kiểm tra xem các tham số cần thiết cho NxWebViewScreen có tồn tại không
	if (!site_url) { // Bạn có thể cần kiểm tra cả post_url nếu nó bắt buộc
		// log(new Error('handleOpenNxWebViewViaSaga: Thiếu tham số `site_url` cần thiết để điều hướng đến NxWebView.'));
		// Không làm gì thêm nếu thiếu params, vì saga này giờ rất đơn giản.
		// Hoặc bạn có thể gọi fallbackNavigation() nếu muốn.
		return;
	}
	// Đảm bảo ứng dụng ở trạng thái ROOT_INSIDE để NavigationContainer được render
	// Cần làm điều này TRƯỚC khi chờ navigation.
	// log('[handleOpenNxWebViewViaSaga] Setting app root to ROOT_INSIDE to ensure NavigationContainer is rendered.');
	yield put(appInit());
	// yield put(appStart({ root: RootEnum.ROOT_INSIDE }));
	// Đợi cho navigation sẵn sàng
	// log('[handleOpenNxWebViewViaSaga] About to call waitForNavigation.');
	yield call(waitForNavigationNxforum);
	// log('[handleOpenNxWebViewViaSaga] waitForNavigation completed.');

	// Điều hướng đến NxWebViewScreen với các tham số cần thiết
	// Đảm bảo 'NxWebViewScreen' là tên route chính xác và nó nhận `site_url`, `redirect_url`.
	// LƯU Ý: Nếu 'NxWebview' là một screen lồng trong một navigator khác (ví dụ: 'NxcomStackNavigator'),
	// bạn có thể cần điều hướng như sau:
	log(`[handleOpenNxWebViewViaSaga] Navigating to 'NxWebview' with site_url: ${site_url}, redirect_url: ${redirect_url}`);
	// yield call(Navigation.navigate, 'NxcomStackNavigator', { screen: 'NxWebview', params: { site_url, redirect_url } });
	yield put(appStart({ root: RootEnum.ROOT_NX }));
	EventEmitter.emit('Nxcom:changeForum', { site_url, redirect_url }); // Phát sự kiện để thông báo rằng navigation đã sẵn sàng
	// yield call(Navigation.navigate, 'S', { site_url, redirect_url });
	// log('[handleOpenNxWebViewViaSaga] Navigation.navigate called.');
};

const root = function* root() {
	yield takeLatest(types.DEEP_LINKING.OPEN, handleOpen);
	yield takeLatest(types.DEEP_LINKING.OPEN_VIDEO_CONF, handleClickCallPush);
	// Giả sử bạn đã định nghĩa types.DEEP_LINKING.OPEN_NX_WEBVIEW_VIA_SAGA trong actionsTypes.ts
	yield takeLatest(types.DEEP_LINKING.OPEN_NX_WEBVIEW, handleOpenNxWebViewViaSaga);
};
export default root;
