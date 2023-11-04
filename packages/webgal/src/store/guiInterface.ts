import { IWebGalTextBoxTheme } from '@/Components/themeInterface';

/**
 * 当前Menu页面显示的Tag
 */
export enum MenuPanelTag {
  Save, // “保存”选项卡
  Load, // “读取”选项卡
  Option, // “设置”选项卡
}

export interface ITheme {
  textbox: IWebGalTextBoxTheme;
}

/**
 * @interface IGuiState GUI状态接口
 */
export interface IGuiState {
  showStarter: boolean; // 是否显示初始界面（用于使得bgm可以播放)
  showTitle: boolean; // 是否显示标题界面
  showMenuPanel: boolean; // 是否显示Menu界面
  showTextBox: boolean;
  currentMenuTag: MenuPanelTag; // 当前Menu界面的选项卡
  showBacklog: boolean;
  titleBgm: string; // 标题背景音乐
  titleBg: string; // 标题背景图片
  logoImage: string[];
  showExtra: boolean;
  showGlobalDialog: boolean;
  showPanicOverlay: boolean;
  isEnterGame: boolean;
  theme: ITheme;
}

export type componentsVisibility = Pick<
  IGuiState,
  Exclude<keyof IGuiState, 'currentMenuTag' | 'titleBg' | 'titleBgm' | 'logoImage' | 'theme'>
>;
// 标题资源
export type GuiAsset = Pick<IGuiState, 'titleBgm' | 'titleBg'>;

export interface IGuiStore {
  GuiState: IGuiState;
  setGuiAsset: <K extends keyof GuiAsset>(key: K, value: string) => void;
  setVisibility: <K extends keyof componentsVisibility>(key: K, value: boolean) => void;
  setMenuPanelTag: (value: MenuPanelTag) => void;
}

export interface setVisibilityPayload {
  component: keyof componentsVisibility;
  visibility: boolean;
}

export interface setAssetPayload {
  asset: keyof GuiAsset;
  value: string;
}

export type GuiStore = IGuiStore;
