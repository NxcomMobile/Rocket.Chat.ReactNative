import React from 'react';

import { createDrawerNavigator } from '@react-navigation/drawer';
import {
	NavigatorScreenParams,
	RouteProp
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import NxcomView from '.';
import {
	defaultHeader,
	themedHeader
} from '../../lib/methods/helpers/navigation';
import { TNavigation } from '../../stacks/stackType';
import { ThemeContext } from '../../theme';
import NxSidebar from './NxSidebarView';
import NxWebview from './NxWebview';

// Params for the stack that contains NxcomView and NxWebview (content of a drawer item)
export type NxForumStackParamList = {
    NxcomView: undefined;
    NxWebview: {
        url: string;
        title: string;
    };
};

// This is the Native Stack for the content part (NxcomView, NxWebview)
const NxForumContentStack = createNativeStackNavigator<NxForumStackParamList>();
const NxForumStackNavigator = () => {
    const { theme } = React.useContext(ThemeContext);
    return (
        <NxForumContentStack.Navigator screenOptions={{ ...defaultHeader, ...themedHeader(theme) }}>
            <NxForumContentStack.Screen
                name='NxcomView'
                component={NxcomView}
            // options={{
            //     headerShown: false
            // }}
            />
            <NxForumContentStack.Screen
                name='NxWebview'
                component={(props: { route: RouteProp<NxForumStackParamList, 'NxWebview'> }) => (
                    <NxWebview site_url={''} redirect_url={''} {...props.route.params} />
                )}
                options={{
                    headerShown: true,
                    ...defaultHeader,
                    ...themedHeader(theme)
                }}
            />
        </NxForumContentStack.Navigator>
    );
};

// Params for the Drawer Navigator for the NX section
export type NxDrawerActualParamList = {
    NxForumContent: NavigatorScreenParams<NxForumStackParamList>; // Screen within the drawer
    // Add other screens for the NX drawer menu here, e.g., NxSettings: undefined;
};

const ActualNxDrawer = createDrawerNavigator<NxDrawerActualParamList>();
const NxDrawerComponent = () => { // This component IS the Drawer Navigator
    const { colors } = React.useContext(ThemeContext); // For drawer style, if needed

    return (
        <ActualNxDrawer.Navigator
            drawerContent={props => <NxSidebar {...props} />}
            screenOptions={{
                headerShown: false, // Screens inside drawer manage their own headers
                drawerType: 'slide',
                overlayColor: `rgba(0,0,0,${colors.backdropOpacity})` // Example from InsideStack
                // swipeEnabled: false, // Set true if you want swipe gesture
            }}
        >
            <ActualNxDrawer.Screen name='NxForumContent' component={NxForumStackNavigator} />
            {/* Example: <ActualNxDrawer.Screen name="NxSettings" component={NxSettingsScreenComponent} /> */}
        </ActualNxDrawer.Navigator>
    );
};

// Params for the main Nxcom Native Stack. It hosts the Drawer and any top-level modals for NX.
export type NxcomStackParamList = {
    DrawerNavigator: undefined; // This screen will render NxDrawerComponent
    // Add any NX-specific modal screens here, sibling to DrawerNavigator
    // e.g., MyNxModal: { id: string };
};

// This is the Native Stack Navigator, as in the original file.
const NxcomTopLevelStack = createNativeStackNavigator<NxcomStackParamList & TNavigation>();

// This is the main exported component.
const NxcomStackNavigator = () => {
    const { theme } = React.useContext(ThemeContext);
    return (
        <NxcomTopLevelStack.Navigator initialRouteName='DrawerNavigator' screenOptions={{ ...defaultHeader, ...themedHeader(theme), presentation: 'containedModal' }}>
            <NxcomTopLevelStack.Screen name='DrawerNavigator' component={NxDrawerComponent} options={{ headerShown: false }} />
            {/* Modals specific to NX section would go here, e.g.: */}
            {/* <NxcomTopLevelStack.Screen name="MyNxModal" component={MyNxModalScreenComponent} /> */}
        </NxcomTopLevelStack.Navigator>
    );
};

export default NxcomStackNavigator;