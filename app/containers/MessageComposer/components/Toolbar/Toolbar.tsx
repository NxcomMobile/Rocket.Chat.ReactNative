import React, { ReactElement } from 'react';

import {
	useFocused,
	useShowEmojiKeyboard,
	useShowEmojiSearchbar,
	useShowMarkdownToolbar
} from '../../context';
import { MicOrSendButton } from '../Buttons';
import { CancelEdit } from '../CancelEdit';
import { Container } from './Container';
import { Default } from './Default';
import { EmojiKeyboard } from './EmojiKeyboard';
import { EmptySpace } from './EmptySpace';
import { Markdown } from './Markdown';

export const Toolbar = (): ReactElement | null => {
	const focused = useFocused();
	const showEmojiKeyboard = useShowEmojiKeyboard();
	const showEmojiSearchbar = useShowEmojiSearchbar();
	const showMarkdownToolbar = useShowMarkdownToolbar();

	if (showEmojiSearchbar) {
		return null;
	}

	if (showEmojiKeyboard) {
		return <EmojiKeyboard />;
	}

	if (!focused) {
		return null;
	}

	return (
		<Container>
			{showMarkdownToolbar ? <Markdown /> : <Default />}
			<EmptySpace />
			<CancelEdit />
			<MicOrSendButton />
		</Container>
	);
};
