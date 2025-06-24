import { TActionActiveUsers } from '../../actions/activeUsers';
import { TActionApp } from '../../actions/app';
import { TActionCreateChannel } from '../../actions/createChannel';
import { TActionCreateDiscussion } from '../../actions/createDiscussion';
import { TActionCustomEmojis } from '../../actions/customEmojis';
import { TActionEncryption } from '../../actions/encryption';
import { TActionEnterpriseModules } from '../../actions/enterpriseModules';
import { TInAppFeedbackAction } from '../../actions/inAppFeedback';
import { TActionInviteLinks } from '../../actions/inviteLinks';
import { TActionPermissions } from '../../actions/permissions';
import { IActionRoles } from '../../actions/roles';
import { TActionSelectedUsers } from '../../actions/selectedUsers';
import { TActionServer } from '../../actions/server';
import { IActionSettings } from '../../actions/settings';
import { TActionsShare } from '../../actions/share';
import { TActionSortPreferences } from '../../actions/sortPreferences';
import { TActionSupportedVersions } from '../../actions/supportedVersions';
import { TActionTroubleshootingNotification } from '../../actions/troubleshootingNotification';
import { TActionUsersRoles } from '../../actions/usersRoles';
import { TActionUserTyping } from '../../actions/usersTyping';
import { TActionVideoConf } from '../../actions/videoConf';
// ACTIONS
import { TActionInquiry } from '../../ee/omnichannel/actions/inquiry';
import { IInquiry } from '../../ee/omnichannel/reducers/inquiry';
// REDUCERS
import { IActiveUsers } from '../../reducers/activeUsers';
import { IApp } from '../../reducers/app';
import { IConnect } from '../../reducers/connect';
import { ICreateChannel } from '../../reducers/createChannel';
import { ICreateDiscussion } from '../../reducers/createDiscussion';
import { IEncryption } from '../../reducers/encryption';
import { IEnterpriseModules } from '../../reducers/enterpriseModules';
import { IInAppFeedbackState } from '../../reducers/inAppFeedback';
import { IInviteLinks } from '../../reducers/inviteLinks';
import { ILogin } from '../../reducers/login';
import { IPermissionsState } from '../../reducers/permissions';
import { IRoles } from '../../reducers/roles';
import { IRoom } from '../../reducers/room';
import { ISelectedUsers } from '../../reducers/selectedUsers';
import { IServer } from '../../reducers/server';
import { TSettingsState } from '../../reducers/settings';
import { IShare } from '../../reducers/share';
import { ISupportedVersionsState } from '../../reducers/supportedVersions';
import { ITroubleshootingNotification } from '../../reducers/troubleshootingNotification';
import { TUsersRoles } from '../../reducers/usersRoles';
import { IVideoConf } from '../../reducers/videoConf';
import { AuthState as NxForumAuthState } from '../../views/NxcomView/stores/Auth/types';
import { ForumsState as NxForumForumsState } from '../../views/NxcomView/stores/Forums/types';

export interface IApplicationState {
	settings: TSettingsState;
	login: ILogin;
	meteor: IConnect;
	server: IServer;
	selectedUsers: ISelectedUsers;
	app: IApp;
	createChannel: ICreateChannel;
	room: IRoom;
	rooms: any;
	sortPreferences: any;
	share: IShare;
	customEmojis: any;
	activeUsers: IActiveUsers;
	usersTyping: any;
	inviteLinks: IInviteLinks;
	createDiscussion: ICreateDiscussion;
	inquiry: IInquiry;
	enterpriseModules: IEnterpriseModules;
	encryption: IEncryption;
	permissions: IPermissionsState;
	roles: IRoles;
	videoConf: IVideoConf;
	usersRoles: TUsersRoles;
	troubleshootingNotification: ITroubleshootingNotification;
	supportedVersions: ISupportedVersionsState;
	inAppFeedback: IInAppFeedbackState;
	forums: NxForumForumsState;
	nxforumAuth: NxForumAuthState
}

export type TApplicationActions = TActionActiveUsers &
	TActionSelectedUsers &
	TActionCustomEmojis &
	TActionInviteLinks &
	IActionRoles &
	IActionSettings &
	TActionEncryption &
	TActionSortPreferences &
	TActionUserTyping &
	TActionCreateDiscussion &
	TActionCreateChannel &
	TActionsShare &
	TActionServer &
	TActionApp &
	TActionInquiry &
	TActionPermissions &
	TActionEnterpriseModules &
	TActionVideoConf &
	TActionUsersRoles &
	TActionTroubleshootingNotification &
	TActionSupportedVersions &
	TInAppFeedbackAction;
