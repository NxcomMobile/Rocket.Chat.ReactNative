// import React from 'react';
// import {Dimensions, FlatList, Image, Pressable, StyleSheet, Text, View} from 'react-native';
// import LinearGradient from "react-native-linear-gradient";
//
// const {width} = Dimensions.get('window');
//
// const SiteCarousel = ({sites}: { sites: any }) => {
//
//     const onSitePress = (siteUrl: string) => {
//         // Linking.openURL(siteUrl);
//     };
//     const getRandomColor = () => {
//         const r = Math.floor(Math.random() * 256); // Random red (0-255)
//         const g = Math.floor(Math.random() * 256); // Random green (0-255)
//         const b = Math.floor(Math.random() * 256); // Random blue (0-255)
//         const a = (Math.random() * 0.5 + 0.5).toFixed(2); // Random alpha (0.5-1)
//         return `rgba(${r}, ${g}, ${b}, ${a})`;
//     };
//
//     const renderItem = ({item, index}: { item: any, index: number }) => {
//         return (
//             <View style={{
//                 width: width, justifyContent: 'center', height: '100%',
//                 // backgroundColor: 'red',
//                 alignItems: 'center'
//             }}>
//                 <LinearGradient
//                     colors={[
//                         'rgba(255, 255, 255, 1)',   /* Pure white */
//                         'rgba(255, 255, 255, 1)',   /* Pure white */
//                         'rgba(173, 216, 230, 0.8)', /* Light blue */
//                         'rgba(64, 224, 208, 0.6)'   /* Turquoise */
//                     ]}
//                     style={[styles.card]}
//                 >
//                     <View style={styles.logoContainer}>
//                         <Image
//                             source={{uri: item.logo_url}}
//                             style={styles.logo}
//                             resizeMode="contain"
//                         />
//                     </View>
//                     <View style={styles.content}>
//                         {/* Nội dung card */}
//                         <Text style={styles.title}>{item.title}</Text>
//                         <Text style={styles.description}>{item.description}</Text>
//
//                         {/* Footer */}
//                         <Pressable
//                             style={({pressed}) => [
//                                 styles.button,
//                                 pressed && {opacity: 0.8}
//                             ]}
//                             onPress={() => onSitePress(item.site)}
//                         >
//                             <Text style={styles.buttonText}>Truy cập ngay</Text>
//                         </Pressable>
//                     </View>
//                 </LinearGradient>
//             </View>
//         )
//     };
//     return (
//         <View style={[styles.container, {backgroundColor: getRandomColor()}]}>
//             <FlatList
//                 data={sites}
//                 renderItem={({item, index}) => renderItem({item, index})}
//                 horizontal
//                 showsHorizontalScrollIndicator={false}
//                 // snapToInterval={width - 60}
//                 decelerationRate="fast"
//                 keyExtractor={(item) => item.site}
//                 // contentContainerStyle={styles.listContent}
//                 pagingEnabled
//                 inverted
//             />
//         </View>
//     );
// };
//
// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//     },
//     card: {
//         width: 360,
//         height: 500,
//         // marginHorizontal: 10,
//         borderRadius: 20,
//         overflow: 'hidden',
//         backgroundColor: '#fff',
//         shadowColor: '#000',
//         shadowOffset: {width: 0, height: 5},
//         shadowOpacity: 0.2,
//         shadowRadius: 10,
//         elevation: 5,
//         // alignSelf: 'center'
//     },
//     logoContainer: {
//         // flex: 1,
//         height: 150,
//         // backgroundColor: '#transparent',
//         justifyContent: 'center',
//         alignItems: 'center',
//         padding: 20,
//     },
//     logo: {
//         width: '100%',
//         height: '100%',
//     },
//     content: {
//         flex: 1,
//         padding: 20,
//         justifyContent: 'space-between',
//     },
//     title: {
//         fontSize: 22,
//         fontWeight: 'bold',
//         color: '#333',
//         marginBottom: 10,
//     },
//     description: {
//         fontSize: 16,
//         color: '#666',
//         lineHeight: 22,
//     },
//     button: {
//         backgroundColor: '#007bff',
//         paddingVertical: 12,
//         borderRadius: 8,
//         alignItems: 'center',
//         marginTop: 15,
//     },
//     buttonText: {
//         color: 'white',
//         fontWeight: '600',
//         fontSize: 16,
//     },
// });
//
// export default SiteCarousel;

import React from 'react';
import {Dimensions, FlatList, StyleSheet, Text, View} from 'react-native';
import Animated, {
    Extrapolate,
    interpolate,
    useAnimatedScrollHandler,
    useAnimatedStyle,
    useSharedValue,
} from 'react-native-reanimated';

// Tạo phiên bản Animated của FlatList
const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

// Định nghĩa chiều rộng của card dựa trên màn hình
const {width: SCREEN_WIDTH} = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.8;

// Component Card
const Card = ({item, index}: { item: any; index: number }) => {
    const scrollX = useSharedValue(0);

    const inputRange = [
        (index - 1) * CARD_WIDTH,
        index * CARD_WIDTH,
        (index + 1) * CARD_WIDTH,
    ];

    const animatedStyle = useAnimatedStyle(() => {
        const scale = interpolate(
            scrollX.value,
            inputRange,
            [0.8, 1, 0.8],
            Extrapolate.CLAMP
        );

        const translateY = interpolate(
            scrollX.value,
            inputRange,
            [50, 0, 50],
            Extrapolate.CLAMP
        );

        return {
            transform: [{scale}, {translateY}],
        };
    });

    return (
        <Animated.View style={[styles.card, animatedStyle]}>
            <Text style={styles.cardText}>{item.title}</Text>
        </Animated.View>
    );
};

// Component StackCarousel
const StackCarousel = ({sites}: { sites: any }) => {
    const scrollX = useSharedValue(0);

    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollX.value = event.contentOffset.x;
        },
    });

    return (
        <View style={styles.container}>
            <AnimatedFlatList
                data={sites}
                renderItem={({item, index}) => <Card item={item} index={index}/>}
                keyExtractor={(item: any) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                snapToInterval={CARD_WIDTH}
                decelerationRate="fast"
                onScroll={scrollHandler}
                scrollEventThrottle={16}
            />
        </View>
    );
};

// Styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    card: {
        width: CARD_WIDTH,
        height: 200,
        backgroundColor: '#fff',
        borderRadius: 10,
        margin: 10,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
    },
    cardText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default StackCarousel;