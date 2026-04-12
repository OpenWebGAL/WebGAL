import { IStageState } from '@/store/stageInterface';
import { IUserData } from '@/store/userDataInterface';
import { IGuiState } from '@/store/guiInterface';

/**
 * 演出项快照
 */
export interface IPerformSnapshot {
  performName: string;
  duration: number;
  isHoldOn: boolean;
  blockingNext: boolean;
  blockingAuto: boolean;
  goNextWhenOver: boolean;
}

/**
 * Pixi 舞台对象快照
 */
export interface IStageObjectSnapshot {
  uuid: string;
  key: string;
  sourceUrl: string;
  sourceExt: string;
  sourceType: string;
  isExiting: boolean;
  transform: {
    x: number;
    y: number;
    scaleX: number;
    scaleY: number;
    rotation: number;
    alpha: number;
    visible: boolean;
    zIndex: number;
  } | null;
}

/**
 * 背景对象快照
 */
export interface IBackgroundObjectSnapshot {
  uuid: string;
  key: string;
  sourceUrl: string;
  sourceType: string;
  isExiting: boolean;
}

/**
 * Pixi 舞台状态快照
 */
export interface IPixiStateSnapshot {
  figureObjects: IStageObjectSnapshot[];
  backgroundObjects: IBackgroundObjectSnapshot[];
  stageWidth: number;
  stageHeight: number;
}

/**
 * 游戏完整状态快照（包含视觉、演出、舞台全部状态）
 */
export interface IGameStateSnapshot {
  // Redux 状态
  stageState: IStageState;
  guiState: IGuiState;
  userData: IUserData;

  // 场景状态
  sceneState: {
    currentSentenceId: number;
    sceneName: string;
    sceneUrl: string;
    sentenceCount: number;
    sceneStackLength: number;
    sceneStack: Array<{ sceneName: string; sceneUrl: string; continueLine: number }>;
  };

  // Backlog 完整数据
  backlog: unknown[];
  backlogLength: number;

  // 演出管理器
  performs: IPerformSnapshot[];
  performListLength: number;

  // Pixi 舞台视觉状态
  pixiState: IPixiStateSnapshot | null;

  // 游戏播放状态
  gameplayState: {
    isAuto: boolean;
    isFast: boolean;
  };

  // 用户自定义动画
  animations: Array<{ name: string; frameCount: number }>;

  timestamp: number;
}

/**
 * 暴露到 window 的完整测试 API
 */
export interface IWebGALTestAPI {
  // ═══ 核心实例（完整的内部访问） ═══
  /** WebGAL 核心单例 — 可访问 sceneManager, backlogManager, gameplay, events 等全部子模块 */
  core: typeof import('@/Core/WebGAL').WebGAL;
  /** Live2D 核心单例 */
  live2d: typeof import('@/Core/WebGAL').Live2D;
  /** Redux store — getState(), dispatch(), subscribe() */
  store: typeof import('@/store/store').webgalStore;

  // ═══ Pixi 舞台（直接引用） ═══
  /** PixiStage 实例 — 可操作 figureObjects, backgroundObjects, containers, 动画注册等 */
  readonly pixiStage: any;
  /** PIXI.Application 实例 — 可访问 renderer, stage, ticker, view (canvas) */
  readonly pixiApp: any;

  // ═══ 子模块快捷访问 ═══
  readonly sceneManager: typeof import('@/Core/WebGAL').WebGAL.sceneManager;
  readonly backlogManager: typeof import('@/Core/WebGAL').WebGAL.backlogManager;
  readonly animationManager: typeof import('@/Core/WebGAL').WebGAL.animationManager;
  readonly performController: typeof import('@/Core/WebGAL').WebGAL.gameplay.performController;
  readonly gameplay: typeof import('@/Core/WebGAL').WebGAL.gameplay;
  readonly events: typeof import('@/Core/WebGAL').WebGAL.events;

  // ═══ 控制器函数 ═══
  controllers: {
    // 游戏流程
    nextSentence: typeof import('@/Core/controller/gamePlay/nextSentence').nextSentence;
    scriptExecutor: typeof import('@/Core/controller/gamePlay/scriptExecutor').scriptExecutor;
    switchAuto: typeof import('@/Core/controller/gamePlay/autoPlay').switchAuto;
    stopAuto: typeof import('@/Core/controller/gamePlay/autoPlay').stopAuto;
    switchFast: typeof import('@/Core/controller/gamePlay/fastSkip').switchFast;
    stopFast: typeof import('@/Core/controller/gamePlay/fastSkip').stopFast;
    stopAll: typeof import('@/Core/controller/gamePlay/fastSkip').stopAll;
    startGame: typeof import('@/Core/controller/gamePlay/startContinueGame').startGame;
    continueGame: typeof import('@/Core/controller/gamePlay/startContinueGame').continueGame;

    // 存档/读档
    saveGame: typeof import('@/Core/controller/storage/saveGame').saveGame;
    loadGame: typeof import('@/Core/controller/storage/loadGame').loadGame;
    loadGameFromStageData: typeof import('@/Core/controller/storage/loadGame').loadGameFromStageData;
    jumpFromBacklog: typeof import('@/Core/controller/storage/jumpFromBacklog').jumpFromBacklog;
    generateCurrentStageData: typeof import('@/Core/controller/storage/saveGame').generateCurrentStageData;

    // 舞台
    resetStage: typeof import('@/Core/controller/stage/resetStage').resetStage;
    playBgm: typeof import('@/Core/controller/stage/playBgm').playBgm;

    // 场景
    changeScene: typeof import('@/Core/controller/scene/changeScene').changeScene;
    callScene: typeof import('@/Core/controller/scene/callScene').callScene;
    restoreScene: typeof import('@/Core/controller/scene/restoreScene').restoreScene;
  };

  // ═══ 场景解析 & 注入 ═══
  sceneTools: {
    /** 解析原始脚本文本为 IScene */
    sceneParser: typeof import('@/Core/parser/sceneParser').sceneParser;
    /** HTTP 获取远程场景文本 */
    sceneFetcher: typeof import('@/Core/controller/scene/sceneFetcher').sceneFetcher;
    /** WebGAL Parser 实例 */
    webgalParser: typeof import('@/Core/parser/sceneParser').WebgalParser;
    /** 注入场景（仅设置，不执行） */
    injectScene: (rawSceneText: string, sceneName?: string) => void;
    /** 注入场景并开始执行 */
    injectSceneAndRun: (rawSceneText: string, sceneName?: string) => void;
    /** 注入已解析的 ISentence 数组 */
    injectParsedScene: (sentenceList: unknown[], sceneName?: string) => void;
  };

  // ═══ Redux dispatch helpers ═══
  dispatch: {
    setStage: (key: string, value: unknown) => void;
    resetStageState: (state: unknown) => void;
    setVisibility: (component: string, visibility: boolean) => void;
    /** 直接 dispatch 任意 action */
    raw: (action: unknown) => void;
  };

  // ═══ 配置 ═══
  config: {
    SYSTEM_CONFIG: typeof import('@/config').SYSTEM_CONFIG;
    PERFORM_CONFIG: typeof import('@/config').PERFORM_CONFIG;
  };

  // ═══ 状态快照 ═══
  takeSnapshot: () => IGameStateSnapshot;

  // ═══ 工具 ═══
  utils: {
    cloneDeep: typeof import('lodash/cloneDeep');
  };
}
