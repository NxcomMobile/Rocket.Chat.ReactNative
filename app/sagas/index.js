import { all } from 'redux-saga/effects';

import inquiry from '../ee/omnichannel/sagas/inquiry';
import nxforumAuthSaga from '../views/NxcomView/stores/Auth/sagas';
import createChannel from './createChannel';
import createDiscussion from './createDiscussion';
import deepLinking from './deepLinking';
import encryption from './encryption';
import init from './init';
import inviteLinks from './inviteLinks';
import login from './login';
import messages from './messages';
import room from './room';
import rooms from './rooms';
import selectServer from './selectServer';
import state from './state';
import troubleshootingNotification from './troubleshootingNotification';
import videoConf from './videoConf';

const root = function* root() {
	yield all([
		init(),
		createChannel(),
		rooms(),
		room(),
		login(),
		messages(),
		selectServer(),
		state(),
		deepLinking(),
		inviteLinks(),
		createDiscussion(),
		inquiry(),
		encryption(),
		videoConf(),
		troubleshootingNotification(),
		nxforumAuthSaga()
	]);
};

export default root;
