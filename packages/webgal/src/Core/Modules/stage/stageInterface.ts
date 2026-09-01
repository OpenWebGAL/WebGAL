import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { BlinkParam, FocusParam } from '@/Core/live2DCore';
import type { Transform } from '@/types/editorPreviewProtocol';

/**
 * 游戏内变量
 * @interface IGameVar
 */
export interface IGameVar {
  [propName: string]: string | boolean | number | Array<string | boolean | number>;
}

export interface ISetGameVar {
  key: string;
  value: string | boolean | number;
}

/**
 * 单个选项
 * @interface IChooseItem
 */
export interface IChooseItem {
  key: string; // 选项名称
  targetScene: string; // 选项target
  isSubScene: boolean; // 是否是子场景调用
}

export type ITransform = Transform;

/**
 * 基本效果接口
 * @interface IEffect
 */
export interface IEffect {
  target: string; // 作用目标
  transform?: ITransform; // 变换
}

export interface IStageAnimationSetting {
  target: string;
  enterAnimationName?: string;
  exitAnimationName?: string;
  enterDuration?: number;
  exitDuration?: number;
  enterAnimationIgnoreDefault?: boolean;
  exitAnimationIgnoreDefault?: boolean;
}

export type StageAnimationSettingUpdatableKey = Exclude<keyof IStageAnimationSetting, 'target'>;

export interface IUpdateAnimationSettingPayload {
  target: string;
  key: StageAnimationSettingUpdatableKey;
  value: IStageAnimationSetting[StageAnimationSettingUpdatableKey];
}

/**
 * 基本变换预设
 */
export const baseTransform: ITransform = {
  alpha: 1,
  scale: {
    x: 1,
    y: 1,
  },
  position: {
    x: 0,
    y: 0,
  },
  rotation: 0,
  blur: 0,
  brightness: 1,
  contrast: 1,
  saturation: 1,
  gamma: 1,
  colorRed: 255,
  colorGreen: 255,
  colorBlue: 255,
  bevel: 0,
  bevelThickness: 0,
  bevelRotation: 0,
  bevelSoftness: 0,
  bevelRed: 255,
  bevelGreen: 255,
  bevelBlue: 255,
  bloom: 0,
  bloomBrightness: 1,
  bloomBlur: 0,
  bloomThreshold: 0,
  oldFilm: 0,
  dotFilm: 0,
  reflectionFilm: 0,
  glitchFilm: 0,
  rgbFilm: 0,
  godrayFilm: 0,
  shockwaveFilter: 0,
  radiusAlphaFilter: 0,
};

/**
 * 立绘的预设位置，left / right 为靠边定位，其余均为中心定位
 */
export const FIGURE_POSITIONS = ['center', 'left', 'right', 'left13', 'right13', 'left14', 'right14'] as const;

export type IFigurePosition = (typeof FIGURE_POSITIONS)[number];

export const FIGURE_KEYS = FIGURE_POSITIONS.map((position) => `fig-${position}`);

export const figureStateKeyByPosition = {
  center: 'figName',
  left: 'figNameLeft',
  right: 'figNameRight',
  left13: 'figNameLeft13',
  right13: 'figNameRight13',
  left14: 'figNameLeft14',
  right14: 'figNameRight14',
} as const satisfies Record<IFigurePosition, keyof IStageState>;

/**
 * 计算立绘的基准 X 坐标
 */
export function getFigureBaseX(position: IFigurePosition, stageWidth: number, targetWidth: number): number {
  switch (position) {
    case 'left':
      return targetWidth / 2;
    case 'right':
      return stageWidth - targetWidth / 2;
    case 'left13':
      return stageWidth / 3;
    case 'right13':
      return (stageWidth * 2) / 3;
    case 'left14':
      return stageWidth / 4;
    case 'right14':
      return (stageWidth * 3) / 4;
    default:
      return stageWidth / 2;
  }
}

export interface IFreeFigure {
  basePosition: IFigurePosition;
  name: string;
  key: string;
}

/**
 * Live2D 自定义绘制范围的归一：未指定与全 0 是同一件事。
 *
 * 绘制范围参与立绘身份判定，演算与提交两侧必须用同一个口径，否则会把没变的立绘判成换了一张。
 */
