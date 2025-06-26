import React, {
	ReactElement,
	useCallback,
	useImperativeHandle,
	useRef
} from 'react';

// Import KeyboardAvoidingView
import {
	KeyboardAvoidingView as RNCKeyboardAvoidingView,
	Platform,
	StyleSheet,
	View
} from 'react-native';

import { Q } from '@nozbe/watermelondb';
// Đã xóa: import { KeyboardAccessoryView } from 'react-native-ui-lib/keyboard';
import { useBackHandler } from '@react-native-community/hooks';
import { useFocusEffect } from '@react-navigation/native';

import { IEmoji } from '../../definitions';
import database from '../../lib/database';
import { sanitizeLikeString } from '../../lib/database/utils';
import useShortnameToUnicode from '../../lib/hooks/useShortnameToUnicode';
import { generateTriggerId } from '../../lib/methods';
import { isIOS } from '../../lib/methods/helpers';
import log from '../../lib/methods/helpers/log';
import { Services } from '../../lib/services';
import { useTheme } from '../../theme';
import { useRoomContext } from '../../views/RoomView/context';
import {
	Autocomplete,
	ComposerInput,
	EmojiSearchbar,
	Left,
	Quotes,
	Right,
	SendThreadToChannel,
	Toolbar
} from './components';
import { RecordAudio } from './components/RecordAudio';
import {
	MIN_HEIGHT,
	TIMEOUT_CLOSE_EMOJI_KEYBOARD
} from './constants';
import {
	MessageInnerContext,
	useAlsoSendThreadToChannel,
	useMessageComposerApi,
	useRecordingAudio,
	useShowEmojiKeyboard,
	useShowEmojiSearchbar
} from './context';
import {
	insertEmojiAtCursor,
	prepareQuoteMessage
} from './helpers';
import { IComposerInput } from './interfaces';

const styles = StyleSheet.create({
	container: {
		borderTopWidth: 1,
		paddingHorizontal: 16,
		minHeight: MIN_HEIGHT
	},
	input: {
		flexDirection: 'row'
	}
});

require('./components/EmojiKeyboard');
const EmojiKeyboardCustom = React.lazy(() => import('./components/EmojiKeyboard'));


