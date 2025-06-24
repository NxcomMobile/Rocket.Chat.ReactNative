import React, {useRef} from 'react';
import {Dimensions, StyleSheet, View} from 'react-native';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import Animated, {
    Extrapolate,
    interpolate,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';
import ForumCard from "@/app/components/carousel/forum_card";


const {width: SCREEN_WIDTH} = Dimensions.get('window');
const SWIPE_THRESHOLD = 100;
const VISIBLE_CARDS = 3;

const CardStack = ({data}: { data: any }) => {
    const activeIndex = useRef(0);
    const animatedIndex = useSharedValue(0);
    const translateX = useSharedValue(0);
    const rotateZ = useSharedValue(0);

    // Xử lý chuyển card
    const handleSwipe = (direction: number) => {
        const newIndex = Math.min(Math.max(activeIndex.current + direction, 0), data.length - 1);
        activeIndex.current = newIndex;
        animatedIndex.value = withSpring(newIndex);
    };

    // Gesture vuốt ngang
    const panGesture = Gesture.Pan()
        .onUpdate((event) => {
            translateX.value = event.translationX;
            rotateZ.value = event.translationX / 20;
        })
        .onEnd((event) => {
            if (Math.abs(event.translationX) > SWIPE_THRESHOLD) {
                const direction = event.translationX > 0 ? -1 : 1;
                translateX.value = withSpring(direction * SCREEN_WIDTH * 2, {}, () => {
                    translateX.value = 0;
                    rotateZ.value = 0;
                    runOnJS(handleSwipe)(-direction);
                });
            } else {
                translateX.value = withSpring(0);
                rotateZ.value = withSpring(0);
            }
        });

    // Style animation cho card hiện tại
    const currentCardStyle = useAnimatedStyle(() => ({
        transform: [
            {translateX: translateX.value},
            {rotateZ: `${rotateZ.value}deg`},
        ],
    }));

    return (
        <View style={styles.container}>
            {data.map((item: any, index: number) => {
                // Tính toán style cho từng card trong stack
                const cardStyle = useAnimatedStyle(() => {
                    const position = index - animatedIndex.value;
                    const isActive = position === 0;

                    return {
                        zIndex: data.length - Math.abs(position),
                        opacity: interpolate(
                            position,
                            [-VISIBLE_CARDS, 0, VISIBLE_CARDS],
                            [0, 1, 0],
                            Extrapolate.CLAMP
                        ),
                        transform: [
                            {
                                scale: interpolate(
                                    position,
                                    [-VISIBLE_CARDS, 0, VISIBLE_CARDS],
                                    [0.8, 1, 0.8],
                                    Extrapolate.CLAMP
                                )
                            },
                            {
                                translateY: interpolate(
                                    position,
                                    [-VISIBLE_CARDS, 0, VISIBLE_CARDS],
                                    [30, 0, -30],
                                    Extrapolate.CLAMP
                                )
                            }
                        ]
                    };
                });

                return (
                    <Animated.View
                        key={index}
                        style={[styles.cardContainer, cardStyle]}
                    >
                        <GestureDetector gesture={panGesture}>
                            <Animated.View style={currentCardStyle}>
                                <ForumCard item={item}/>
                            </Animated.View>
                        </GestureDetector>
                        {/*{index === activeIndex.current ? (*/}
                        {/*) : (*/}
                        {/*    <ForumCard item={item} />*/}
                        {/*)}*/}
                    </Animated.View>
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardContainer: {
        position: 'absolute',
    },
});

export default CardStack;