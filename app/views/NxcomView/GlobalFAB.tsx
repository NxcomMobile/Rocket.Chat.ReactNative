// app/containers/GlobalFAB.tsx
import React, {
	useCallback,
	useEffect,
	useState
} from 'react';

import {
	Appearance,
	Dimensions,
	Platform,
	StyleSheet,
	Text,
	TouchableOpacity
} from 'react-native';
import {
	Gesture,
	GestureDetector
} from 'react-native-gesture-handler'; // Import Gesture và GestureDetector
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withSpring
} from 'react-native-reanimated';
import {
	useDispatch,
	useSelector
} from 'react-redux';

import {
	NavigationProp,
	useNavigation
} from '@react-navigation/native';

import { appStart } from '../../actions/app';
import { StackParamList } from '../../definitions/navigationTypes';
import { RootEnum } from '../../definitions/redux/TRootEnum';

const selectCurrentAppRoot = (state: { app: { root: string } }) => state.app.root;
const DEFAULT_FALLBACK_ROOT = RootEnum.ROOT_INSIDE;

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const FAB_SIZE = 56; // Kích thước của FAB
const FAB_MARGIN = 20; // Khoảng cách từ cạnh màn hình

// Giới hạn vùng kéo thả để FAB không bị kéo ra ngoài màn hình quá nhiều
// Bạn có thể điều chỉnh các giá trị này
const BOUNDARY_X_MIN = FAB_MARGIN;
const BOUNDARY_X_MAX = screenWidth - FAB_SIZE - FAB_MARGIN;
const BOUNDARY_Y_MIN = FAB_MARGIN + (Platform.OS === 'ios' ? 40 : 0); // Thêm khoảng trống cho status bar trên iOS
const BOUNDARY_Y_MAX = screenHeight - FAB_SIZE - FAB_MARGIN - (Platform.OS === 'ios' ? 30 : 50); // Thêm khoảng trống cho bottom nav/tab bar


