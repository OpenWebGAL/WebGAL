import { IStageState } from './stageInterface';
import { language } from '@/config/language';
import { IBacklogItem } from '@/Core/Modules/backlog';
import { ISceneEntry } from '@/Core/Modules/scene';

/**
 * 播放速度的枚举类型
 */
export enum playSpeed {
  slow, // 慢
  normal, // 中
  fast, // 快
}

export enum textSize {
  small,
  medium,
  large,
}

export enum textFont {
  song,
  hei,
  lxgw,
}

/**
 * @interface IOptionData 用户设置数据接口
 */
export interface IOptionData {
  volumeMain: number; // 主音量
  textSpeed: playSpeed; // 文字速度
  autoSpeed: playSpeed; // 自动播放速度
  textSize: textSize;
  vocalVolume: number; // 语音音量
  bgmVolume: number; // 背景音乐音量
  seVolume: number; // 音效音量
  uiSeVolume: number; // 用户界面音效音量
  slPage: number; // 存读档界面所在页面
  textboxFont: textFont;
  language: language;
}

/**
 * 场景存档接口
 * @interface ISaveScene
 */
export interface ISaveScene {
  currentSentenceId: number; // 当前语句ID
  sceneStack: Array<ISceneEntry>; // 场景栈
  sceneName: string; // 场景名称
  sceneUrl: string; // 场景url
}

/**
 * @interface ISaveData 存档文件接口
 */
export interface ISaveData {
  nowStageState: IStageState;
  backlog: Array<IBacklogItem>; // 舞台数据
  index: number; // 存档的序号
  saveTime: string; // 保存时间
  sceneData: ISaveScene; // 场景数据
  previewImage: string;
}

export interface IAppreciationAsset {
  name: string;
  url: string;
  series: string;
}

export interface IAppreciation {
  bgm: Array<IAppreciationAsset>;
  cg: Array<IAppreciationAsset>;
}

/**
 * @interface IUserData 用户数据接口
 */
export interface IUserData {
  saveData: Array<ISaveData>; // 用户存档数据
  quickSaveData: ISaveData | null;
  optionData: IOptionData; // 用户设置选项数据
  appreciationData: IAppreciation;
}

export interface ISetUserDataPayload {
  key: keyof IUserData;
  value: any;
}

export interface ISetOptionDataPayload {
  key: keyof IOptionData;
  value: any;
}

export interface IUserDataStore {
  userDataState: IUserData;
  setUserData: <K extends keyof IUserData>(key: K, value: any) => void;
  replaceUserData: (newUserData: IUserData) => void;
  setOptionData: <K extends keyof IOptionData>(key: K, value: any) => void;
  setSlPage: (index: number) => void;
}

export type UserDataStore = IUserDataStore;
