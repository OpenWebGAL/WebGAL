import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createRequestEnvelope, createResponseEnvelope } from '../../../types/editorPreviewProtocol';

function createMockEventTarget() {
  const listeners = new Map<string, Set<(event: { type: string }) => void>>();

  return {
    addEventListener: vi.fn((type: string, listener: (event: { type: string }) => void) => {
      const typedListeners = listeners.get(type) ?? new Set<(event: { type: string }) => void>();
      typedListeners.add(listener);
      listeners.set(type, typedListeners);
    }),
    removeEventListener: vi.fn((type: string, listener: (event: { type: string }) => void) => {
      listeners.get(type)?.delete(listener);
    }),
    dispatchEvent(event: { type: string }) {
      listeners.get(event.type)?.forEach((listener) => listener(event));
      return true;
    },
  };
}

class MockWebSocket {
  public static instances: MockWebSocket[] = [];

  public static reset() {
    MockWebSocket.instances = [];
  }

  public readonly url: string;
  public readonly protocol: string;
  public readyState = 0;
  public onopen: ((event?: unknown) => void) | null = null;
  public onmessage: ((event: { data: unknown }) => void) | null = null;
  public onclose: ((event?: unknown) => void) | null = null;
  public onerror: ((error?: unknown) => void) | null = null;
  public sentMessages: string[] = [];
  public closeCallCount = 0;

  public constructor(url: string, protocol: string) {
    this.url = url;
    this.protocol = protocol;
    MockWebSocket.instances.push(this);
  }

  public send(data: string) {
    this.sentMessages.push(data);
  }

  public close() {
    this.closeCallCount += 1;
    this.readyState = 3;
    this.onclose?.();
  }

  public emitOpen() {
    this.readyState = 1;
    this.onopen?.();
  }

  public emitMessage(data: unknown) {
    this.onmessage?.({ data });
  }

  public emitClose() {
    this.readyState = 3;
    this.onclose?.();
  }
}

interface ActiveModuleState {
  webgalStore: {
    subscribe: ReturnType<typeof vi.fn>;
    dispatch: ReturnType<typeof vi.fn>;
    getState: ReturnType<typeof vi.fn>;
  };
  WebGAL: Record<string, any>;
  setVisibility: ReturnType<typeof vi.fn>;
  setFontOptimization: ReturnType<typeof vi.fn>;
  executePreviewSyncSceneCommand: ReturnType<typeof vi.fn>;
  requestEmbeddedLaunchId: ReturnType<typeof vi.fn>;
  sceneParser: ReturnType<typeof vi.fn>;
  webgalParserParse: ReturnType<typeof vi.fn>;
  runScript: ReturnType<typeof vi.fn>;
  nextSentence: ReturnType<typeof vi.fn>;
  resetStage: ReturnType<typeof vi.fn>;
  updateEffect: ReturnType<typeof vi.fn>;
  loggerInfo: ReturnType<typeof vi.fn>;
  loggerWarn: ReturnType<typeof vi.fn>;
  loggerError: ReturnType<typeof vi.fn>;
}

interface WebSocketRuntimeHarness {
  dispatch: ReturnType<typeof vi.fn>;
  emitStoreUpdate: () => void;
  executePreviewSyncSceneCommand: ReturnType<typeof vi.fn>;
  runScript: ReturnType<typeof vi.fn>;
  socket: MockWebSocket;
  stageState: {
    effects: Array<{
      target: string;
      transform: {
        position: { x: number; y: number };
        scale: { x: number; y: number };
        alpha: number;
        rotation: number;
      };
    }>;
    layers: Array<{ id: string }>;
  };
  updateEffect: ReturnType<typeof vi.fn>;
  webgalParserParse: ReturnType<typeof vi.fn>;
  WebGAL: Record<string, any>;
}

let activeModuleState: ActiveModuleState | null = null;
let activeMockWindow: ReturnType<typeof createMockWindow> | null = null;

function getActiveModuleState(): ActiveModuleState {
  if (activeModuleState === null) {
    throw new Error('Expected active module state to be initialized before importing startPreviewSyncRuntime.');
  }

  return activeModuleState;
}

