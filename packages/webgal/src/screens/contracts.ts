import type { ComponentType, ReactNode } from 'react';
import type { IFlowchart } from '@/Core/Modules/flowchart';
import type { MenuPanelTag } from '@/store/guiInterface';
import type { IAppreciationAsset, IOptionData, ISaveData } from '@/store/userDataInterface';
import type { FontOption } from '@/store/guiInterface';

export const UI_SCREEN_IDS = [
  'title',
  'textbox',
  'choose',
  'save',
  'load',
  'options',
  'flowchart',
  'menuPanel',
  'backlog',
  'extra',
  'bottomControlPanel',
  'globalDialog',
] as const;

export type UiScreenId = (typeof UI_SCREEN_IDS)[number];

export type UiPseudoState = 'default' | 'hover' | 'active' | 'selected' | 'disabled';

export type UiPartKind = 'container' | 'text';

export type SaveSlotData = ISaveData;

export interface ScreenPartDefinition {
  id: string;
  name: string;
  /** CSS selector relative to the screen root, e.g. '.Title_buttonList' */
  selector: string;
  /** Whether layout properties (left/top/width/height) can be edited on canvas */
  allowLayoutEdit: boolean;
  /** Visual role in Simple Mode: 'container' edits background/border; 'text' edits typography */
  kind?: UiPartKind;
  /** Optional ancestor selector that hosts interactive states (:hover/:active/.active/:disabled) */
  stateHostSelector?: string;
}

export interface BuiltInScreenVariant<P = any> {
  screen: UiScreenId;
  variantId: string;
  name: string;
  component: ComponentType<P>;
  parts: ScreenPartDefinition[];
  defaultCssText: string;
}

export interface CustomScreenModule<P = any> {
  default?: ComponentType<P>;
  Screen?: ComponentType<P>;
  variantId?: string;
  name?: string;
  parts?: ScreenPartDefinition[];
  defaultCssText?: string;
}

export interface UiSoundEffects {
  enter: () => void;
  click: () => void;
  switch: () => void;
  pageChange: () => void;
  dialogOpen: () => void;
}

export interface ScreenCommonProps {
  /** Translate by full i18next key, e.g. t('title.start.title') */
  t: (key: string) => string;
  playSe: UiSoundEffects;
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

export interface LanguageOptionItem {
  value: number;
  label: string;
}

export interface OptionsScreenProps extends ScreenCommonProps {
  visible: boolean;
  optionData: IOptionData;
  fontOptions: FontOption[];
  languageOptions: LanguageOptionItem[];
  isFullscreenSupported: boolean;
  isFullscreen: boolean;
  previewBgUrl: string;
  version: string;
  onChangeOption: <K extends keyof IOptionData>(key: K, value: IOptionData[K]) => void;
  onChangeLanguage: (lang: number) => void;
  onToggleFullscreen: (enable: boolean) => void;
  onResetSaves: () => void;
  onResetOptions: () => void;
  onResetAll: () => void;
  onExportSaves: () => void;
  onImportSaves: (file: File) => void;
  textboxPreviewNode?: ReactNode;
}

export interface FlowchartScreenProps extends ScreenCommonProps {
  visible: boolean;
  flowcharts: IFlowchart[];
  unlockedNodeKeys: string[];
  lockedNodeVisibility: 'all' | 'node' | 'none';
  onJumpToNode: (flowchartId: string, nodeId: string) => void;
}

export interface MenuPanelScreenProps extends ScreenCommonProps {
  visible: boolean;
  activeTag: MenuPanelTag;
  canSave: boolean;
  enableFlowchart: boolean;
  onSelectTag: (tag: MenuPanelTag) => void;
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
  /** Scroll container attribute required by wheel-to-close hotkey */
  scrollContainerAttr: 'data-webgal-backlog-scroll';
}

export interface ExtraCgGroup {
  key: string;
  name: string;
  resources: IAppreciationAsset[];
}

export interface ExtraScreenProps extends ScreenCommonProps {
  visible: boolean;
  cgGroups: ExtraCgGroup[];
  bgmList: IAppreciationAsset[];
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
