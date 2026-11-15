import type { ComponentType, CSSProperties, ReactNode } from 'react';
import type React from 'react';
import type ReactDOM from 'react-dom';
import type * as jsxRuntime from 'react/jsx-runtime';

export type UiScreenId =
  | 'title'
  | 'textbox'
  | 'choose'
  | 'save'
  | 'load'
  | 'options'
  | 'flowchart'
  | 'menuPanel'
  | 'backlog'
  | 'extra'
  | 'bottomControlPanel'
  | 'globalDialog';

export interface ScreenPartDefinition {
  id: string;
  name: string;
  selector: string;
  allowLayoutEdit: boolean;
}

export interface UiSoundEffects {
  enter: () => void;
  click: () => void;
  switch: () => void;
  pageChange: () => void;
  dialogOpen: () => void;
}

export interface ScreenCommonProps {
  t: (key: string) => string;
  playSe: UiSoundEffects;
}

export interface SaveSlotData {
  index: number;
  saveTime: string;
  previewImage: string;
  nowStageState: {
    showName: string;
    showText: string;
    [key: string]: unknown;
  };
  backlog: unknown[];
  sceneData: {
    currentSentenceId: number;
    sceneName: string;
    sceneUrl: string;
    [key: string]: unknown;
  };
}

export interface TitleScreenProps extends ScreenCommonProps {
  visible: boolean;
  backgroundUrl: string;
  canContinue: boolean;
  enableContinue: boolean;
  enableExtra: boolean;
  hasAppreciationItems: boolean;
  onStart: () => void;
  onContinue: () => void;
  onOpenLoad: () => void;
  onOpenOptions: () => void;
  onOpenExtra: () => void;
  onExit: () => void;
}

export interface TextBoxScreenProps extends ScreenCommonProps {
  visible: boolean;
  isHasName: boolean;
  showName: string;
  dialogSegments: string[];
  currentDialogKey: string;
  isRead: boolean;
  isPreview?: boolean;
  miniAvatarUrl: string;
  fontFamily: string;
  fontSizePercent: number;
  lineHeight: number;
  lineLimit: number;
  textDelayMs: number;
  textDurationMs: number;
  textRevealEndMs?: number;
  textboxOpacity: number;
  isDialogNotend: boolean;
  settledSignal: number;
}

export interface ChooseOptionItem {
  id: string;
  text: string;
  disabled: boolean;
}

export interface ChooseScreenProps extends ScreenCommonProps {
  visible: boolean;
  options: ChooseOptionItem[];
  fontFamily: string;
  onSelect: (id: string) => void;
}

export interface SaveScreenProps extends ScreenCommonProps {
  visible: boolean;
  slPage: number;
  savesByIndex: Record<number, SaveSlotData | null | undefined>;
  onSelectPage: (page: number) => void;
  onLoadRange: (startIndex: number, endIndex: number) => void;
  onSlotAction: (index: number) => void;
}

export interface LoadScreenProps extends ScreenCommonProps {
  visible: boolean;
  slPage: number;
  savesByIndex: Record<number, SaveSlotData | null | undefined>;
  onSelectPage: (page: number) => void;
  onLoadRange: (startIndex: number, endIndex: number) => void;
  onSlotAction: (index: number) => void;
}

export interface FontOption {
  family: string;
  source: 'default' | 'template';
  labelKey?: string;
  label?: string;
}

export interface LanguageOptionItem {
  value: number;
  label: string;
}

export interface OptionData {
  volumeMain: number;
  textSpeed: number;
  autoSpeed: number;
  textSize: number;
  vocalVolume: number;
  bgmVolume: number;
  seVolume: number;
  uiSeVolume: number;
  slPage: number;
  textboxFont: number;
  textboxOpacity: number;
  language: number;
  voiceInterruption: number;
  fullScreen: number;
  skipAll: boolean;
}

export interface OptionsScreenProps extends ScreenCommonProps {
  visible: boolean;
  optionData: OptionData;
  fontOptions: FontOption[];
  languageOptions: LanguageOptionItem[];
  isFullscreenSupported: boolean;
  isFullscreen: boolean;
  previewBgUrl: string;
  version: string;
  onChangeOption: <K extends keyof OptionData>(key: K, value: OptionData[K]) => void;
  onChangeLanguage: (lang: number) => void;
  onToggleFullscreen: (enable: boolean) => void;
  onResetSaves: () => void;
  onResetOptions: () => void;
  onResetAll: () => void;
  onExportSaves: () => void;
  onImportSaves: (file: File) => void;
  textboxPreviewNode?: ReactNode;
}

export interface FlowchartNode {
  id: string;
  position: { x: number; y: number };
  data: { label: string; sceneName: string; isRoot?: boolean; [key: string]: unknown };
  type?: string;
}

export interface FlowchartEdge {
  id: string;
  source: string;
  target: string;
}

export interface FlowchartItem {
  id: string;
  name: string;
  type?: 'main' | 'character';
  nodes: FlowchartNode[];
  edges: FlowchartEdge[];
}

