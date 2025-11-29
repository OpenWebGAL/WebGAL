import { getStorage } from '@/Core/controller/storage/storageController';
import {
  FontOption,
  GuiAsset,
  IGuiState,
  MenuPanelTag,
  setAssetPayload,
  setVisibilityPayload,
} from '@/store/guiInterface';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DEFAULT_FONT_OPTIONS } from '@/Core/util/fonts/fontOptions';

/**
 * 初始GUI状态表
 */
const initState: IGuiState = {
  fontOptions: [...DEFAULT_FONT_OPTIONS],
  showBacklog: false,
  showStarter: true,
  showTitle: true,
  showMenuPanel: false,
  showTextBox: true,
  showControls: true,
  controlsVisibility: true,
  currentMenuTag: MenuPanelTag.Option,
  titleBg: '',
  titleBgm: '',
  logoImage: [],
  showExtra: false,
  showGlobalDialog: false,
  showPanicOverlay: false,
  isEnterGame: false,
  isShowLogo: true,
  enableAppreciationMode: false, // Paf87
  fontOptimization: false,
};

/**
 * GUI状态的Reducer
 */
const GUISlice = createSlice({
  name: 'gui',
  initialState: initState,
  reducers: {
    /**
     * 设置GUI的各组件的显示状态
     * @param state 当前GUI状态
     * @param action 改变显示状态的Action
     */
    setVisibility: (state, action: PayloadAction<setVisibilityPayload>) => {
      getStorage();
      const { component, visibility } = action.payload;
      state[component] = visibility;
    },
    /**
     * 设置MenuPanel的当前选中项
     * @param state 当前GUI状态
     * @param action 改变当前选中项的Action
     */
    setMenuPanelTag: (state, action: PayloadAction<MenuPanelTag>) => {
      getStorage();
      state.currentMenuTag = action.payload;
    },
    /**
     * 设置GUI资源的值
     * @param state 当前GUI状态
     * @param action 改变资源的Action
     */
    setGuiAsset: (state, action: PayloadAction<setAssetPayload>) => {
      const { asset, value } = action.payload;
      state[asset] = value;
    },
    setLogoImage: (state, action: PayloadAction<string[]>) => {
      state.logoImage = [...action.payload];
    },
    /**
     * 设置 enableAppreciationMode 属性
     * @param state 当前GUI状态
     * @param action 改变 enableAppreciationMode 属性的Action
     */
    setEnableAppreciationMode: (state, action: PayloadAction<boolean>) => {
      state.enableAppreciationMode = action.payload;
    },
    setFontOptimization: (state, action: PayloadAction<boolean>) => {
      state.fontOptimization = action.payload;
    },
    setFontOptions: (state, action: PayloadAction<FontOption[]>) => {
      state.fontOptions = [...action.payload];
    },
  },
});

export const {
  setVisibility,
  setMenuPanelTag,
  setGuiAsset,
  setLogoImage,
  setEnableAppreciationMode,
  setFontOptimization,
  setFontOptions,
} = GUISlice.actions;
export default GUISlice.reducer;

// export function GuiStateStore(): GuiStore {
//     const [GuiState, setGuiState] = useState(initState);
//     /**
//      * 设置各组件的可见性
//      * @param key 设置的组件
//      * @param value 可见性，true or false
//      */
//     const setVisibility = <K extends keyof componentsVisibility>(key: K, value: boolean) => {
//
//         setGuiState(state => {
//             getStorage();
//             state[key] = value;
//             if (key === 'showMenuPanel' || key === 'showBacklog') {
//                 state['showTextBox'] = !value;
//             }
//             return {...state};
//         });
//
//     };
//
//     /**
//      * 设置Menu组件显示的标签页
//      * @param value 标签页
//      */
//     const setMenuPanelTag = (value: MenuPanelTag) => {
//
//         setGuiState(state => {
//             getStorage();
//             state.currentMenuTag = value;
//             return {...state};
//         });
//
//     };
//
//     /**
//      * 设置标题页的资源路径
//      * @param key 资源名
//      * @param value 资源路径
//      */
//     const setGuiAsset = <K extends keyof GuiAsset>(key: K, value: string) => {
//
//         setGuiState(state => {
//             state[key] = value;
//             return {...state};
//         });
//
//     };
//
//     return {
//         GuiState,
//         setGuiAsset,
//         setVisibility,
//         setMenuPanelTag,
//     };
// }
