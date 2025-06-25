import React from 'react';

import {
	StyleSheet,
	View
} from 'react-native';
import { Provider } from 'react-redux';

import { IEmoji } from '../../../definitions';
import { colors } from '../../../lib/constants';
// Các đường dẫn import có thể cần được điều chỉnh lại cho đúng với cấu trúc thư mục của bạn
import store from '../../../lib/store';
import {
	ThemeContext,
	TSupportedThemes
} from '../../../theme';
import EmojiPicker from '../../EmojiPicker';
import { EventTypes } from '../../EmojiPicker/interfaces';

const styles = StyleSheet.create({
	container: {
		flex: 1
	}
});

// Component mới sẽ nhận prop onEmojiSelected
interface IEmojiKeyboardProps {
	theme: TSupportedThemes;
	onEmojiSelected: (emoji: IEmoji) => void;
}

const EmojiKeyboard = ({ theme, onEmojiSelected }: IEmojiKeyboardProps) => {
	// Hàm này sẽ được gọi bởi EmojiPicker khi có sự kiện
	const onItemClicked = (eventType: EventTypes, emoji?: IEmoji) => {
		// Chúng ta chỉ quan tâm đến sự kiện nhấn vào emoji
		if (eventType === EventTypes.EMOJI_PRESSED && emoji) {
			onEmojiSelected(emoji);
		}
	};

	return (
		<Provider store={store}>
			<ThemeContext.Provider
				value={{
					theme,
					colors: colors[ theme ]
				}}
			>
				<View style={styles.container} testID='message-composer-keyboard-emoji'>
					<EmojiPicker onItemClicked={onItemClicked} isEmojiKeyboard={true} />
				</View>
			</ThemeContext.Provider>
		</Provider>
	);
};

// Không còn dòng KeyboardRegistry.registerKeyboard nữa
export default EmojiKeyboard;
