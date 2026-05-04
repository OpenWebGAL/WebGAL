import {
  createEventEnvelope,
  createRequestEnvelope,
  createResponseEnvelope,
  EDITOR_PREVIEW_PROTOCOL_V1_SUBPROTOCOL,
  isPreviewRequestEnvelope,
  isProtocolEnvelope,
  PreviewRequestPayloadByType,
  PreviewRequestType,
  PreviewResponsePayloadByType,
  RunSceneContentPayload,
  RunSnippetPayload,
  SetComponentVisibilityPayload,
  SetEffectPayload,
  SetFontOptimizationPayload,
  StageSnapshotUpdatedPayload,
  SyncScenePayload,
  FastPreviewTimeoutPayload,
} from '../../../types/editorPreviewProtocol';
import { webgalStore } from '@/store/store';
import { setFontOptimization, setVisibility } from '@/store/GUIReducer';
import { WebGAL } from '@/Core/WebGAL';
import { sceneParser, WebgalParser } from '@/Core/parser/sceneParser';
import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { runScript } from '@/Core/controller/gamePlay/runScript';
import { nextSentence } from '@/Core/controller/gamePlay/nextSentence';
import { resetStage } from '@/Core/controller/stage/resetStage';
import { logger } from '@/Core/util/logger';
import { stageStateManager } from '@/Core/Modules/stage/stageStateManager';
import { baseTransform } from '@/Core/Modules/stage/stageInterface';
import type { IStageState } from '@/Core/Modules/stage/stageInterface';
import { requestEmbeddedLaunchId } from './runtime/embeddedPreviewBootstrap';
import {
  createPreviewSyncTransport,
  PreviewSyncTransport,
  PreviewSyncTransportSocket,
} from './runtime/previewSyncTransport';
import { executePreviewSyncSceneCommand } from './runtime/previewSyncSceneCommand';

let previewSyncRuntimeStarted = false;
type StageStateSnapshot = IStageState;

interface RegisterPreviewLogContext {
  requestId: string;
  gameId: string | undefined;
  embeddedLaunchId: string | undefined;
}

