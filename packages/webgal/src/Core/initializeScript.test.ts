import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

interface ActiveModuleState {
  logger: {
    info: ReturnType<typeof vi.fn>;
    error: ReturnType<typeof vi.fn>;
  };
  infoFetcher: ReturnType<typeof vi.fn>;
  assetSetter: ReturnType<typeof vi.fn>;
  sceneFetcher: ReturnType<typeof vi.fn>;
  sceneParser: ReturnType<typeof vi.fn>;
  bindExtraFunc: ReturnType<typeof vi.fn>;
  startPreviewSyncRuntime: ReturnType<typeof vi.fn>;
  uniqWith: ReturnType<typeof vi.fn>;
  scenePrefetcher: ReturnType<typeof vi.fn>;
  PixiStage: ReturnType<typeof vi.fn>;
  axiosGet: ReturnType<typeof vi.fn>;
  loadTemplate: ReturnType<typeof vi.fn>;
  WebGAL: Record<string, any>;
}

interface InitializeScriptHarness {
  infoFetcher: ReturnType<typeof vi.fn>;
  startPreviewSyncRuntime: ReturnType<typeof vi.fn>;
  resolveGameConfig: (gameConfig: Record<string, unknown>) => void;
  sceneFetcherResolve: (rawScene: string) => void;
  sceneParser: ReturnType<typeof vi.fn>;
  scenePrefetcher: ReturnType<typeof vi.fn>;
  WebGAL: Record<string, any>;
}

let activeModuleState: ActiveModuleState | null = null;

function getActiveModuleState(): ActiveModuleState {
  if (activeModuleState === null) {
    throw new Error('Expected initializeScript test harness to initialize active module state.');
  }

  return activeModuleState;
}

vi.doMock('./util/logger', () => ({
  get logger() {
    return getActiveModuleState().logger;
  },
}));

vi.doMock('./util/coreInitialFunction/infoFetcher', () => ({
  get infoFetcher() {
    return getActiveModuleState().infoFetcher;
  },
}));

vi.doMock('./util/gameAssetsAccess/assetSetter', () => ({
  get assetSetter() {
    return getActiveModuleState().assetSetter;
  },
  fileType: {
    scene: 'scene',
  },
}));

vi.doMock('./controller/scene/sceneFetcher', () => ({
  get sceneFetcher() {
    return getActiveModuleState().sceneFetcher;
  },
}));

vi.doMock('./parser/sceneParser', () => ({
  get sceneParser() {
    return getActiveModuleState().sceneParser;
  },
}));

vi.doMock('@/Core/util/coreInitialFunction/bindExtraFunc', () => ({
  get bindExtraFunc() {
    return getActiveModuleState().bindExtraFunc;
  },
}));

vi.doMock('@/Core/util/syncWithEditor/previewSyncRuntime', () => ({
  get startPreviewSyncRuntime() {
    return getActiveModuleState().startPreviewSyncRuntime;
  },
}));

vi.doMock('lodash/uniqWith', () => ({
  default: (...args: unknown[]) => getActiveModuleState().uniqWith(...args),
}));

vi.doMock('./util/prefetcher/scenePrefetcher', () => ({
  get scenePrefetcher() {
    return getActiveModuleState().scenePrefetcher;
  },
}));

vi.doMock('@/Core/controller/stage/pixi/PixiController', () => ({
  default: getActiveModuleState().PixiStage,
}));

vi.doMock('axios', () => ({
  default: {
    get: (...args: unknown[]) => getActiveModuleState().axiosGet(...args),
  },
}));

vi.doMock('@/config/info', () => ({
  __INFO: {
    version: 'test-version',
  },
}));

vi.doMock('@/Core/WebGAL', () => ({
  get WebGAL() {
    return getActiveModuleState().WebGAL;
  },
}));

vi.doMock('@/Core/util/coreInitialFunction/templateLoader', () => ({
  get loadTemplate() {
    return getActiveModuleState().loadTemplate;
  },
}));

function createMockDocument() {
  const headElement = {
    appendChild: vi.fn(),
  };

  return {
    createElement: vi.fn(() => ({
      type: '',
      rel: '',
      href: '',
    })),
    getElementsByTagName: vi.fn(() => [headElement]),
  };
}

async function flushMicrotasks() {
  for (let index = 0; index < 5; index += 1) {
    await Promise.resolve();
  }
}

