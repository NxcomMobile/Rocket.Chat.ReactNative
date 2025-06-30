// File: app/views/NxcomView/component/R.ts
import {
	Dimensions,
	StatusBar
} from 'react-native';

const DEVICE_WIDTH = Dimensions.get('window').width;
const DEVICE_HEIGHT = Dimensions.get('window').height;
const STATUS_BAR_HEIGHT = StatusBar.currentHeight;
const TABBAR_HEIGHT = 60;

// Khai báo các biến toàn cục, ban đầu là null
let Loading: any = null;
let Popup: any = null;
let Alert: any = null;
let Notifier: any = null;
let NxSnackbar: any = null; // << THÊM DÒNG NÀY
let ActionSheet: any = null;
let ActionSheetDropdown: any = null;

// Tạo một object R để export
const R = {
    DEVICE_HEIGHT,
    TABBAR_HEIGHT,
    DEVICE_WIDTH,
    STATUS_BAR_HEIGHT,
    // Sử dụng getter và setter để truy cập và gán giá trị
    get Loading() { return Loading; },
    set Loading(ref) { Loading = ref; },

    get Notifier() { return Notifier; },
    set Notifier(ref) { Notifier = ref; },

    get Popup() { return Popup; },
    set Popup(ref) { Popup = ref; },

    get Alert() { return Alert; },
    set Alert(ref) { Alert = ref; },

    get NxSnackbar() { return NxSnackbar; }, // << THÊM DÒNG NÀY
    set NxSnackbar(ref) { NxSnackbar = ref; }, // << THÊM DÒNG NÀY

    get ActionSheet() { return ActionSheet; },
    set ActionSheet(ref) { ActionSheet = ref; },

    get ActionSheetDropdown() { return ActionSheetDropdown; },
    set ActionSheetDropdown(ref) { ActionSheetDropdown = ref; }
};

export default R;