export const startPreviewSyncRuntime = () => {
  if (previewSyncRuntimeStarted) {
    return;
  }

  const protocol = window.location.protocol;
  if (protocol !== 'http:' && protocol !== 'https:') {
    logger.info('当前环境不支持启动编辑器同步 V1 WebSocket');
    return;
  }

  previewSyncRuntimeStarted = true;

  const loc = window.location.hostname;
  const port = window.location.port;
  const defaultPort = port && port !== '80' && port !== '443' ? `:${port}` : '';
  const wsProtocol = protocol === 'https:' ? 'wss' : 'ws';
  const wsUrl = `${wsProtocol}://${loc}${defaultPort}/api/webgalsync`;

  let disposed = false;
  let registered = false;
  let pendingRegisterRequestId: string | null = null;
  let pendingRegisterContext: RegisterPreviewLogContext | null = null;
  let lastPublishedSceneName: string | null = null;
  let lastPublishedSentenceId: number | null = null;
  let lastPublishedStageState: StageStateSnapshot | null = null;
  const embeddedLaunchIdPromise = requestEmbeddedLaunchId();
  let transport!: PreviewSyncTransport;

  const createRequestId = () =>
    window.crypto?.randomUUID?.() ?? `req-${Date.now()}-${Math.random().toString(16).slice(2)}`;

  const resetRegistrationState = () => {
    registered = false;
    pendingRegisterRequestId = null;
    pendingRegisterContext = null;
    lastPublishedSceneName = null;
    lastPublishedSentenceId = null;
    lastPublishedStageState = null;
  };

  const buildStageStateSnapshot = (stageState: StageStateSnapshot): StageSnapshotUpdatedPayload['stageState'] => {
    return JSON.parse(JSON.stringify(stageState)) as StageSnapshotUpdatedPayload['stageState'];
  };

  const publishReady = () => {
    transport.send(
      createEventEnvelope('preview.ready.updated', {
        ready: true,
      }),
    );
  };

  const publishStageSnapshot = (force: boolean) => {
    if (!registered) {
      return;
    }

    const stageState = stageStateManager.getCalculationStageState();
    const sceneName = WebGAL.sceneManager.sceneData.currentScene.sceneName;
    const sentenceId = WebGAL.sceneManager.sceneData.currentSentenceId;
    const snapshotUnchanged =
      stageState === lastPublishedStageState &&
      sceneName === lastPublishedSceneName &&
      sentenceId === lastPublishedSentenceId;

    if (!force && snapshotUnchanged) {
      return;
    }

    const payload = {
      sceneName,
      sentenceId,
      stageState: buildStageStateSnapshot(stageState),
    };

    const sent = transport.send(createEventEnvelope('stage.snapshot.updated', payload));
    if (sent) {
      lastPublishedSceneName = sceneName;
      lastPublishedSentenceId = sentenceId;
      lastPublishedStageState = stageState;
    }
  };

  const registerPreview = async (socket: PreviewSyncTransportSocket) => {
    const requestId = createRequestId();
    pendingRegisterRequestId = requestId;
    const embeddedLaunchId = await embeddedLaunchIdPromise;
    if (!transport.isActiveSocket(socket) || !transport.isSocketOpen(socket)) {
      return;
    }

    const registerContext: RegisterPreviewLogContext = {
      requestId,
      gameId: WebGAL.gameKey || undefined,
      embeddedLaunchId,
    };
    pendingRegisterContext = registerContext;
    logger.info('发送编辑器同步 V1 注册请求', registerContext);
    transport.send(
      createRequestEnvelope('session.register-preview', requestId, {
        gameId: registerContext.gameId,
        embeddedLaunchId,
      }),
    );
  };

  const emitFastPreviewTimeout = (payload: FastPreviewTimeoutPayload) => {
    if (!registered) {
      return;
    }
    transport.send(createEventEnvelope('preview.event.fast-preview-timeout', payload));
  };

  const handleSyncScene = (payload: SyncScenePayload) => {
    executePreviewSyncSceneCommand(payload, emitFastPreviewTimeout);
  };

  const handleRunSnippet = (payload: RunSnippetPayload) => {
    const scene = WebgalParser.parse(payload.snippet, 'temp.txt', 'temp.txt');
    (scene.sentenceList as unknown as ISentence[]).forEach((sentence) => {
      runScript(sentence);
    });
  };

  const applyComponentVisibility = (payload: SetComponentVisibilityPayload) => {
    (Object.keys(payload) as Array<keyof SetComponentVisibilityPayload>).forEach((component) => {
      const visibility = payload[component];
      if (typeof visibility !== 'boolean') {
        return;
      }

      webgalStore.dispatch(
        setVisibility({
          component,
          visibility,
        }),
      );
    });
  };

  const handleReloadTemplates = () => {
    const title = document.querySelector('.html-body__title-enter') as HTMLElement | null;
    if (title) {
      title.style.display = 'none';
    }
    WebGAL.events.styleUpdate.emit();
  };

  const handleRunSceneContent = (payload: RunSceneContentPayload) => {
    resetStage(true);
    WebGAL.sceneManager.sceneData.currentScene = sceneParser(payload.sceneContent, 'temp', './temp.txt');
    applyComponentVisibility({
      showTitle: false,
      showMenuPanel: false,
      isEnterGame: true,
      showPanicOverlay: false,
    });
    setTimeout(() => {
      nextSentence();
    }, 100);
  };

  const handleSetFontOptimization = (payload: SetFontOptimizationPayload) => {
    webgalStore.dispatch(setFontOptimization(payload.enabled));
  };

  const handleSetComponentVisibility = (payload: SetComponentVisibilityPayload) => {
    applyComponentVisibility(payload);
  };

  const handleSetEffect = (payload: SetEffectPayload) => {
    const targetEffect = stageStateManager
      .getCalculationStageState()
      .effects.find((effect) => effect.target === payload.target);
    const targetTransform = targetEffect?.transform ? targetEffect.transform : baseTransform;
    const newTransform = {
      ...targetTransform,
      ...(payload.transform ?? {}),
      position: {
        ...targetTransform.position,
        ...(payload.transform?.position ?? {}),
      },
      scale: {
        ...targetTransform.scale,
        ...(payload.transform?.scale ?? {}),
      },
    };
    WebGAL.gameplay.pixiStage?.removeAnimationByTargetKey(payload.target);
    stageStateManager.updateEffectAndCommit({
      target: payload.target,
      transform: newTransform,
    });
  };

  const previewRequestHandlers: {
    [K in PreviewRequestType]: (payload: PreviewRequestPayloadByType[K]) => PreviewResponsePayloadByType[K];
  } = {
    'preview.command.sync-scene': (payload: SyncScenePayload) => {
      handleSyncScene(payload);
      return {};
    },
    'preview.command.run-scene-content': (payload: RunSceneContentPayload) => {
      handleRunSceneContent(payload);
      return {};
    },
    'preview.command.run-snippet': (payload: RunSnippetPayload) => {
      handleRunSnippet(payload);
      return {};
    },
    'preview.command.reload-templates': () => {
      handleReloadTemplates();
      return {};
    },
    'preview.command.set-effect': (payload: SetEffectPayload) => {
      handleSetEffect(payload);
      return {};
    },
    'preview.command.set-component-visibility': (payload: SetComponentVisibilityPayload) => {
      handleSetComponentVisibility(payload);
      return {};
    },
    'preview.command.set-font-optimization': (payload: SetFontOptimizationPayload) => {
      handleSetFontOptimization(payload);
      return {};
    },
  };

  const handlePreviewRequest = <TType extends PreviewRequestType>(
    type: TType,
    payload: PreviewRequestPayloadByType[TType],
  ): PreviewResponsePayloadByType[TType] => {
    const handler = previewRequestHandlers[type] as (
      nextPayload: PreviewRequestPayloadByType[TType],
    ) => PreviewResponsePayloadByType[TType];

    return handler(payload);
  };

  transport = createPreviewSyncTransport({
    url: wsUrl,
    subprotocol: EDITOR_PREVIEW_PROTOCOL_V1_SUBPROTOCOL,
    onConnecting: resetRegistrationState,
    onOpen: registerPreview,
    onMessage: (rawData) => {
      try {
        const envelope = JSON.parse(String(rawData)) as unknown;
        if (!isProtocolEnvelope(envelope)) {
          logger.warn('收到无法识别的编辑器同步 V1 消息');
          return;
        }

        if (envelope.kind === 'response' && envelope.type === 'session.register-preview') {
          if (pendingRegisterRequestId === null || envelope.requestId !== pendingRegisterRequestId) {
            return;
          }

          if (pendingRegisterContext) {
            logger.info('编辑器同步 V1 注册完成', pendingRegisterContext);
          }
          pendingRegisterRequestId = null;
          pendingRegisterContext = null;
          registered = true;
          publishReady();
          publishStageSnapshot(true);
          return;
        }

        if (!registered) {
          if (envelope.kind === 'request') {
            logger.warn(`收到注册完成前的编辑器同步 V1 请求：${envelope.type}`);
          }
          return;
        }

        if (!isPreviewRequestEnvelope(envelope)) {
          if (envelope.kind === 'request') {
            logger.warn(`收到未支持的编辑器同步 V1 请求：${envelope.type}`);
          }
          return;
        }

        let responsePayload: PreviewResponsePayloadByType[typeof envelope.type];
        try {
          responsePayload = handlePreviewRequest(envelope.type, envelope.payload);
        } catch (error) {
          logger.error(`执行编辑器同步 V1 命令失败：${envelope.type}`, error);
          return;
        }

        transport.send(createResponseEnvelope(envelope.type, envelope.requestId, responsePayload));
      } catch (error) {
        logger.error('解析编辑器同步 V1 消息失败', error);
      }
    },
    onClose: resetRegistrationState,
    logInfo: (message) => logger.info(message),
    logError: (message, error) => logger.error(message, error),
    logWarn: (message, error) => logger.warn(message, error),
  });

  const storeUnsubscribe = stageStateManager.subscribe(() => {
    publishStageSnapshot(false);
  });

  const ensureConnected = () => {
    if (disposed) {
      return;
    }

    transport.ensureConnected();
  };

  const disposeRuntime = () => {
    if (disposed) {
      return;
    }

    disposed = true;
    storeUnsubscribe();
    transport.dispose();
  };

  window.addEventListener('focus', ensureConnected);
  window.addEventListener('online', ensureConnected);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      ensureConnected();
    }
  });
  window.addEventListener('pagehide', disposeRuntime, { once: true });

  transport.connect();
};
