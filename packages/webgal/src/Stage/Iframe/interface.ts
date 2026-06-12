export type WebGalAPIEventsKeyNames =
  | 'save' // 保存存档
  | 'load' // 加载存档
  | 'nextSentence'; // 执行下一句;

export interface IWebGALBridge {
  frameId: string;
  flow: {
    next: () => void; // 推进到下一句
    autoOn: () => void; // 开启自动播放
    autoOff: () => void; // 关闭自动播放
    fastSkipOn: () => void; // 开启快进
    fastSkipOff: () => void; // 关闭快进
  };
  variable: {
    get: (key: string) => string | boolean | number | Array<string | boolean | number> | null;
    set: (key: string, value: string | number | boolean, options?: { global?: boolean }) => void;
    onChange: (key: string, callback: (newValue: any) => void) => () => void; // 返回取消订阅函数
  };
  scene: {
    jumpTo(sceneUrl: string, label?: string): void;
  };
  stage: {
    getBackground(): string;
    getFigures(): { left: string; center: string; right: string };
    getCurrentText(): string;
    getCurrentSpeaker(): string;
    getPerformList(): Array<{ id: string; isHoldOn: boolean }>;
    isBlockSentence: () => boolean; // 是否阻塞语句执行
  };
  audio: {
    playBgm(url: string, options?: { volume?: number; fade?: number }): void;
    stopBgm(): void;
    setVolume(type: 'bgm' | 'vocal' | 'effect', volume: number): void;
  };
  iframe: {
    close: () => void; // 关闭自身（等同于 removeIframe -id=xxx）
    resize: (width: number, height: number) => void;
    move: (x: number, y: number) => void;
    getPosition: () => {
      x: number;
      y: number;
      width: number;
      height: number;
    };
    complete: (returnValue?: any) => void; // 通知父页面iframe已完成(仅在 wait=true 时有效)
    openIframe: (key?: string) => void; // 打开已加载的iframe(已打开的不会重复打开)
    closeIframe: (key?: string) => void; // 关闭已加载/本iframe
  };
  event: {
    on: (event: WebGalAPIEventsKeyNames, callback: (data?: any) => void) => void;
    off: (event: WebGalAPIEventsKeyNames, callback: (data?: any) => void) => void;
    postIframeMessage: (key: string, data?: any) => void; // 向指定iframe发送消息
  };
  store: {
    // 持久化数据
    getPersistentData: (key?: string) => any;
    setPersistentData: (key: string, value: any) => void;
    clearPersistentData: (key?: string) => void;
  };
}

export type IWatchers = Record<string, Array<{ callback: (newValue: any) => void }>>;