const GlobalFAB: React.FC = () => {
    const dispatch = useDispatch();
    const currentAppRoot = useSelector(selectCurrentAppRoot);
    const navigation = useNavigation<NavigationProp<StackParamList>>();

    const [ previousAppRoot, setPreviousAppRoot ] = useState<string | null>(null);

    // --- Logic kéo thả ---
    const translateX = useSharedValue(BOUNDARY_X_MAX - (FAB_MARGIN / 2)); // Vị trí X ban đầu (gần góc dưới phải)
    const translateY = useSharedValue(BOUNDARY_Y_MAX - (FAB_MARGIN / 2)); // Vị trí Y ban đầu
    const context = useSharedValue({ x: 0, y: 0 }); // Lưu vị trí bắt đầu kéo


    useEffect(() => {
        if (currentAppRoot !== RootEnum.ROOT_NX) {
            setPreviousAppRoot(currentAppRoot);
        }
    }, [ currentAppRoot ]);

    // Hàm xử lý click, chỉ được gọi nếu không phải là hành động kéo
    const handlePressFab = useCallback(() => {
        if (currentAppRoot === RootEnum.ROOT_NX) {
            const targetRoot = previousAppRoot || DEFAULT_FALLBACK_ROOT;
            dispatch(appStart({ root: targetRoot, forceUpdate: true }));
        } else {
            dispatch(appStart({ root: RootEnum.ROOT_NX }));
        }
    }, [ currentAppRoot, dispatch, previousAppRoot ]);


    const panGesture = Gesture.Pan()
        .onStart(() => {
            context.value = { x: translateX.value, y: translateY.value };
            // runOnJS(setIsDragging)(true); // Bắt đầu kéo
        })
        .onUpdate(event => {
            const newX = context.value.x + event.translationX;
            const newY = context.value.y + event.translationY;

            // Giới hạn trong vùng cho phép
            translateX.value = Math.max(BOUNDARY_X_MIN, Math.min(newX, BOUNDARY_X_MAX));
            translateY.value = Math.max(BOUNDARY_Y_MIN, Math.min(newY, BOUNDARY_Y_MAX));
        })
        .onEnd(() => {
            // Có thể thêm logic "snap" vào các cạnh màn hình ở đây nếu muốn
            // Ví dụ: nếu gần cạnh trái hơn thì snap vào trái, ngược lại snap vào phải
            if (translateX.value < screenWidth / 2) {
                translateX.value = withSpring(BOUNDARY_X_MIN); // << Đây là code Reanimated, chạy trên UI thread (OK)
            } else {
                translateX.value = withSpring(BOUNDARY_X_MAX); // << Đây là code Reanimated, chạy trên UI thread (OK)
            };

            // Đặt isDragging thành false sau một khoảng trễ nhỏ để handlePress không bị kích hoạt nhầm
            console.log('Pan gesture ended, setting isDragging to false');
            // setIsDraggingInternal(false);

        });
    // Kết hợp TapGesture để xử lý click
    // PanGesture sẽ được ưu tiên nếu người dùng di chuyển ngón tay đủ xa
    // const tapGesture = Gesture.Tap()
    //     .maxDuration(250) // Thời gian tối đa để được coi là tap
    //     .onEnd((_event, success) => {
    //         if (success) { // Chỉ xử lý tap nếu không phải đang kéo
    //             runOnJS(handlePressFab)();
    //         }
    //     });

    // Sử dụng `Gesture.Exclusive` để PanGesture và TapGesture không kích hoạt cùng lúc
    // PanGesture sẽ được ưu tiên nếu người dùng di chuyển ngón tay
    const composedGesture = Gesture.Exclusive(panGesture);


    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: translateX.value },
            { translateY: translateY.value }
        ]
    }));
    // --- Kết thúc logic kéo thả ---

    const excludedRootsForFAB: string[] = [
        RootEnum.ROOT_LOADING,
        RootEnum.ROOT_LOADING_SHARE_EXTENSION
        // RootEnum.ROOT_OUTSIDE, // Bỏ comment nếu không muốn FAB ở màn hình login
    ];
    const shouldShowFAB = !excludedRootsForFAB.includes(currentAppRoot as RootEnum);

    if (!shouldShowFAB) {
        return null;
    }

    const isDarkMode = Appearance.getColorScheme() === 'dark';
    const fabBackgroundColor = isDarkMode ? '#2E343B' : '#007AFF';
    const textColor = '#FFFFFF';
    const fabText = currentAppRoot === RootEnum.ROOT_NX ? 'Chat' : 'Forum';

    return (
        // Cần bọc bằng GestureHandlerRootView nếu đây là component gốc cho gesture,
        // nhưng vì FAB được đặt trong AppContainer (đã có GestureHandlerRootView ở app/index.tsx),
        // nên không cần thiết ở đây. Nếu có lỗi, hãy thử bọc.
        <GestureDetector gesture={composedGesture}>
            <Animated.View style={[ styles.fabBase, animatedStyle, [ { backgroundColor: fabBackgroundColor } ] ]}>
                {/* TouchableOpacity bên trong Animated.View để xử lý onPress thuần túy nếu không kéo */}
                {/* Tuy nhiên, với GestureDetector, onPress của TouchableOpacity không còn cần thiết nữa,
				   vì TapGesture sẽ xử lý sự kiện tap. */}
                <TouchableOpacity
                    style={styles.touchableContent}
                    onPress={() => {
                        // Logic này sẽ được gọi bởi tapGesture thông qua runOnJS(handlePressFab)()
                        // nếu không phải là hành động kéo.
                        // Để tránh xung đột, không đặt trực tiếp handlePressFab vào onPress ở đây.
                        handlePressFab();
                    }}
                    activeOpacity={0.7} // Giữ lại để có hiệu ứng khi tap
                >
                    <Text style={[ styles.fabText, { color: textColor } ]}>{fabText}</Text>
                </TouchableOpacity>
            </Animated.View>
        </GestureDetector>
    );
};

const styles = StyleSheet.create({
    // Đổi tên style chính để tránh nhầm lẫn, vì Animated.View sẽ đảm nhận vị trí
    fabBase: {
        position: 'absolute', // Vẫn cần 'absolute' để Animated.View có thể di chuyển tự do
        width: FAB_SIZE,
        height: FAB_SIZE,
        borderRadius: FAB_SIZE / 2,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 8,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        zIndex: 1000
        // backgroundColor được đặt trực tiếp trên Animated.View thông qua style nội tuyến
    },
    touchableContent: { // Style cho nội dung bên trong, đảm bảo nó chiếm toàn bộ FAB
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: FAB_SIZE / 2 // Giữ bo tròn cho touchable
    },
    fabText: {
        fontSize: 12,
        fontWeight: 'bold'
    }
});

export default GlobalFAB;