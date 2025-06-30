// File: app/views/NxcomView/component/NxSnackbar.tsx
import React, {
	forwardRef,
	useImperativeHandle,
	useRef,
	useState
} from 'react';

import {
	Animated,
	SafeAreaView,
	StyleSheet,
	Text
} from 'react-native';

interface SnackbarProps {
    // Không cần props từ bên ngoài
}

export interface SnackbarRef {
    show: (options: { message: string; duration?: number }) => void;
}

const NxSnackbar = forwardRef<SnackbarRef, SnackbarProps>((props, ref) => {
    const [ message, setMessage ] = useState('');
    const fadeAnim = useRef(new Animated.Value(0)).current;

    // **SỬA LỖI Ở ĐÂY:** Đổi kiểu từ `NodeJS.Timeout` thành `number | null`
    const timeoutRef = useRef<number | null>(null);

    const show = ({ message: msg, duration = 2000 }: { message: string; duration?: number }) => {
        setMessage(msg);

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true
        }).start();

        // setTimeout trong React Native trả về một number
        timeoutRef.current = setTimeout(() => {
            hide();
        }, duration);
    };

    const hide = () => {
        Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true
        }).start(() => {
            // Đặt lại message sau khi animation kết thúc để component có thể được unmount
            setMessage('');
        });
    };

    useImperativeHandle(ref, () => ({
        show
    }));

    // Chỉ render khi có message để tối ưu
    if (!message) {
        return null;
    }

    return (
        <SafeAreaView style={styles.safeArea} pointerEvents='none'>
            <Animated.View style={[ styles.container, { opacity: fadeAnim } ]}>
                <Text style={styles.message}>{message}</Text>
            </Animated.View>
        </SafeAreaView>
    );
});

const styles = StyleSheet.create({
    safeArea: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999
    },
    container: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        paddingHorizontal: 20,
        paddingVertical: 14,
        borderRadius: 8,
        margin: 20,
        alignSelf: 'center'
    },
    message: {
        color: 'white',
        fontSize: 16,
        textAlign: 'center'
    }
});

export default NxSnackbar;