vi.doMock('@/store/store', () => ({
  get webgalStore() {
    return getActiveModuleState().webgalStore;
  },
}));

vi.doMock('@/Core/WebGAL', () => ({
  get WebGAL() {
    return getActiveModuleState().WebGAL;
  },
}));

vi.doMock('@/store/GUIReducer', () => ({
  get setVisibility() {
    return getActiveModuleState().setVisibility;
  },
  get setFontOptimization() {
    return getActiveModuleState().setFontOptimization;
  },
}));

vi.doMock('@/store/guiInterface', () => ({}));
vi.doMock('@/Core/parser/sceneParser', () => ({
  get sceneParser() {
    return getActiveModuleState().sceneParser;
  },
  WebgalParser: {
    get parse() {
      return getActiveModuleState().webgalParserParse;
    },
  },
}));
vi.doMock('@/Core/controller/gamePlay/runScript', () => ({
  get runScript() {
    return getActiveModuleState().runScript;
  },
}));
vi.doMock('@/Core/controller/gamePlay/nextSentence', () => ({
  get nextSentence() {
    return getActiveModuleState().nextSentence;
  },
}));
vi.doMock('@/Core/controller/stage/resetStage', () => ({
  get resetStage() {
    return getActiveModuleState().resetStage;
  },
}));
vi.doMock('@/Core/util/logger', () => ({
  get logger() {
    return {
      info: getActiveModuleState().loggerInfo,
      warn: getActiveModuleState().loggerWarn,
      error: getActiveModuleState().loggerError,
    };
  },
}));
vi.doMock('./runtime/previewSyncSceneCommand', () => ({
  get executePreviewSyncSceneCommand() {
    return getActiveModuleState().executePreviewSyncSceneCommand;
  },
}));
vi.doMock('@/store/stageReducer', () => ({
  stageActions: {
    get updateEffect() {
      return getActiveModuleState().updateEffect;
    },
  },
}));
vi.doMock('@/store/stageInterface', () => ({
  baseTransform: {
    position: { x: 0, y: 0 },
    scale: { x: 1, y: 1 },
    alpha: 1,
    rotation: 0,
  },
}));
vi.doMock('./runtime/embeddedPreviewBootstrap', () => ({
  get requestEmbeddedLaunchId() {
    return getActiveModuleState().requestEmbeddedLaunchId;
  },
}));

function createMockWindow() {
  const target = createMockEventTarget();
  return {
    ...target,
    location: {
      protocol: 'http:',
      hostname: '127.0.0.1',
      port: '3000',
    },
  };
}

function createMockDocument() {
  const target = createMockEventTarget();
  return {
    ...target,
    visibilityState: 'visible' as 'visible' | 'hidden',
    querySelector: vi.fn(() => null),
  };
}

async function flushMicrotasks() {
  await Promise.resolve();
  await Promise.resolve();
}

