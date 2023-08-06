import { IRunPerform } from '@/Core/Modules/perform/performInterface';

/**
 * 游戏内变量
 * @interface IGameVar
 */
export interface IGameVar {
  [propName: string]: string | boolean | number;
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

export interface ITransform {
  alpha: number;
  scale: {
    x: number;
    y: number;
  };
  pivot: {
    x: number;
    y: number;
  };
  position: {
    x: number;
    y: number;
  };
  rotation: number;
  blur: number;
}

/**
 * 基本效果接口
 * @interface IEffect
 */
export interface IEffect {
  target: string; // 作用目标
  transform?: ITransform; // 变换
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
  pivot: {
    x: 0.5,
    y: 0.5,
  },
  position: {
    x: 0,
    y: 0,
  },
  rotation: 0,
  blur: 0,
};

export interface IFreeFigure {
  basePosition: 'left' | 'center' | 'right';
  name: string;
  key: string;
}

/**
 * @interface IStageState 游戏舞台数据接口
 */
export interface IStageState {
  oldBgName: string; // 旧背景的文件路径
  bgName: string; // 背景文件地址（相对或绝对）
  figName: string; // 立绘_中 文件地址（相对或绝对）
  figNameLeft: string; // 立绘_左 文件地址（相对或绝对）
  figNameRight: string; // 立绘_右 文件地址（相对或绝对）
  // 自由立绘
  freeFigure: Array<IFreeFigure>;
  showText: string; // 文字
  showTextSize: number; // 文字
  showName: string; // 人物名
  command: string; // 语句指令
  choose: Array<IChooseItem>; // 选项列表
  vocal: string; // 语音 文件地址（相对或绝对）
  vocalVolume: number; // 语音 音量调整（0 - 100）
  bgm: string; // 背景音乐 文件地址（相对或绝对）
  bgmEnter: number; // 背景音乐 淡入或淡出的毫秒数
  bgmVolume: number; // 背景音乐 音量调整（0 - 100）
  uiSe: string; // 用户界面音效 文件地址（相对或绝对）
  seVolume: number; // 音效 音量调整（0 - 100）
  miniAvatar: string; // 小头像 文件地址（相对或绝对）
  GameVar: IGameVar; // 游戏内变量
  effects: Array<IEffect>; // 应用的变换
  bgTransform: string;
  bgFilter: string;
  PerformList: Array<IRunPerform>; // 要启动的演出列表
  currentDialogKey: string; // 当前对话的key
  live2dMotion: { target: string; motion: string }[];
  // 当前演出的延迟，用于做对话插演出！
  // currentPerformDelay:number
  currentConcatDialogPrev: string;
  // 测试：电影叙事
  enableFilm: string;
  isDisableTextbox: boolean;
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
