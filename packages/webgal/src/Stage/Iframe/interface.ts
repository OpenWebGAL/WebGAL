import { RootState } from '@/store/store';

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
  closeFrame: () => void;
  complete: (returnValue?: any) => void;
}

export interface ReactiveWatcher {
  source: string | string[] | ((store: RootState) => any);
  callback: (newValue: any, oldValue: any) => void;
  options: { immediate?: boolean };
  oldValue: any;
}