async function setupWebSocketRuntimeHarness(): Promise<WebSocketRuntimeHarness> {
  vi.resetModules();
  MockWebSocket.reset();
  const mockWindow = createMockWindow();
  activeMockWindow = mockWindow;
  const mockDocument = createMockDocument();

  const subscribeListeners = new Set<() => void>();
  const dispatch = vi.fn();
  const stageState = {
    effects: [] as WebSocketRuntimeHarness['stageState']['effects'],
    layers: [{ id: 'layer-1' }],
  };
  const webgalStore = {
    subscribe: vi.fn((listener: () => void) => {
      subscribeListeners.add(listener);
      return () => {
        subscribeListeners.delete(listener);
      };
    }),
    dispatch,
    getState: vi.fn(() => ({
      stage: stageState,
    })),
  };

  const WebGAL = {
    gameKey: 'game-key-1',
    sceneManager: {
      sceneData: {
        currentScene: {
          sceneName: 'scene/start.txt',
        },
        currentSentenceId: 7,
      },
    },
    events: {
      styleUpdate: {
        emit: vi.fn(),
      },
    },
    gameplay: {
      pixiStage: {
        removeAnimationByTargetKey: vi.fn(),
      },
    },
  };

  const executePreviewSyncSceneCommand = vi.fn();
  const requestEmbeddedLaunchId = vi.fn(async () => 'embedded-launch-1');
  const sceneParser = vi.fn();
  const webgalParserParse = vi.fn((snippet: string, sceneName: string, sceneUrl: string) => ({
    sceneName,
    sceneUrl,
    sceneContent: snippet,
    sentenceList: [{ id: 'sentence-1' }, { id: 'sentence-2' }],
  }));
  const runScript = vi.fn();
  const nextSentence = vi.fn();
  const resetStage = vi.fn();
  const updateEffect = vi.fn((payload: unknown) => ({ type: 'stage/updateEffect', payload }));

  activeModuleState = {
    webgalStore,
    WebGAL,
    setVisibility: vi.fn((payload: unknown) => ({ type: 'gui/setVisibility', payload })),
    setFontOptimization: vi.fn((payload: unknown) => ({ type: 'gui/setFontOptimization', payload })),
    executePreviewSyncSceneCommand,
    requestEmbeddedLaunchId,
    sceneParser,
    webgalParserParse,
    runScript,
    nextSentence,
    resetStage,
    updateEffect,
    loggerInfo: vi.fn(),
    loggerWarn: vi.fn(),
    loggerError: vi.fn(),
  };

  vi.stubGlobal('window', mockWindow);
  vi.stubGlobal('document', mockDocument);
  vi.stubGlobal('WebSocket', MockWebSocket as unknown as typeof WebSocket);

  const { startPreviewSyncRuntime } = await import('./previewSyncRuntime');
  startPreviewSyncRuntime();

  const socket = MockWebSocket.instances[0];
  if (!socket) {
    throw new Error('Expected startPreviewSyncRuntime to create a WebSocket instance.');
  }

  return {
    dispatch,
    emitStoreUpdate() {
      subscribeListeners.forEach((listener) => listener());
    },
    executePreviewSyncSceneCommand,
    runScript,
    socket,
    stageState,
    updateEffect,
    webgalParserParse,
    WebGAL,
  };
}

function parseSentEnvelope(socket: MockWebSocket, index: number) {
  return JSON.parse(socket.sentMessages[index]);
}

async function openPreviewSyncConnection(harness: WebSocketRuntimeHarness) {
  harness.socket.emitOpen();
  await flushMicrotasks();

  return parseSentEnvelope(harness.socket, 0);
}

async function completeRegisterPreviewHandshake(harness: WebSocketRuntimeHarness) {
  const registerRequest = await openPreviewSyncConnection(harness);
  harness.socket.emitMessage(
    JSON.stringify(createResponseEnvelope('session.register-preview', registerRequest.requestId, {})),
  );
  await flushMicrotasks();

  return registerRequest;
}

