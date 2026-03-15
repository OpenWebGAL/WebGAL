import { RootState } from '@/store/store';

export type WebGalAPIEventsKeyNames =
  | 'sentence' // 语句执行
  | 'save' // 保存存档
  | 'load'; // 加载存档

export interface WebGalAPI {
  // 获取响应式状态的方法
  getReactiveStore: (
    source: string | string[] | ((store: RootState) => any),
    callback: (newValue: any, oldValue: any) => void,
    options?: { immediate?: boolean },
  ) => () => void;
  // 获取特定状态的方法
  getStageState: () => RootState['stage'];
  getGUIState: () => RootState['GUI'];
  getUserData: () => RootState['userData'];
  getSaveData: () => RootState['saveData'];
  // 操作
  getGameVar: (key: string) => any;
  getGlobalGameVar: (key: string) => any;
  setGameVar: (key: string, value: any) => void;
  setGlobalGameVar: (key: string, value: any) => void;
  closeIframe: () => void;
  nextSentence: () => void;
  isBlockSentence: () => boolean;
  complete: (returnValue?: any) => void;
  // 事件
  on: (event: WebGalAPIEventsKeyNames, callback: (data?: any) => void) => void;
  off: (event: WebGalAPIEventsKeyNames, callback: (data?: any) => void) => void;
  // 持久化数据
  getPersistentData: (key?: string) => any;
  setPersistentData: (key: string, value: any) => void;
  clearPersistentData: (key?: string) => void;
}

export interface ReactiveWatcher {
  source: string | string[] | ((store: RootState) => any);
  callback: (newValue: any, oldValue: any) => void;
  options: { immediate?: boolean };
  oldValue: any;
}
