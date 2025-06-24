import React from 'react';
import {Animated, StyleSheet, Text, View} from 'react-native';
import {EvilIcons} from '@expo/vector-icons';

const OVERFLOW_HEIGHT = 70;
const SPACING = 10;
const OverflowItems = ({data, scrollXAnimated}: { data: any[], scrollXAnimated: any }) => {
    const inputRange = [-1, 0, 1];
    const translateY = scrollXAnimated.interpolate({
        inputRange,
        outputRange: [OVERFLOW_HEIGHT, 0, -OVERFLOW_HEIGHT],
    });

    return (
        <View style={styles.overflowContainer}>
            <Animated.View style={{transform: [{translateY}]}}>
                {data.map((item, index) => (
                    <View key={index} style={styles.itemContainer}>
                        <Text style={styles.title} numberOfLines={1}>
                            {item.title}
                        </Text>
                        <View style={styles.itemContainerRow}>
                            <Text style={styles.location}>
                                <EvilIcons
                                    name="location"
                                    size={16}
                                    color="black"
                                    style={styles.locationIcon}
                                />
                                {item.location}
                            </Text>
                            <Text style={styles.date}>{item.date}</Text>
                        </View>
                    </View>
                ))}
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    overflowContainer: {
        height: OVERFLOW_HEIGHT,
        overflow: 'hidden',
    },
    itemContainer: {
        height: OVERFLOW_HEIGHT,
        padding: SPACING * 2,
    },
    title: {
        fontSize: 28,
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: -1,
    },
    location: {
        fontSize: 16,
    },
    date: {
        fontSize: 12,
    },
    itemContainerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    locationIcon: {
        marginRight: 5,
    },
});
export default OverflowItems;