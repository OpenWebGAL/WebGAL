/**
 * window.webgalTest 的类型声明（vitest 端）
 *
 * 通过 page.evaluate 访问时，只能传递可序列化数据。
 * 但在 evaluate 回调内部可以直接调用这些方法。
 */

// ─── Pixi 相关 ───

interface PixiContainer {
  x: number;
  y: number;
  scale: { x: number; y: number };
  rotation: number;
  alpha: number;
  visible: boolean;
  zIndex: number;
  width: number;
  height: number;
  children: unknown[];
}

interface StageObject {
  uuid: string;
  key: string;
  pixiContainer: PixiContainer | null;
  sourceUrl: string;
  sourceExt: string;
  sourceType: 'img' | 'live2d' | 'spine' | 'gif' | 'video' | 'stage';
  spineAnimation?: string;
  isExiting?: boolean;
}

interface PixiStageInstance {
  currentApp: {
    stage: unknown;
    renderer: { view: HTMLCanvasElement };
    ticker: unknown;
    view: HTMLCanvasElement;
  } | null;
  mainStageContainer: PixiContainer;
  foregroundEffectsContainer: PixiContainer;
  backgroundEffectsContainer: PixiContainer;
  figureContainer: PixiContainer;
  backgroundContainer: PixiContainer;
  figureObjects: StageObject[];
  backgroundObjects: StageObject[];
  mainStageObject: StageObject;
  stageWidth: number;
  stageHeight: number;
  frameDuration: number;
  addBg(key: string, url: string): void;
  addFigure(key: string, url: string, presetPosition?: string): void;
  addLive2dFigure(key: string, jsonPath: string, pos: string): void;
  addSpineFigure(key: string, url: string, presetPosition: string): void;
  registerAnimation(animationObject: unknown, key: string, target?: string): void;
  removeAnimation(key: string): void;
  removeAllAnimations(): void;
  getAllStageObj(): StageObject[];
  getFigureObjects(): StageObject[];
  getStageObjByKey(key: string): StageObject | undefined;
  removeStageObjectByKey(key: string): void;
}

// ─── 演出管理器 ───

interface Perform {
  performName: string;
  duration: number;
  isHoldOn: boolean;
  stopFunction: () => void;
  blockingNext: () => boolean;
  blockingAuto: () => boolean;
  goNextWhenOver?: boolean;
}

interface PerformControllerInstance {
  performList: Perform[];
  arrangeNewPerform(perform: unknown, script: unknown): void;
  unmountPerform(name: string, force?: boolean): void;
  removeAllPerform(): void;
}

// ─── 场景管理器 ───

interface SceneData {
  currentSentenceId: number;
  currentScene: {
    sceneName: string;
    sceneUrl: string;
    sentenceList: unknown[];
    assetsList: unknown[];
    subSceneList: string[];
  };
  sceneStack: Array<{ sceneName: string; sceneUrl: string; continueLine: number }>;
}

interface SceneManagerInstance {
  sceneData: SceneData;
  settledScenes: string[];
  settledAssets: string[];
  lockSceneWrite: boolean;
  resetScene(): void;
}

// ─── Backlog 管理器 ───

interface BacklogManagerInstance {
  isSaveBacklogNext: boolean;
  getBacklog(): unknown[];
  makeBacklogEmpty(): void;
  insertBacklogItem(item: unknown): void;
  saveCurrentStateToBacklog(): void;
  editLastBacklogItemEffect(effects: unknown[]): void;
}

// ─── 动画管理器 ───

interface AnimationManagerInstance {
  addAnimation(animation: unknown): void;
  getAnimations(): Array<{ name: string; effects: unknown[] }>;
}

// ─── 事件系统 ───

interface WebgalEvent {
  on(callback: (message?: unknown) => void, id?: string): void;
  off(callback: (message?: unknown) => void, id?: string): void;
  emit(message?: unknown, id?: string): void;
}

interface EventsInstance {
  textSettle: WebgalEvent;
  userInteractNext: WebgalEvent;
  fullscreenDbClick: WebgalEvent;
  styleUpdate: WebgalEvent;
  afterStyleUpdate: WebgalEvent;
}

// ─── Gameplay ───

interface GameplayInstance {
  isAuto: boolean;
  isFast: boolean;
  pixiStage: PixiStageInstance | null;
  performController: PerformControllerInstance;
  autoInterval: unknown;
  fastInterval: unknown;
  autoTimeout: unknown;
  resetGamePlay(): void;
}

// ─── Live2D ───

interface Live2DInstance {
  isAvailable: boolean;
  Live2DModel: unknown;
  legacyExpressionBlendMode: boolean;
}

// ─── Redux Store ───