export interface FlowchartScreenProps extends ScreenCommonProps {
  visible: boolean;
  flowcharts: FlowchartItem[];
  unlockedNodeKeys: string[];
  lockedNodeVisibility: 'all' | 'node' | 'none';
  onJumpToNode: (flowchartId: string, nodeId: string) => void;
}

export interface MenuPanelScreenProps extends ScreenCommonProps {
  visible: boolean;
  activeTag: number;
  canSave: boolean;
  enableFlowchart: boolean;
  onSelectTag: (tag: number) => void;
  onBackToTitle: () => void;
  onClose: () => void;
}

export interface BacklogViewItem {
  index: number;
  speaker: string;
  text: string;
  vocalUrl: string;
  sentenceId: number;
}

export interface BacklogScreenProps extends ScreenCommonProps {
  visible: boolean;
  items: BacklogViewItem[];
  playingIndex: number | null;
  onJump: (index: number) => void;
  onToggleVocal: (index: number) => void;
  onClose: () => void;
  scrollContainerAttr: 'data-webgal-backlog-scroll';
}

export interface AppreciationAsset {
  name: string;
  url: string;
  series: string;
  order?: number;
}

export interface ExtraCgGroup {
  key: string;
  name: string;
  resources: AppreciationAsset[];
}

export interface ExtraScreenProps extends ScreenCommonProps {
  visible: boolean;
  cgGroups: ExtraCgGroup[];
  bgmList: AppreciationAsset[];
  currentBgmUrl: string;
  isBgmPlaying: boolean;
  onSelectBgm: (url: string) => void;
  onToggleBgmPlay: () => void;
  onPrevBgm: () => void;
  onNextBgm: () => void;
  onClose: () => void;
}

export interface BottomControlPanelScreenProps extends ScreenCommonProps {
  visible: boolean;
  controlsVisible: boolean;
  isTextBoxVisible: boolean;
  isControlsLocked: boolean;
  isAuto: boolean;
  isFast: boolean;
  isFullscreen: boolean;
  isFullscreenSupported: boolean;
  enableFlowchart: boolean;
  quickSavePreview: SaveSlotData | null;
  onToggleTextBox: () => void;
  onOpenBacklog: () => void;
  onOpenFlowchart: () => void;
  onReplayVocal: () => void;
  onToggleAuto: () => void;
  onToggleFast: () => void;
  onQuickSave: () => void;
  onQuickLoad: () => void;
  onOpenSave: () => void;
  onOpenLoad: () => void;
  onOpenOptions: () => void;
  onBackToTitle: () => void;
  onToggleFullscreen: () => void;
  onToggleControlsLock: () => void;
}

export interface GlobalDialogScreenProps extends ScreenCommonProps {
  visible: boolean;
  title: string;
  confirmText: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
}

export interface ScreenPropsMap {
  title: TitleScreenProps;
  textbox: TextBoxScreenProps;
  choose: ChooseScreenProps;
  save: SaveScreenProps;
  load: LoadScreenProps;
  options: OptionsScreenProps;
  flowchart: FlowchartScreenProps;
  menuPanel: MenuPanelScreenProps;
  backlog: BacklogScreenProps;
  extra: ExtraScreenProps;
  bottomControlPanel: BottomControlPanelScreenProps;
  globalDialog: GlobalDialogScreenProps;
}

export interface RichTextToken {
  text: string;
  ruby?: string;
  styleCss?: string;
  styleAllTextCss?: string;
}

export interface RichTextRenderOptions {
  lineLimit?: number;
  replaceSpaceWithNbsp?: boolean;
  isSettled?: boolean;
  charDelayMs?: number;
  charDurationMs?: number;
  revealEndMs?: number;
  prefixNodeCount?: number;
  dialogKey?: string;
  settledClassName?: string;
  animateClassName?: string;
}

export type UiIconComponent = ComponentType<{
  theme?: 'outline' | 'filled' | 'two-tone' | 'multi-color';
  size?: number | string;
  fill?: string | string[];
  strokeWidth?: number;
  className?: string;
  style?: CSSProperties;
}>;

export interface UiSdkIcons {
  Acoustic: UiIconComponent;
  AlignTextLeftOne: UiIconComponent;
  Attention: UiIconComponent;
  CheckOne: UiIconComponent;
  Close: UiIconComponent;
  CloseSmall: UiIconComponent;
  ConnectionPointTwo: UiIconComponent;
  DoubleDown: UiIconComponent;
  DoubleRight: UiIconComponent;
  DoubleUp: UiIconComponent;
  Down: UiIconComponent;
  FolderOpen: UiIconComponent;
  FullScreen: UiIconComponent;
  GoEnd: UiIconComponent;
  GoStart: UiIconComponent;
  HamburgerButton: UiIconComponent;
  Home: UiIconComponent;
  Info: UiIconComponent;
  Left: UiIconComponent;
  Lock: UiIconComponent;
  Logout: UiIconComponent;
  Music: UiIconComponent;
  MusicList: UiIconComponent;
  OffScreen: UiIconComponent;
  PauseOne: UiIconComponent;
  Picture: UiIconComponent;
  Play: UiIconComponent;
  PlayOne: UiIconComponent;
  PreviewCloseOne: UiIconComponent;
  PreviewOpen: UiIconComponent;
  ReplayMusic: UiIconComponent;
  Return: UiIconComponent;
  Right: UiIconComponent;
  Save: UiIconComponent;
  SettingTwo: UiIconComponent;
  SquareSmall: UiIconComponent;
  Theme: UiIconComponent;
  Translate: UiIconComponent;
  TreeDiagram: UiIconComponent;
  Unlock: UiIconComponent;
  Up: UiIconComponent;
  VolumeMute: UiIconComponent;
  VolumeNotice: UiIconComponent;
  VolumeSmall: UiIconComponent;
}

