import { NavigatorScreenParams } from '@react-navigation/core';
import { NativeStackNavigationOptions } from '@react-navigation/native-stack';

import { MasterDetailInsideStackParamList } from '../stacks/MasterDetailStack/types';
import {
	InsideStackParamList,
	OutsideParamList
} from '../stacks/types';
import { IAttachment } from './IAttachment';
import { TServerModel } from './IServer';
import { TSubscriptionModel } from './ISubscription';

interface INavigationProps {
	route?: any;
	navigation?: any;
	isMasterDetail?: boolean;
}

export type TNavigationOptions = {
	navigationOptions?(props: INavigationProps): NativeStackNavigationOptions;
};

export type SetUsernameStackParamList = {
	SetUsernameView: {
		title: string;
	};
};

export type StackParamList = {
	AuthLoading: undefined;
	OutsideStack: NavigatorScreenParams<OutsideParamList>;
	InsideStack: NavigatorScreenParams<InsideStackParamList>;
	MasterDetailStack: NavigatorScreenParams<MasterDetailInsideStackParamList>;
	SetUsernameStack: NavigatorScreenParams<SetUsernameStackParamList>;
	ShareExtensionStack: NavigatorScreenParams<ShareInsideStackParamList>;
	NxcomStack: NavigatorScreenParams<NxParamList>;

};

export type ShareInsideStackParamList = {
	ShareListView: undefined;
	ShareView: {
		attachments: IAttachment[];
		isShareView?: boolean;
		isShareExtension: boolean;
		serverInfo: TServerModel;
		text: string;
		room: TSubscriptionModel;
		thread?: any; // TODO: Change
	};
	SelectServerView: undefined;
};

export type NxParamList = {
	NxcomStackNavigator: undefined;
};