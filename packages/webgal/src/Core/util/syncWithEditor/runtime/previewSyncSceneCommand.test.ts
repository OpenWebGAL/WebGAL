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
  jumpFromBacklog: ReturnType<typeof vi.fn>;
  nextSentence: ReturnType<typeof vi.fn>;
  sceneParser: ReturnType<typeof vi.fn>;
  loggerWarn: ReturnType<typeof vi.fn>;
  assetSetter: ReturnType<typeof vi.fn>;
}

interface PreviewSyncSceneCommandHarness {
  dispatch: ReturnType<typeof vi.fn>;
  WebGAL: Record<string, any>;
  resetStage: ReturnType<typeof vi.fn>;
  jumpFromBacklog: ReturnType<typeof vi.fn>;
  sceneFetcher: ReturnType<typeof vi.fn>;
  sceneParser: ReturnType<typeof vi.fn>;
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

vi.doMock('@/Core/controller/storage/jumpFromBacklog', () => ({
  get jumpFromBacklog() {
    return getActiveModuleState().jumpFromBacklog;
  },
}));

vi.doMock('@/Core/controller/gamePlay/nextSentence', () => ({
  get nextSentence() {
    return getActiveModuleState().nextSentence;
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
  await Promise.resolve();
  await Promise.resolve();
}

async function setupPreviewSyncSceneCommandHarness() {
  vi.resetModules();
  vi.stubGlobal('document', {
    querySelector: vi.fn(() => null),
  });

  const dispatch = vi.fn();
  const resetStage = vi.fn();
  const jumpFromBacklog = vi.fn();
  const nextSentence = vi.fn();
  const previousScene: IScene = {
    sceneName: 'scene/original.txt',
    sceneUrl: 'asset://scene/original.txt',
    sentenceList: [
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
        commandRaw: 'say:old-second',
        content: 'old-second',
        args: [],
        sentenceAssets: [],
        subScene: [],
        inlineComment: '',
      },
    ],
    assetsList: [],
    subSceneList: [],
  };
  const parsedScene: IScene = {
    sceneName: 'scene/branch.txt',
    sceneUrl: 'asset://scene/branch.txt',
    sentenceList: [
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
    ],
    assetsList: [],
    subSceneList: [],
  };
  const sceneFetcher = vi.fn(async () => '; new scene');
  const sceneParser = vi.fn(() => parsedScene);
  const assetSetter = vi.fn(() => 'asset://scene/branch.txt');
  const WebGAL = {
    sceneManager: {
      sceneData: {
        currentScene: previousScene,
        currentSentenceId: 1,
      },
    },
    gameplay: {
      isFast: false,
    },
    backlogManager: {
      getBacklog: vi.fn(() => [
        {
          saveScene: {
            currentSentenceId: 1,
            sceneName: 'scene/branch.txt',
          },
        },
      ]),
    },
  };

  activeModuleState = {
    webgalStore: {
      dispatch,
    },
    WebGAL,
    setVisibility: vi.fn((payload: unknown) => ({ type: 'gui/setVisibility', payload })),
    resetStage,
    sceneFetcher,
    jumpFromBacklog,
    nextSentence,
    sceneParser,
    loggerWarn: vi.fn(),
    assetSetter,
  };

  const module = await import('./previewSyncSceneCommand');

  return {
    dispatch,
    WebGAL,
    resetStage,
    jumpFromBacklog,
    sceneFetcher,
    sceneParser,
    executePreviewSyncSceneCommand: module.executePreviewSyncSceneCommand,
  };
}

describe('executePreviewSyncSceneCommand', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    activeModuleState = null;
  });

  it('compares backlog recovery against the newly parsed scene instead of the current in-memory scene', async () => {
    const harness = await setupPreviewSyncSceneCommandHarness();
    const payload: SyncScenePayload = {
      sceneName: 'scene/branch.txt',
      sentenceId: 2,
      syncMode: 'fast',
    };

    harness.executePreviewSyncSceneCommand(payload);
    await flushMicrotasks();

    expect(harness.sceneFetcher).toHaveBeenCalledWith('asset://scene/branch.txt');
    expect(harness.sceneParser).toHaveBeenCalledWith('; new scene', 'scene/branch.txt', 'asset://scene/branch.txt');
    expect(harness.resetStage).toHaveBeenCalledWith(true);
    expect(harness.jumpFromBacklog).not.toHaveBeenCalled();
    expect(harness.WebGAL.sceneManager.sceneData.currentScene).toMatchObject({
      sceneName: 'scene/branch.txt',
    });
  });

  it('avoids JSON stringification while comparing shared sentences for recovery', async () => {
    const harness = await setupPreviewSyncSceneCommandHarness();
    const stringifySpy = vi.spyOn(JSON, 'stringify');

    harness.executePreviewSyncSceneCommand({
      sceneName: 'scene/branch.txt',
      sentenceId: 2,
      syncMode: 'fast',
    });
    await flushMicrotasks();

    expect(stringifySpy).not.toHaveBeenCalled();
  });
});