describe('startPreviewSyncRuntime runtime behavior', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    activeMockWindow?.dispatchEvent({ type: 'pagehide' });
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    activeModuleState = null;
    activeMockWindow = null;
  });

  it('registers preview with canonical payload and publishes ready plus first snapshot after register acceptance', async () => {
    const harness = await setupWebSocketRuntimeHarness();

    const registerRequest = await openPreviewSyncConnection(harness);

    expect(harness.socket.protocol).toBe('webgal-editor-preview-sync.v1');
    expect(registerRequest).toMatchObject({
      kind: 'request',
      type: 'session.register-preview',
      payload: {
        gameId: 'game-key-1',
        embeddedLaunchId: 'embedded-launch-1',
      },
    });

    harness.socket.emitMessage(
      JSON.stringify(createResponseEnvelope('session.register-preview', registerRequest.requestId, {})),
    );
    await flushMicrotasks();

    expect(parseSentEnvelope(harness.socket, 1)).toEqual({
      kind: 'event',
      type: 'preview.ready.updated',
      payload: {
        ready: true,
      },
    });
    expect(parseSentEnvelope(harness.socket, 2)).toEqual({
      kind: 'event',
      type: 'stage.snapshot.updated',
      payload: {
        sceneName: 'scene/start.txt',
        sentenceId: 7,
        stageState: harness.stageState,
      },
    });
  });

  it('waits for the matching register response before publishing snapshots or accepting commands', async () => {
    const harness = await setupWebSocketRuntimeHarness();

    const registerRequest = await openPreviewSyncConnection(harness);

    harness.socket.emitMessage(
      JSON.stringify(createResponseEnvelope('session.register-preview', 'req-other-register', {})),
    );
    harness.emitStoreUpdate();
    harness.socket.emitMessage(
      JSON.stringify(
        createRequestEnvelope('preview.command.sync-scene', 'req-sync-scene', {
          sceneName: 'scene/branch.txt',
          sentenceId: 12,
          syncMode: 'fast',
        }),
      ),
    );
    await flushMicrotasks();

    expect(harness.executePreviewSyncSceneCommand).not.toHaveBeenCalled();
    expect(harness.socket.sentMessages).toHaveLength(1);

    harness.socket.emitMessage(
      JSON.stringify(createResponseEnvelope('session.register-preview', registerRequest.requestId, {})),
    );
    await flushMicrotasks();

    expect(harness.socket.sentMessages).toHaveLength(3);
  });

  it('deduplicates unchanged snapshots and republishes when stage state changes', async () => {
    const harness = await setupWebSocketRuntimeHarness();

    await completeRegisterPreviewHandshake(harness);

    harness.emitStoreUpdate();
    await flushMicrotasks();

    expect(harness.socket.sentMessages).toHaveLength(3);

    harness.stageState.layers = [{ id: 'layer-2' }];
    harness.WebGAL.sceneManager.sceneData.currentSentenceId = 8;
    harness.emitStoreUpdate();
    await flushMicrotasks();

    expect(harness.socket.sentMessages).toHaveLength(4);
    expect(parseSentEnvelope(harness.socket, 3)).toEqual({
      kind: 'event',
      type: 'stage.snapshot.updated',
      payload: {
        sceneName: 'scene/start.txt',
        sentenceId: 8,
        stageState: {
          effects: [],
          layers: [{ id: 'layer-2' }],
        },
      },
    });
  });

  it('skips snapshot serialization when the subscribed store update keeps the same snapshot inputs', async () => {
    const harness = await setupWebSocketRuntimeHarness();
    const stringifySpy = vi.spyOn(JSON, 'stringify');
    const parseSpy = vi.spyOn(JSON, 'parse');

    await completeRegisterPreviewHandshake(harness);
    stringifySpy.mockClear();
    parseSpy.mockClear();

    harness.emitStoreUpdate();
    await flushMicrotasks();

    expect(harness.socket.sentMessages).toHaveLength(3);
    expect(stringifySpy).not.toHaveBeenCalled();
    expect(parseSpy).not.toHaveBeenCalled();
  });

  it('forwards sync-scene requests to the scene sync executor and replies with a success envelope', async () => {
    const harness = await setupWebSocketRuntimeHarness();

    await completeRegisterPreviewHandshake(harness);

    harness.socket.emitMessage(
      JSON.stringify(
        createRequestEnvelope('preview.command.sync-scene', 'req-sync-scene', {
          sceneName: 'scene/branch.txt',
          sentenceId: 12,
          syncMode: 'fast',
        }),
      ),
    );
    await flushMicrotasks();

    expect(harness.executePreviewSyncSceneCommand).toHaveBeenCalledWith({
      sceneName: 'scene/branch.txt',
      sentenceId: 12,
      syncMode: 'fast',
    });
    expect(parseSentEnvelope(harness.socket, 3)).toEqual({
      kind: 'response',
      type: 'preview.command.sync-scene',
      requestId: 'req-sync-scene',
      payload: {},
    });
  });

  it('runs snippets as parsed sentences and replies with a success envelope', async () => {
    const harness = await setupWebSocketRuntimeHarness();

    await completeRegisterPreviewHandshake(harness);

    harness.socket.emitMessage(
      JSON.stringify(
        createRequestEnvelope('preview.command.run-snippet', 'req-run-snippet', {
          snippet: 'say:Hello',
        }),
      ),
    );
    await flushMicrotasks();

    expect(harness.webgalParserParse).toHaveBeenCalledWith('say:Hello', 'temp.txt', 'temp.txt');
    expect(harness.runScript).toHaveBeenCalledTimes(2);
    expect(harness.runScript).toHaveBeenNthCalledWith(1, { id: 'sentence-1' });
    expect(harness.runScript).toHaveBeenNthCalledWith(2, { id: 'sentence-2' });
    expect(parseSentEnvelope(harness.socket, 3)).toEqual({
      kind: 'response',
      type: 'preview.command.run-snippet',
      requestId: 'req-run-snippet',
      payload: {},
    });
  });

  it('applies effect updates as partial transforms and replies with a success envelope', async () => {
    const harness = await setupWebSocketRuntimeHarness();
    harness.stageState.effects = [
      {
        target: 'effect-1',
        transform: {
          position: { x: 1, y: 2 },
          scale: { x: 3, y: 4 },
          alpha: 0.5,
          rotation: 10,
        },
      },
    ];

    await completeRegisterPreviewHandshake(harness);

    harness.socket.emitMessage(
      JSON.stringify(
        createRequestEnvelope('preview.command.set-effect', 'req-set-effect', {
          target: 'effect-1',
          transform: {
            position: { x: 9 },
            scale: { y: 8 },
            alpha: 0.7,
          },
        }),
      ),
    );
    await flushMicrotasks();

    expect(harness.WebGAL.gameplay.pixiStage.removeAnimationByTargetKey).toHaveBeenCalledWith('effect-1');
    expect(harness.updateEffect).toHaveBeenCalledWith({
      target: 'effect-1',
      transform: {
        position: { x: 9, y: 2 },
        scale: { x: 3, y: 8 },
        alpha: 0.7,
        rotation: 10,
      },
    });
    expect(harness.dispatch).toHaveBeenCalledWith({
      type: 'stage/updateEffect',
      payload: {
        target: 'effect-1',
        transform: {
          position: { x: 9, y: 2 },
          scale: { x: 3, y: 8 },
          alpha: 0.7,
          rotation: 10,
        },
      },
    });
    expect(parseSentEnvelope(harness.socket, 3)).toEqual({
      kind: 'response',
      type: 'preview.command.set-effect',
      requestId: 'req-set-effect',
      payload: {},
    });
  });

  it('re-registers with the same identity and re-publishes ready plus snapshot after reconnect', async () => {
    const harness = await setupWebSocketRuntimeHarness();

    await completeRegisterPreviewHandshake(harness);

    harness.socket.emitClose();
    vi.advanceTimersByTime(1000);

    const reconnectSocket = MockWebSocket.instances[1];
    reconnectSocket.emitOpen();
    await flushMicrotasks();

    const reconnectRegisterRequest = JSON.parse(reconnectSocket.sentMessages[0]);
    expect(reconnectRegisterRequest).toMatchObject({
      kind: 'request',
      type: 'session.register-preview',
      payload: {
        gameId: 'game-key-1',
        embeddedLaunchId: 'embedded-launch-1',
      },
    });

    reconnectSocket.emitMessage(
      JSON.stringify(createResponseEnvelope('session.register-preview', reconnectRegisterRequest.requestId, {})),
    );
    await flushMicrotasks();

    expect(parseSentEnvelope(reconnectSocket, 1)).toEqual({
      kind: 'event',
      type: 'preview.ready.updated',
      payload: {
        ready: true,
      },
    });
    expect(parseSentEnvelope(reconnectSocket, 2)).toEqual({
      kind: 'event',
      type: 'stage.snapshot.updated',
      payload: {
        sceneName: 'scene/start.txt',
        sentenceId: 7,
        stageState: {
          effects: [],
          layers: [{ id: 'layer-1' }],
        },
      },
    });
  });
});