export function normalizeFigureBounds(bounds?: [number, number, number, number]): [number, number, number, number] {
  return bounds ?? [0, 0, 0, 0];
}

export interface IFigureAssociatedAnimation {
  mouthAnimation: IMouthAnimationFile;
  blinkAnimation: IEyesAnimationFile;
  targetId: string;
  animationFlag: string;
}

export interface IMouthAnimationFile {
  open: string;
  close: string;
  halfOpen: string;
}

export interface IEyesAnimationFile {
  open: string;
  close: string;
}

/**
 * 启动演出接口
 * @interface IRunPerform
 */
export interface IRunPerform {
  id: string;
  isHoldOn: boolean; // 演出类型
  script: ISentence; // 演出脚本
}

export interface ILive2DMotion {
  target: string;
  motion: string;
  skin?: string;
  overrideBounds?: [number, number, number, number];
}

export interface ILive2DExpression {
  target: string;
  expression: string;
}

export interface ILive2DBlink {
  target: string;
  blink: BlinkParam;
}

export interface ILive2DFocus {
  target: string;
  focus: FocusParam;
}

export interface IFigureMetadata {
  zIndex?: number;
  blendMode?: string;
}

type figureMetaData = Record<string, IFigureMetadata>;

/**
 * @interface IStageState 游戏舞台数据接口
 */
export interface IStageState {
  oldBgName: string; // 旧背景的文件路径
  bgName: string; // 背景文件地址（相对或绝对）
  figName: string; // 立绘_中 文件地址（相对或绝对）
  figNameLeft: string; // 立绘_左 文件地址（相对或绝对）
  figNameRight: string; // 立绘_右 文件地址（相对或绝对）
  figNameLeft13: string; // 立绘_左 1/3 文件地址（相对或绝对）
  figNameRight13: string; // 立绘_右 1/3 文件地址（相对或绝对）
  figNameLeft14: string; // 立绘_左 1/4 文件地址（相对或绝对）
  figNameRight14: string; // 立绘_右 1/4 文件地址（相对或绝对）
  // 自由立绘
  freeFigure: Array<IFreeFigure>;
  figureAssociatedAnimation: Array<IFigureAssociatedAnimation>;
  isRead: boolean; // 是否已读
  showText: string; // 文字
  showTextSize: number; // 文字
  showName: string; // 人物名
  command: string; // 语句指令
  choose: Array<IChooseItem>; // 选项列表
  vocal: string; // 语音 文件地址（相对或绝对）
  playVocal: string; // 真实播放语音
  vocalVolume: number; // 语音 音量调整（0 - 100）
  bgm: {
    // 背景音乐
    src: string; // 背景音乐 文件地址（相对或绝对）
    enter: number; // 背景音乐 淡入或淡出的毫秒数
    volume: number; // 背景音乐 音量调整（0 - 100）
  };
  uiSe: string; // 用户界面音效 文件地址（相对或绝对）
  miniAvatar: string; // 小头像 文件地址（相对或绝对）
  GameVar: IGameVar; // 游戏内变量
  effects: Array<IEffect>; // 应用的变换
  animationSettings: Array<IStageAnimationSetting>;
  bgTransform: string;
  bgFilter: string;
  PerformList: Array<IRunPerform>; // 要启动的演出列表
  currentDialogKey: string; // 当前对话的key
  live2dMotion: ILive2DMotion[];
  live2dExpression: ILive2DExpression[];
  live2dBlink: ILive2DBlink[];
  live2dFocus: ILive2DFocus[];
  // 当前演出的延迟，用于做对话插演出！
  // currentPerformDelay:number
  currentConcatDialogPrev: string;
  // 测试：电影叙事
  enableFilm: string;
  isDisableTextbox: boolean;
  replacedUIlable: Record<string, string>;
  figureMetaData: figureMetaData;
}

/**
 * @interface ISetStagePayload 设置舞台状态的Action的Payload的数据接口
 */
export interface ISetStagePayload {
  key: keyof IStageState;
  value: any;
}

export interface IStageStore {
  stageState: IStageState;
  setStage: <K extends keyof IStageState>(key: K, value: any) => void;
  getStageState: () => IStageState;
  restoreStage: (newState: IStageState) => void;
}

export type StageStore = IStageStore;
