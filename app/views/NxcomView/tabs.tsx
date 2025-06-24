import React, {
    useRef,
    useState
} from 'react';

import {
    Animated,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

// import Icon from '@expo/vector-icons/Ionicons';

import ScrollView = Animated.ScrollView;

const TabScreen = ({ tabs }: { tabs: { name: string, component: any, icon: any }[] }) => {
    const [ activeTab, setActiveTab ] = useState(0); // Tab đang được chọn (index)

    const fadeAnim = useRef(new Animated.Value(0)).current; // Giá trị animation
    const slideAnim = useRef(new Animated.Value(100)).current;
    // Hàm chạy animation
    const fadeIn = () => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300, // Thời gian animation (300ms)
            useNativeDriver: true, // Dùng native driver để tối ưu hiệu suất
        }).start();
    };
    const slideIn = () => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start();
    };
    // Xử lý khi chuyển tab
    const handleTabPress = (index: number) => {
        if (index === activeTab) return;
        fadeAnim.setValue(0);
        slideAnim.setValue(100); // Reset vị trí
        setActiveTab(index);
    };

    React.useEffect(() => {
        slideIn();
    }, [ activeTab ]);

    return (
        <View style={styles.container}>
            {/* Thanh tab */}
            <View>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.tabBar}
                >
                    {tabs.map((tab, index) => (
                        <TouchableOpacity
                            key={tab.name}
                            style={[
                                styles.tabItem,
                                activeTab === index && styles.tabItemActive,
                            ]}
                            onPress={() => handleTabPress(index)}
                        >
                            {/* <Icon
                                name={tab.icon}
                                size={20}
                                color={activeTab === index ? '#007AFF' : '#666'}
                            /> */}
                            <Text
                                style={[
                                    styles.tabText,
                                    activeTab === index && styles.tabTextActive,
                                ]}
                            >
                                {tab.name}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>


            </View>

            {/* Nội dung của tất cả các tab với animation */}
            <View style={styles.content}>
                {tabs.map((tab, index) => {
                    const Component = tab.component;
                    return (
                        <Animated.View
                            key={tab.name}
                            style={[
                                styles.tabWrapper,
                                {
                                    display: activeTab === index ? 'flex' : 'none',
                                    opacity: activeTab === index ? fadeAnim : 0,
                                    transform: [ { translateX: activeTab === index ? slideAnim : 100 } ],
                                },
                            ]}
                        >
                            <Component />
                        </Animated.View>
                    );
                })}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    tabBar: {
        backgroundColor: '#fff',
        // height: 50,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3, // Cho Android
    },
    tabItem: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
        flexDirection: 'row',
        alignItems: 'center',
    },
    tabItemActive: {
        borderBottomColor: '#007AFF', // Màu viền khi tab được chọn
    },
    tabText: {
        fontSize: 16,
        color: '#666',
        marginLeft: 8
    },
    tabTextActive: {
        color: '#007AFF', // Màu chữ khi tab được chọn
        fontWeight: 'bold',
    },
    content: {
        flex: 1
    },
    tabWrapper: {
        flex: 1,
    },
});

export default React.memo(TabScreen);