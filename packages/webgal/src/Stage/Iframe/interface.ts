import { RootState } from '@/store/store';

export interface WebGalAPI {
  // 获取响应式状态的方法
  getReactiveStore: (
    source: string | string[] | ((store: RootState) => any),
    callback: (newValue: any, oldValue: any) => void,
    options?: { immediate?: boolean; deep?: boolean },
  ) => () => void;
  // 获取特定状态的方法
  getStageState: () => RootState['stage'];
  getGUIState: () => RootState['GUI'];
  getUserData: () => RootState['userData'];
  getSaveData: () => RootState['saveData'];
  // 获取变量
  getGameVar: (key: string) => any;
  getGlobalGameVar: (key: string) => any;
  // 通知主进程iframe已完成
  complete: (returnValue?: any) => void;
}

export interface ReactiveWatcher {
  source: string | string[] | ((store: RootState) => any);
  callback: (newValue: any, oldValue: any) => void;
  options: { immediate?: boolean; deep?: boolean };
  oldValue: any;
}
