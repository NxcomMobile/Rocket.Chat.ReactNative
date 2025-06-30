import React, {
	memo,
	useContext,
	useEffect
} from 'react';

import {
	Alert,
	BackHandler
} from 'react-native';
import { connect } from 'react-redux';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { RootEnum } from './definitions';
import {
	SetUsernameStackParamList,
	StackParamList
} from './definitions/navigationTypes';
import { themes } from './lib/constants';
import { emitter } from './lib/methods/helpers';
import { setCurrentScreen } from './lib/methods/helpers/log';
import {
	defaultHeader,
	getActiveRouteName,
	navigationTheme
} from './lib/methods/helpers/navigation';
import Navigation from './lib/navigation/appNavigation';
import InsideStack from './stacks/InsideStack';
import MasterDetailStack from './stacks/MasterDetailStack';
import OutsideStack from './stacks/OutsideStack';
import ShareExtensionStack from './stacks/ShareExtensionStack';
import { ThemeContext } from './theme';
// Stacks
import AuthLoadingView from './views/AuthLoadingView';
import NxLoading from './views/NxcomView/component/NxLoading';
import NxSnackbar from './views/NxcomView/component/NxSnackbar';
import R from './views/NxcomView/component/R';
import GlobalFAB from './views/NxcomView/GlobalFAB';
import NxcomStackNavigator from './views/NxcomView/NxcomStack';
// SetUsername Stack
import SetUsernameView from './views/SetUsernameView';

const createStackNavigator = createNativeStackNavigator;

// SetUsernameStack
const SetUsername = createStackNavigator<SetUsernameStackParamList>();
const SetUsernameStack = () => (
	<SetUsername.Navigator screenOptions={defaultHeader}>
		<SetUsername.Screen name='SetUsernameView' component={SetUsernameView} />
	</SetUsername.Navigator>
);

// App
const Stack = createStackNavigator<StackParamList>();
const App = memo(({ root, isMasterDetail }: { root: string; isMasterDetail: boolean }) => {
	const { theme } = useContext(ThemeContext);
	useEffect(() => {
		if (root) {
			const state = Navigation.navigationRef.current?.getRootState();
			const currentRouteName = getActiveRouteName(state);
			Navigation.routeNameRef.current = currentRouteName;
			setCurrentScreen(currentRouteName);
		}
	}, [ root ]);


	// --- BẮT ĐẦU THÊM MỚI ---
	// 2. Thêm useEffect để xử lý nút Back trên Android
	useEffect(() => {
		const onBackPress = () => {
			// Sử dụng navigationRef đã có sẵn của bạn
			const navigation = Navigation.navigationRef.current;

			// Nếu chưa thể điều hướng hoặc không thể back, chúng ta sẽ xử lý
			if (navigation && !navigation.canGoBack()) {
				Alert.alert(
					"Confirm Exit", // Tiêu đề
					"Are you sure you want to exit the app?", // Nội dung
					[
						{
							text: "Cancel",
							onPress: () => null,
							style: "cancel"
						},
						{
							text: "Exit",
							onPress: () => BackHandler.exitApp()
						}
					]
				);

				// Return true để chặn hành động back mặc định
				return true;
			}

			// Nếu có thể back, để React Navigation tự xử lý
			return false;
		};

		const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

		return () => subscription.remove();
	}, []); // Dependency array rỗng để đảm bảo nó chỉ chạy 1 lần
	// --- KẾT THÚC THÊM MỚI ---


	if (!root) {
		return null;
	}

	const navTheme = navigationTheme(theme);

	return (
		<NavigationContainer
			theme={navTheme}
			ref={Navigation.navigationRef}
			onReady={() => {
				emitter.emit('navigationReady');
			}}
			onStateChange={state => {
				const previousRouteName = Navigation.routeNameRef.current;
				const currentRouteName = getActiveRouteName(state);
				if (previousRouteName !== currentRouteName) {
					setCurrentScreen(currentRouteName);
				}
				Navigation.routeNameRef.current = currentRouteName;
			}}>
			<Stack.Navigator screenOptions={{ headerShown: false, animation: 'none', navigationBarColor: themes[ theme ].surfaceLight }}>
				{root === RootEnum.ROOT_LOADING || root === RootEnum.ROOT_LOADING_SHARE_EXTENSION ? (
					<Stack.Screen name='AuthLoading' component={AuthLoadingView} />
				) : null}
				{root === RootEnum.ROOT_OUTSIDE ? <Stack.Screen name='OutsideStack' component={OutsideStack} /> : null}
				{root === RootEnum.ROOT_INSIDE && isMasterDetail ? (
					<Stack.Screen name='MasterDetailStack' component={MasterDetailStack} />
				) : null}
				{root === RootEnum.ROOT_INSIDE && !isMasterDetail ? <Stack.Screen name='InsideStack' component={InsideStack} /> : null}
				{root === RootEnum.ROOT_SET_USERNAME ? <Stack.Screen name='SetUsernameStack' component={SetUsernameStack} /> : null}
				{root === RootEnum.ROOT_SHARE_EXTENSION ? (
					<Stack.Screen name='ShareExtensionStack' component={ShareExtensionStack} />
				) : null}
				{root === RootEnum.ROOT_NX ? (
					<Stack.Screen name='NxcomStack' component={NxcomStackNavigator} />
				) : null}

			</Stack.Navigator>
			<GlobalFAB />
			<NxSnackbar ref={(ref) => { R.NxSnackbar = ref; }} />
			<NxLoading ref={(ref) => { R.Loading = ref; }} />

		</NavigationContainer>
	);
});
const mapStateToProps = (state: any) => ({
	root: state.app.root,
	isMasterDetail: state.app.isMasterDetail
});

const AppContainer = connect(mapStateToProps)(App);
export default AppContainer;
