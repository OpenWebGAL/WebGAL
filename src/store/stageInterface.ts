import { IRunPerform } from '@/Core/controller/perform/performInterface';

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

interface ITransform {
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
}

interface IFilter {
  blur: string;
}

/**
 * 基本效果接口
 * @interface IEffect
 */
export interface IEffect {
  target: string; // 作用目标
  transform?: ITransform; // 变换
  filter?: IFilter; // 效果
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
};

/**
 * @interface IStageState 游戏舞台数据接口
 */
export interface IStageState {
  oldBgName: string; // 旧背景的文件路径
  bgName: string; // 背景文件地址（相对或绝对）
  figName: string; // 立绘_中 文件地址（相对或绝对）
  figNameLeft: string; // 立绘_左 文件地址（相对或绝对）
  figNameRight: string; // 立绘_右 文件地址（相对或绝对）
  showText: string; // 文字
  showName: string; // 人物名
  command: string; // 语句指令
  choose: Array<IChooseItem>; // 选项列表
  vocal: string; // 语音 文件地址（相对或绝对）
  bgm: string; // 背景音乐 文件地址（相对或绝对）
  miniAvatar: string; // 小头像 文件地址（相对或绝对）
  GameVar: IGameVar; // 游戏内变量
  effects: Array<IEffect>; // 应用的变换
  bgTransform: string;
  bgFilter: string;
  PerformList: Array<IRunPerform>; // 要启动的演出列表
  currentDialogKey: string; // 当前对话的key
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
