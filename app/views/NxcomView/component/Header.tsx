import React from 'react';

import {
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context'; // Dùng icon từ expo

import { CustomIcon } from '../../../containers/CustomIcon';

const Header = ({ title = '', showBackButton = false }) => {
    // const router = useRouter();
    const insets = useSafeAreaInsets();
    const handleBack = () => {
        // router.back(); // Quay lại màn hình trước đó
    };

    return (
        <>
            <StatusBar barStyle='light-content' />
            <View style={[ styles.header, {
                paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 60) + 20 : insets.top
            } ]}>
                {showBackButton && (
                    <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                        <CustomIcon name='threads' size={24} />
                    </TouchableOpacity>
                )}
                <Text style={styles.title}>{title}</Text>
            </View>
        </>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#007AFF', // Màu nền xanh dương
        paddingHorizontal: 16,
        paddingBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 5
    },
    backButton: {
        marginRight: 10
    },
    title: {
        flex: 1, // Chiếm toàn bộ không gian còn lại
        fontSize: 20,
        fontWeight: '700',
        color: '#fff',
        textAlign: 'center'
    }
});

export default Header;