export const MessageComposer = ({
	forwardedRef,
	children
}: {
	forwardedRef: any;
	children?: ReactElement;
}): ReactElement | null => {
	const composerInputRef = useRef(null);
	const composerInputComponentRef = useRef<IComposerInput>({
		getTextAndClear: () => '',
		getText: () => '',
		getSelection: () => ({ start: 0, end: 0 }),
		setInput: () => { },
		onAutocompleteItemSelected: () => { }
	});
	const { colors, theme } = useTheme();
	const { rid, tmid, action, selectedMessages, sharing, editRequest, onSendMessage } = useRoomContext();
	const showEmojiKeyboard = useShowEmojiKeyboard();
	const showEmojiSearchbar = useShowEmojiSearchbar();
	const alsoSendThreadToChannel = useAlsoSendThreadToChannel();
	const {
		openSearchEmojiKeyboard,
		closeEmojiKeyboard,
		closeSearchEmojiKeyboard,
		setAlsoSendThreadToChannel,
		setAutocompleteParams
	} = useMessageComposerApi();
	const recordingAudio = useRecordingAudio();
	const { formatShortnameToUnicode } = useShortnameToUnicode();

	useFocusEffect(
		useCallback(() => {
			// Logic cũ liên quan đến tracking view có thể được loại bỏ hoặc xem xét lại
		}, [ recordingAudio ])
	);

	useImperativeHandle(forwardedRef, () => ({
		closeEmojiKeyboardAndAction,
		getText: composerInputComponentRef.current?.getText,
		setInput: composerInputComponentRef.current?.setInput
	}));

	useBackHandler(() => {
		if (showEmojiSearchbar) {
			closeSearchEmojiKeyboard();
			return true;
		}
		if (showEmojiKeyboard) {
			closeEmojiKeyboard();
			return true;
		}
		return false;
	});

	const closeEmojiKeyboardAndAction = (actionFn?: Function, params?: any) => {
		if (showEmojiKeyboard) {
			closeEmojiKeyboard();
		}
		setTimeout(() => actionFn && actionFn(params), showEmojiKeyboard && isIOS ? TIMEOUT_CLOSE_EMOJI_KEYBOARD : undefined);
	};

	const handleSendMessage = async () => {
		if (!rid) return;

		if (alsoSendThreadToChannel) {
			setAlsoSendThreadToChannel(false);
		}

		if (sharing) {
			onSendMessage?.();
			return;
		}

		const textFromInput = composerInputComponentRef.current.getTextAndClear();

		if (action === 'edit') {
			return editRequest?.({ id: selectedMessages[ 0 ], msg: textFromInput, rid });
		}

		if (action === 'quote') {
			const quoteMessage = await prepareQuoteMessage(textFromInput, selectedMessages);
			onSendMessage?.(quoteMessage);
			return;
		}

		if (textFromInput[ 0 ] === '/') {
			const db = database.active;
			const commandsCollection = db.get('slash_commands');
			const command = textFromInput.replace(/ .*/, '').slice(1);
			const likeString = sanitizeLikeString(command);
			const slashCommand = await commandsCollection.query(Q.where('id', Q.like(`${likeString}%`))).fetch();
			if (slashCommand.length > 0) {
				try {
					const messageWithoutCommand = textFromInput.replace(/([^\s]+)/, '').trim();
					const [ { appId } ] = slashCommand;
					const triggerId = generateTriggerId(appId);
					await Services.runSlashCommand(command, rid, messageWithoutCommand, triggerId, tmid);
				} catch (e) {
					log(e);
				}
				return;
			}
		}

		setAutocompleteParams({ text: '', type: null, params: '' });
		onSendMessage?.(textFromInput, alsoSendThreadToChannel);
	};

	const onEmojiSelected = (emoji: IEmoji) => {
		const text = composerInputComponentRef.current.getText();
		const { start, end } = composerInputComponentRef.current.getSelection();
		const cursor = Math.max(start, end);
		let emojiText = '';
		if (typeof emoji === 'string') {
			emojiText = formatShortnameToUnicode(`:${emoji}:`);
		} else {
			emojiText = `:${emoji.name}:`;
		}
		const { updatedCursor, updatedText } = insertEmojiAtCursor(text, emojiText, cursor);
		composerInputComponentRef.current.setInput(updatedText, { start: updatedCursor, end: updatedCursor });
	};

	const renderContent = () => {
		const backgroundColor = action === 'edit' ? colors.statusBackgroundWarning2 : colors.surfaceLight;
		if (recordingAudio) {
			return <RecordAudio />;
		}
		return (
			<View style={[ styles.container, { backgroundColor, borderTopColor: colors.strokeLight } ]} testID='message-composer'>
				<View style={styles.input}>
					<Left />
					<ComposerInput ref={composerInputComponentRef} inputRef={composerInputRef} />
					<Right />
				</View>
				<Quotes />
				<Toolbar />
				<View style={{ height: 20 }} />
				<EmojiSearchbar />
				<SendThreadToChannel />
				{children}
			</View>
		);
	};

	return (
		<MessageInnerContext.Provider value={{ sendMessage: handleSendMessage, onEmojiSelected, closeEmojiKeyboardAndAction }}>
			<RNCKeyboardAvoidingView
				behavior={Platform.OS === 'ios' ? 'padding' : undefined}
				keyboardVerticalOffset={64} // Bạn có thể cần tinh chỉnh giá trị này
			>
				{renderContent()}
				{showEmojiKeyboard && (
					<React.Suspense fallback={null}>
						<EmojiKeyboardCustom onEmojiSelected={onEmojiSelected} />
					</React.Suspense>
				)}
			</RNCKeyboardAvoidingView>
			<Autocomplete onPress={item => composerInputComponentRef.current.onAutocompleteItemSelected(item)} />
		</MessageInnerContext.Provider>
	);
};
