import {
    Dimensions,
    StatusBar
} from 'react-native';

const DEVICE_WIDTH = Dimensions.get('window').width;
const DEVICE_HEIGHT = Dimensions.get('window').height;
const STATUS_BAR_HEIGHT = StatusBar.currentHeight;
const TABBAR_HEIGHT = 60;
const Loading: any = null;
const Popup: any = null;
const Alert: any = null;
const Notifier: any = null;
const NxSnackbar: any = null;
const ActionSheet: any = null;
const ActionSheetDropdown: any = null;
const R = {
    DEVICE_HEIGHT,
    TABBAR_HEIGHT,
    DEVICE_WIDTH,
    STATUS_BAR_HEIGHT,
    Loading,
    Notifier,
    Popup,
    Alert,
    ActionSheet,
    ActionSheetDropdown,
    NxSnackbar
}
export default R