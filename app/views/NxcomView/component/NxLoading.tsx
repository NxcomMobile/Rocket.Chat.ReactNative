import React, { PureComponent } from 'react';

import {
    ActivityIndicator,
    Animated,
    BackHandler,
    Easing,
    NativeEventSubscription,
    StyleSheet
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const { Value } = Animated;

interface Props { }

interface States {
    isLoading: boolean;
}

class NxLoading extends PureComponent<Props, States> {
    _anim: Animated.Value;
    timeoutShow: any;

    // 2. Khai báo thuộc tính với kiểu chính xác
    backHandlerSubscription: NativeEventSubscription | null = null;

    constructor(props: Props) {
        super(props);
        this._anim = new Value(0);
    }

    state: States = {
        isLoading: false
    };

    componentWillUnmount() {
        if (this.backHandlerSubscription) {
            this.backHandlerSubscription.remove();
        }
        clearTimeout(this.timeoutShow);
    }

    show = (timeout = 10000) => {
        this.setState({ isLoading: true }, () => {
            // Phép gán bây giờ hoàn toàn hợp lệ
            this.backHandlerSubscription = BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);

            Animated.spring(this._anim, {
                toValue: 1,
                useNativeDriver: false
            }).start(() => {
                this.timeoutShow = setTimeout(() => {
                    this.hide();
                }, timeout);
            });
        });
    }

    hide = () => {
        Animated.timing(this._anim, {
            toValue: 0,
            duration: 100,
            easing: Easing.linear,
            useNativeDriver: false
        }).start(() => {
            this.backHandlerSubscription?.remove();

            this.setState({ isLoading: false });
            clearTimeout(this.timeoutShow);
        });
    }

    handleBackButton = () => {
        this.hide();
        return true;
    }

    render() {
        const { isLoading } = this.state || {};

        if (!isLoading) {
            return null;
        }

        return (
            <Animated.View
                style={[
                    styles.container,
                    {
                        backgroundColor: 'transparent',
                        opacity: this._anim.interpolate({
                            inputRange: [ 0, 1 ],
                            outputRange: [ 0, 1 ],
                            extrapolate: 'clamp'
                        })
                    }
                ]}
            >
                <LinearGradient
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    locations={[ 0, 1 ]}
                    colors={[
                        'rgba(0, 0, 0, 0.4)',
                        'rgba(0, 0, 0, 0.6)'
                    ]}
                    style={styles.viewContent}
                >
                    <ActivityIndicator
                        color='white'
                        size='large'
                    />
                </LinearGradient>
            </Animated.View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        flex: 1,
        top: 0,
        bottom: 0,
        left: 0,
        right: 0
    },
    viewContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    }
});

export default NxLoading;