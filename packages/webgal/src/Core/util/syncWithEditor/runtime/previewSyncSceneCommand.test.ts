import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { IScene } from '@/Core/controller/scene/sceneInterface';
import type { SyncScenePayload } from '../../../../types/editorPreviewProtocol';

interface ActiveModuleState {
  webgalStore: {
    dispatch: ReturnType<typeof vi.fn>;
  };
  WebGAL: Record<string, any>;
  setVisibility: ReturnType<typeof vi.fn>;
  resetStage: ReturnType<typeof vi.fn>;
  sceneFetcher: ReturnType<typeof vi.fn>;
  forward: ReturnType<typeof vi.fn>;
  commitForward: ReturnType<typeof vi.fn>;
  sceneParser: ReturnType<typeof vi.fn>;
  loggerWarn: ReturnType<typeof vi.fn>;
  loggerInfo: ReturnType<typeof vi.fn>;
  loggerError: ReturnType<typeof vi.fn>;
  assetSetter: ReturnType<typeof vi.fn>;
}

let activeModuleState: ActiveModuleState | null = null;

function getActiveModuleState(): ActiveModuleState {
  if (activeModuleState === null) {
    throw new Error('Expected active module state to be initialized before importing previewSyncSceneCommand.');
  }

  return activeModuleState;
}

vi.doMock('@/store/store', () => ({
  get webgalStore() {
    return getActiveModuleState().webgalStore;
  },
}));

vi.doMock('@/store/GUIReducer', () => ({
  get setVisibility() {
    return getActiveModuleState().setVisibility;
  },
}));

vi.doMock('@/Core/WebGAL', () => ({
  get WebGAL() {
    return getActiveModuleState().WebGAL;
  },
}));

vi.doMock('@/Core/controller/stage/resetStage', () => ({
  get resetStage() {
    return getActiveModuleState().resetStage;
  },
}));

vi.doMock('@/Core/controller/scene/sceneFetcher', () => ({
  get sceneFetcher() {
    return getActiveModuleState().sceneFetcher;
  },
}));

vi.doMock('@/Core/controller/gamePlay/nextSentence', () => ({
  get forward() {
    return getActiveModuleState().forward;
  },
  get commitForward() {
    return getActiveModuleState().commitForward;
  },
}));

vi.doMock('@/Core/parser/sceneParser', () => ({
  get sceneParser() {
    return getActiveModuleState().sceneParser;
  },
}));

vi.doMock('@/Core/util/logger', () => ({
  get logger() {
    return {
      warn: getActiveModuleState().loggerWarn,
      info: getActiveModuleState().loggerInfo,
      error: getActiveModuleState().loggerError,
    };
  },
}));

vi.doMock('@/Core/util/gameAssetsAccess/assetSetter', () => ({
  get assetSetter() {
    return getActiveModuleState().assetSetter;
  },
  fileType: {
    scene: 'scene',
  },
}));

async function flushMicrotasks() {
  for (let i = 0; i < 10; i += 1) {
    await Promise.resolve();
  }
}

interface HarnessOptions {
  targetSceneName?: string;
  targetSentenceList?: IScene['sentenceList'];
  initialSentenceId?: number;
}

