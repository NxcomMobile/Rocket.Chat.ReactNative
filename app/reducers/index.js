import { combineReducers } from 'redux';

import inquiry from '../ee/omnichannel/reducers/inquiry';
import nxforumAuth from '../views/NxcomView/stores/Auth/reducer';
import forums from '../views/NxcomView/stores/Forums/reducers';
import activeUsers from './activeUsers';
import app from './app';
import meteor from './connect';
import createChannel from './createChannel';
import createDiscussion from './createDiscussion';
import customEmojis from './customEmojis';
import encryption from './encryption';
import enterpriseModules from './enterpriseModules';
import inAppFeedback from './inAppFeedback';
import inviteLinks from './inviteLinks';
import login from './login';
import permissions from './permissions';
import roles from './roles';
import room from './room';
import rooms from './rooms';
import selectedUsers from './selectedUsers';
import server from './server';
import settings from './settings';
import share from './share';
import sortPreferences from './sortPreferences';
import supportedVersions from './supportedVersions';
import troubleshootingNotification from './troubleshootingNotification';
import usersRoles from './usersRoles';
import usersTyping from './usersTyping';
import videoConf from './videoConf';

export default combineReducers({
	settings,
	login,
	meteor,
	server,
	selectedUsers,
	createChannel,
	app,
	room,
	rooms,
	sortPreferences,
	share,
	customEmojis,
	activeUsers,
	usersTyping,
	inviteLinks,
	createDiscussion,
	inquiry,
	enterpriseModules,
	encryption,
	permissions,
	roles,
	videoConf,
	usersRoles,
	troubleshootingNotification,
	supportedVersions,
	inAppFeedback,
	forums,
	nxforumAuth
});
