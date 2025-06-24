import { Action } from 'redux';

import { DEEP_LINKING } from './actionsTypes';

interface IParams {
	path: string;
	rid: string;
	messageId: string;
	host: string;
	fullURL: string;
	type: string;
	token: string;
}

interface IDeepLinkingOpen extends Action {
	params: Partial<IParams>;
}

export function deepLinkingOpen(params: Partial<IParams>): IDeepLinkingOpen {
	return {
		type: DEEP_LINKING.OPEN,
		params
	};
}
export function deepLinkingOpenNxWebview(params: Partial<{
	site_url: string,
	redirect_url: string,
	title?: string,
	role?: string

}>) {
	return {
		type: DEEP_LINKING.OPEN_NX_WEBVIEW,
		params
	};
}

export function deepLinkingClickCallPush(params: any): IDeepLinkingOpen {
	return {
		type: DEEP_LINKING.OPEN_VIDEO_CONF,
		params
	};
}
