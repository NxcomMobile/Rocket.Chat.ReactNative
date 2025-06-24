import {Image, Linking, Pressable, StyleSheet, Text, View} from 'react-native';
import React from 'react';
import Animated, {interpolate, useAnimatedStyle, withTiming,} from 'react-native-reanimated';
import {Directions, FlingGestureHandler, State} from 'react-native-gesture-handler';

const Card = ({
                  maxVisibleItems,
                  item,
                  index,
                  dataLength,
                  animatedValue,
                  currentIndex,
                  prevIndex,
              }: any) => {
    const IMAGE_WIDTH = 300;
    const IMAGE_HEIGHT = 300;

    const animatedStyle = useAnimatedStyle(() => {
        const translateX = interpolate(
            animatedValue.value,
            [index - 1, index, index + 1],
            [30, 0, -30],
        );
        const translateX2 = interpolate(
            animatedValue.value,
            [index - 1, index, index + 1],
            [200, 0, -200],
        );
        const scale = interpolate(
            animatedValue.value,
            [index - 1, index, index + 1],
            [0.9, 1, 1.1],
        );
        const opacity = interpolate(
            animatedValue.value,
            [index - 1, index, index + 1],
            [1, 1, 0],
        );

        return {
            transform: [
                {
                    translateX: index === prevIndex.value ? translateX2 : translateX,
                },
                {scale},
            ],
            opacity:
                index < currentIndex.value + maxVisibleItems - 1
                    ? opacity
                    : index === currentIndex.value + maxVisibleItems - 1
                        ? withTiming(1)
                        : withTiming(0),
        };
    });

    return (
        <FlingGestureHandler
            key="left"
            direction={Directions.LEFT}
            onHandlerStateChange={ev => {
                if (ev.nativeEvent.state === State.END) {
                    if (currentIndex.value !== dataLength - 1) {
                        animatedValue.value = withTiming((currentIndex.value += 1));
                        prevIndex.value = currentIndex.value;
                    }
                }
            }}>
            <FlingGestureHandler
                key="right"
                direction={Directions.RIGHT}
                onHandlerStateChange={ev => {
                    if (ev.nativeEvent.state === State.END) {
                        if (currentIndex.value !== 0) {
                            animatedValue.value = withTiming((currentIndex.value -= 1));
                            prevIndex.value = currentIndex.value - 1;
                        }
                    }
                }}>
                <Animated.View
                    style={[
                        styles.container,
                        {
                            zIndex: dataLength - index,
                        },
                        animatedStyle,
                    ]}>
                    <Image
                        source={{uri: item.logo_url}}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                    <Text style={styles.title}>{item.title}</Text>
                    <Text style={styles.description}>{item.description}</Text>
                    <Text
                        style={styles.link}
                        onPress={() => Linking.openURL(item.site)}>
                        {item.site.replace(/https?:\/\//, '')}
                    </Text>
                    <View style={{flex: 1}}/>
                    <Pressable
                        onPress={() => Linking.openURL(item.site)}
                        style={styles.button}>
                        <Text style={styles.buttonText}>Truy cập ngay</Text>
                    </Pressable>
                </Animated.View>
            </FlingGestureHandler>
        </FlingGestureHandler>
    );
};

const styles = StyleSheet.create({
    container: {
        width: 350,
        height: 500,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        position: 'absolute',
    },
    logo: {
        width: '100%',
        height: 150,
        borderRadius: 10,
        marginBottom: 15,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
    },
    description: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
        marginBottom: 15,
    },
    link: {
        color: '#007AFF',
        fontSize: 14,
    },
    button: {
        width: '100%',
        height: 60,
        backgroundColor: '#007AFF',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default Card;