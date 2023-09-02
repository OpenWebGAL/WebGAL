/**
 * @file 记录当前GUI的状态信息，引擎初始化时会重置。
 * @author Mahiru
 */
import { getStorage } from '@/Core/controller/storage/storageController';
import { language } from '@/config/language';
import { IGuiState, MenuPanelTag, setAssetPayload, setDefaultLanguagePayload, setVisibilityPayload } from '@/store/guiInterface';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

/**
 * 初始GUI状态表
 */
const initState: IGuiState = {
  showBacklog: false,
  showStarter: true,
  showTitle: true,
  showMenuPanel: false,
  showTextBox: true,
  currentMenuTag: MenuPanelTag.Option,
  titleBg: '',
  titleBgm: '',
  logoImage: '',
  showExtra: false,
  showGlobalDialog: false,
  showPanicOverlay: false,
  defaultLanguage: null,
  isEnterGame: false,
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
      (state[component] as boolean) = visibility;
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
    setDefaultLanguage: (state, action: PayloadAction<setDefaultLanguagePayload>) => {
      const lang = action.payload;
      if((!lang && lang !== 0) || language[lang] === undefined) return;
      state.defaultLanguage = action.payload ?? null; 
    }
  },
});

export const { setVisibility, setMenuPanelTag, setGuiAsset, setDefaultLanguage } = GUISlice.actions;
export default GUISlice.reducer;