async function setupPreviewSyncSceneCommandHarness(options: HarnessOptions = {}) {
  vi.resetModules();
  vi.stubGlobal('document', {
    querySelector: vi.fn(() => null),
  });

  const targetSceneName = options.targetSceneName ?? 'scene/branch.txt';
  const sentenceList: IScene['sentenceList'] = options.targetSentenceList ?? [
    {
      command: 0,
      commandRaw: 'say:first',
      content: 'first',
      args: [],
      sentenceAssets: [],
      subScene: [],
      inlineComment: '',
    },
    {
      command: 0,
      commandRaw: 'say:new-second',
      content: 'new-second',
      args: [],
      sentenceAssets: [],
      subScene: [],
      inlineComment: '',
    },
  ];
  const previousScene: IScene = {
    sceneName: 'scene/original.txt',
    sceneUrl: 'asset://scene/original.txt',
    sentenceList: [],
    assetsList: [],
    subSceneList: [],
  };
  const parsedScene: IScene = {
    sceneName: targetSceneName,
    sceneUrl: `asset://${targetSceneName}`,
    sentenceList,
    assetsList: [],
    subSceneList: [],
  };

  const dispatch = vi.fn();
  const resetStage = vi.fn();
  const commitForward = vi.fn();
  const sceneFetcher = vi.fn(async () => '; new scene');
  const sceneParser = vi.fn(() => parsedScene);
  const assetSetter = vi.fn((name: string) => `asset://${name}`);

  const WebGAL: Record<string, any> = {
    sceneManager: {
      sceneData: {
        currentScene: previousScene,
        currentSentenceId: options.initialSentenceId ?? 0,
        sceneStack: [] as unknown[],
      },
      sceneWritePromise: null as Promise<void> | null,
    },
    gameplay: {
      isFast: false,
      isFastPreview: false,
      performController: {
        hasPendingBlockingStateCalculationPerform: vi.fn(() => false),
      },
    },
  };

  const forward = vi.fn(() => {
    WebGAL.sceneManager.sceneData.currentSentenceId += 1;
    return true;
  });

  activeModuleState = {
    webgalStore: { dispatch },
    WebGAL,
    setVisibility: vi.fn((payload: unknown) => ({ type: 'gui/setVisibility', payload })),
    resetStage,
    sceneFetcher,
    forward,
    commitForward,
    sceneParser,
    loggerWarn: vi.fn(),
    loggerInfo: vi.fn(),
    loggerError: vi.fn(),
    assetSetter,
  };

  const module = await import('./previewSyncSceneCommand');

  return {
    dispatch,
    WebGAL,
    resetStage,
    sceneFetcher,
    sceneParser,
    forward,
    commitForward,
    executePreviewSyncSceneCommand: module.executePreviewSyncSceneCommand,
  };
}

describe('executePreviewSyncSceneCommand', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    activeModuleState = null;
  });

  it('fetches the target scene, resets the stage, and forwards toward the target sentence', async () => {
    const harness = await setupPreviewSyncSceneCommandHarness();
    const payload: SyncScenePayload = {
      sceneName: 'scene/branch.txt',
      sentenceId: 2,
    };

    harness.executePreviewSyncSceneCommand(payload);
    await flushMicrotasks();

    expect(harness.sceneFetcher).toHaveBeenCalledWith('asset://scene/branch.txt');
    expect(harness.sceneParser).toHaveBeenCalledWith('; new scene', 'scene/branch.txt', 'asset://scene/branch.txt');
    expect(harness.resetStage).toHaveBeenCalledWith(true);
    expect(harness.forward).toHaveBeenCalled();
    expect(harness.commitForward).toHaveBeenCalled();
    expect(harness.WebGAL.sceneManager.sceneData.currentScene).toMatchObject({
      sceneName: 'scene/branch.txt',
    });
    expect(harness.WebGAL.sceneManager.sceneData.currentSentenceId).toBe(2);
    expect(harness.WebGAL.gameplay.isFast).toBe(false);
    expect(harness.WebGAL.gameplay.isFastPreview).toBe(false);
  });

  it('stops forwarding once a perform requires user input', async () => {
    const harness = await setupPreviewSyncSceneCommandHarness({ initialSentenceId: 0 });
    harness.WebGAL.gameplay.performController.hasPendingBlockingStateCalculationPerform = vi
      .fn()
      .mockReturnValueOnce(false)
      .mockReturnValue(true);

    harness.executePreviewSyncSceneCommand({
      sceneName: 'scene/branch.txt',
      sentenceId: 100,
    });
    await flushMicrotasks();

    expect(harness.forward).toHaveBeenCalledTimes(2);
    expect(harness.commitForward).toHaveBeenCalled();
  });
});