async function setupInitializeScriptHarness(): Promise<InitializeScriptHarness> {
  vi.resetModules();

  const mockDocument = createMockDocument();
  let sceneFetcherResolve!: (rawScene: string) => void;
  const scenePromise = new Promise<string>((resolve) => {
    sceneFetcherResolve = resolve;
  });
  let resolveGameConfig!: (gameConfig: Record<string, unknown>) => void;
  const gameConfigPromise = new Promise<Record<string, unknown>>((resolve) => {
    resolveGameConfig = resolve;
  });
  const parsedScene = {
    sceneName: 'start.txt',
    subSceneList: ['scene/a.txt', 'scene/a.txt', 'scene/b.txt'],
  };

  const infoFetcher = vi.fn(() => gameConfigPromise);
  const assetSetter = vi.fn(() => 'asset://start.txt');
  const sceneFetcher = vi.fn(() => scenePromise);
  const sceneParser = vi.fn(() => parsedScene);
  const bindExtraFunc = vi.fn();
  const startPreviewSyncRuntime = vi.fn();
  const uniqWith = vi.fn((list: string[]) => Array.from(new Set(list)));
  const scenePrefetcher = vi.fn();
  const PixiStage = vi.fn(function MockPixiStage(this: Record<string, unknown>) {
    this.kind = 'pixi-stage';
  });
  const axiosGet = vi.fn(async () => ({
    data: [],
  }));
  const loadTemplate = vi.fn();
  const WebGAL = {
    sceneManager: {
      sceneData: {
        currentScene: null,
      },
      settledScenes: [] as string[],
    },
    gameplay: {
      pixiStage: null,
    },
    animationManager: {
      addAnimation: vi.fn(),
    },
  };

  activeModuleState = {
    logger: {
      info: vi.fn(),
      error: vi.fn(),
    },
    infoFetcher,
    assetSetter,
    sceneFetcher,
    sceneParser,
    bindExtraFunc,
    startPreviewSyncRuntime,
    uniqWith,
    scenePrefetcher,
    PixiStage,
    axiosGet,
    loadTemplate,
    WebGAL,
  };

  vi.stubGlobal('window', {
    __WEBGAL_DEVICE_INFO__: {
      isIOS: false,
    },
    innerWidth: 1920,
    innerHeight: 1080,
  });
  vi.stubGlobal('document', mockDocument);
  vi.stubGlobal('alert', vi.fn());

  const { initializeScript } = await import('./initializeScript');
  initializeScript();

  return {
    infoFetcher,
    startPreviewSyncRuntime,
    resolveGameConfig,
    sceneFetcherResolve,
    sceneParser,
    scenePrefetcher,
    WebGAL,
  };
}

describe('initializeScript preview sync bootstrap wiring', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    activeModuleState = null;
  });

  it('starts preview sync only after config enables it and the initial scene is ready', async () => {
    const harness = await setupInitializeScriptHarness();

    expect(harness.infoFetcher).toHaveBeenCalledWith('./game/config.txt');
    expect(harness.startPreviewSyncRuntime).not.toHaveBeenCalled();

    harness.resolveGameConfig({
      Enable_Editor_Sync: true,
    });
    await flushMicrotasks();

    expect(harness.startPreviewSyncRuntime).not.toHaveBeenCalled();

    harness.sceneFetcherResolve('; start scene');
    await flushMicrotasks();

    expect(harness.sceneParser).toHaveBeenCalledWith('; start scene', 'start.txt', 'asset://start.txt');
    expect(harness.WebGAL.sceneManager.sceneData.currentScene).toEqual({
      sceneName: 'start.txt',
      subSceneList: ['scene/a.txt', 'scene/a.txt', 'scene/b.txt'],
    });
    expect(harness.scenePrefetcher).toHaveBeenCalledWith(['scene/a.txt', 'scene/b.txt']);
    expect(harness.startPreviewSyncRuntime).toHaveBeenCalledTimes(1);
  });

  it('skips preview sync startup when Enable_Editor_Sync is not explicitly enabled', async () => {
    const harness = await setupInitializeScriptHarness();

    harness.resolveGameConfig({
      Enable_Editor_Sync: false,
    });
    harness.sceneFetcherResolve('; start scene');
    await flushMicrotasks();

    expect(harness.startPreviewSyncRuntime).not.toHaveBeenCalled();
  });
});