export interface WebgalUiSdk {
  version: string;
  react: typeof React;
  reactDom: typeof ReactDOM;
  jsxRuntime: typeof jsxRuntime;
  emotion: {
    css: (...args: unknown[]) => string;
    cx: (...args: unknown[]) => string;
    keyframes: (...args: unknown[]) => string;
    injectGlobal: (...args: unknown[]) => void;
  };
  icons: Readonly<UiSdkIcons>;
  resolveAssetUrl: (relativePath: string, screenBaseUrl?: string | null) => string;
  resolveScreenAssetUrl: (relativePath: string, screenBaseUrl?: string | null) => string;
  renderRichText: (text: string, options?: RichTextRenderOptions) => ReactNode;
  renderRichTextLines: (lines: RichTextToken[][], options?: RichTextRenderOptions) => ReactNode;
  parseRichTextLines: (text: string, options?: Pick<RichTextRenderOptions, 'lineLimit' | 'replaceSpaceWithNbsp'>) => RichTextToken[][];
  useScreenParts: (
    screen: UiScreenId,
    parts: ScreenPartDefinition[],
    defaultCssText: string,
  ) => { rootProps: { 'data-webgal-screen': UiScreenId; className: string } };
}

declare global {
  interface Window {
    __WEBGAL_UI_SDK__?: WebgalUiSdk;
  }
  var __WEBGAL_UI_SDK__: WebgalUiSdk | undefined;
}

declare module '@webgal/ui-sdk' {
  const sdk: WebgalUiSdk;
  export default sdk;
  export const version: string;
  export const emotion: WebgalUiSdk['emotion'];
  export const icons: WebgalUiSdk['icons'];
  export const resolveAssetUrl: WebgalUiSdk['resolveAssetUrl'];
  export const resolveScreenAssetUrl: WebgalUiSdk['resolveScreenAssetUrl'];
  export const renderRichText: WebgalUiSdk['renderRichText'];
  export const renderRichTextLines: WebgalUiSdk['renderRichTextLines'];
  export const parseRichTextLines: WebgalUiSdk['parseRichTextLines'];
  export const useScreenParts: WebgalUiSdk['useScreenParts'];
}

declare module '@icon-park/react' {
  const icons: UiSdkIcons;
  export default icons;
  export const Acoustic: UiIconComponent;
  export const AlignTextLeftOne: UiIconComponent;
  export const Attention: UiIconComponent;
  export const CheckOne: UiIconComponent;
  export const Close: UiIconComponent;
  export const CloseSmall: UiIconComponent;
  export const ConnectionPointTwo: UiIconComponent;
  export const DoubleDown: UiIconComponent;
  export const DoubleRight: UiIconComponent;
  export const DoubleUp: UiIconComponent;
  export const Down: UiIconComponent;
  export const FolderOpen: UiIconComponent;
  export const FullScreen: UiIconComponent;
  export const GoEnd: UiIconComponent;
  export const GoStart: UiIconComponent;
  export const HamburgerButton: UiIconComponent;
  export const Home: UiIconComponent;
  export const Info: UiIconComponent;
  export const Left: UiIconComponent;
  export const Lock: UiIconComponent;
  export const Logout: UiIconComponent;
  export const Music: UiIconComponent;
  export const MusicList: UiIconComponent;
  export const OffScreen: UiIconComponent;
  export const PauseOne: UiIconComponent;
  export const Picture: UiIconComponent;
  export const Play: UiIconComponent;
  export const PlayOne: UiIconComponent;
  export const PreviewCloseOne: UiIconComponent;
  export const PreviewOpen: UiIconComponent;
  export const ReplayMusic: UiIconComponent;
  export const Return: UiIconComponent;
  export const Right: UiIconComponent;
  export const Save: UiIconComponent;
  export const SettingTwo: UiIconComponent;
  export const SquareSmall: UiIconComponent;
  export const Theme: UiIconComponent;
  export const Translate: UiIconComponent;
  export const TreeDiagram: UiIconComponent;
  export const Unlock: UiIconComponent;
  export const Up: UiIconComponent;
  export const VolumeMute: UiIconComponent;
  export const VolumeNotice: UiIconComponent;
  export const VolumeSmall: UiIconComponent;
}