interface WebGALStore {
  getState(): {
    stage: Record<string, unknown>;
    GUI: Record<string, unknown>;
    userData: Record<string, unknown>;
    saveData: Record<string, unknown>;
  };
  dispatch(action: unknown): unknown;
  subscribe(listener: () => void): () => void;
}

// ─── 核心实例 ───

interface WebGALCoreInstance {
  sceneManager: SceneManagerInstance;
  backlogManager: BacklogManagerInstance;
  animationManager: AnimationManagerInstance;
  gameplay: GameplayInstance;
  gameName: string;
  gameKey: string;
  events: EventsInstance;
  steam: unknown;
  template: unknown;
  styleObjects: Map<string, unknown>;
}

// ─── 完整 API ───

interface WebGALTestAPI {
  // 核心实例
  core: WebGALCoreInstance;
  live2d: Live2DInstance;
  store: WebGALStore;

  // Pixi 舞台（直接引用）
  readonly pixiStage: PixiStageInstance | null;
  readonly pixiApp: {
    stage: unknown;
    renderer: { view: HTMLCanvasElement };
    ticker: unknown;
    view: HTMLCanvasElement;
  } | null;

  // 子模块快捷访问
  readonly sceneManager: SceneManagerInstance;
  readonly backlogManager: BacklogManagerInstance;
  readonly animationManager: AnimationManagerInstance;
  readonly performController: PerformControllerInstance;
  readonly gameplay: GameplayInstance;
  readonly events: EventsInstance;

  // 控制器
  controllers: {
    nextSentence(): void;
    scriptExecutor(): void;
    switchAuto(): void;
    stopAuto(): void;
    switchFast(): void;
    stopFast(): void;
    stopAll(): void;
    startGame(): void;
    continueGame(): Promise<void>;

    saveGame(index: number): void;
    loadGame(index: number): void;
    loadGameFromStageData(stageData: unknown): void;
    jumpFromBacklog(index: number, refetchScene?: boolean): void;
    generateCurrentStageData(index: number, isSavePreviewImage?: boolean): unknown;

    resetStage(resetBacklog?: boolean, resetSceneAndVar?: boolean): void;
    playBgm(url: string, enter?: number, volume?: number): void;

    changeScene(sceneUrl: string, sceneName: string): void;
    callScene(sceneUrl: string, sceneName: string): void;
    restoreScene(entry: unknown): void;
  };

  // 场景解析 & 注入
  sceneTools: {
    sceneParser(rawScene: string, sceneName: string, sceneUrl: string): unknown;
    sceneFetcher(sceneUrl: string): Promise<string>;
    webgalParser: unknown;
    injectScene(rawSceneText: string, sceneName?: string): void;
    injectSceneAndRun(rawSceneText: string, sceneName?: string): void;
    injectParsedScene(sentenceList: unknown[], sceneName?: string): void;
  };

  // Redux dispatch helpers
  dispatch: {
    setStage(key: string, value: unknown): void;
    resetStageState(state: unknown): void;
    setVisibility(component: string, visibility: boolean): void;
    raw(action: unknown): void;
  };

  // 配置
  config: {
    SYSTEM_CONFIG: { backlog_size: number; fast_timeout: number };
    PERFORM_CONFIG: { textInitialDelay: number };
  };

  // 状态快照
  takeSnapshot(): {
    stageState: Record<string, unknown>;
    guiState: Record<string, unknown>;
    userData: Record<string, unknown>;
    sceneState: {
      currentSentenceId: number;
      sceneName: string;
      sceneUrl: string;
      sentenceCount: number;
      sceneStackLength: number;
      sceneStack: Array<{ sceneName: string; sceneUrl: string; continueLine: number }>;
    };
    backlog: unknown[];
    backlogLength: number;
    performs: Array<{
      performName: string;
      duration: number;
      isHoldOn: boolean;
      blockingNext: boolean;
      blockingAuto: boolean;
      goNextWhenOver: boolean;
    }>;
    performListLength: number;
    pixiState: {
      figureObjects: Array<{
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
      }>;
      backgroundObjects: Array<{
        uuid: string;
        key: string;
        sourceUrl: string;
        sourceType: string;
        isExiting: boolean;
      }>;
      stageWidth: number;
      stageHeight: number;
    } | null;
    gameplayState: {
      isAuto: boolean;
      isFast: boolean;
    };
    animations: Array<{ name: string; frameCount: number }>;
    timestamp: number;
  };

  // 工具
  utils: {
    cloneDeep<T>(value: T): T;
  };
}

interface Window {
  webgalTest?: WebGALTestAPI;
  __PIXI_APP__?: unknown;
  PIXIapp?: unknown;
}
