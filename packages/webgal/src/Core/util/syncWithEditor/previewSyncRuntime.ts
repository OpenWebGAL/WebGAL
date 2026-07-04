import {
  createEventEnvelope,
  createRequestEnvelope,
  createRequestErrorEnvelope,
  createResponseEnvelope,
  EDITOR_PREVIEW_PROTOCOL_V1_SUBPROTOCOL,
  isAnyProtocolEnvelope,
  isPreviewQueryType,
  isPreviewRequestEnvelope,
} from '@/types/editorPreviewProtocol';
import type {
  AnyProtocolEnvelope,
  FastPreviewTimeoutPayload,
  PreviewCommandPayloadByType,
  PreviewCommandResponsePayloadByType,
  PreviewCommandType,
  PreviewQueryType,
  PreviewRequestErrorCode,
  PreviewRequestType,
  RequestEnvelopeByType,
  RunSceneContentPayload,
  RunSnippetPayload,
  SetComponentVisibilityPayload,
  SetEffectPayload,
  SetFontOptimizationPayload,
  SetTextReadModePayload,
  StageSnapshotUpdatedPayload,
  SyncScenePayload,
} from '@/types/editorPreviewProtocol';
import { webgalStore } from '@/store/store';
import { setFontOptimization, setVisibility } from '@/store/GUIReducer';
import { WebGAL } from '@/Core/WebGAL';
import { sceneParser, WebgalParser } from '@/Core/parser/sceneParser';
import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { runScript } from '@/Core/controller/gamePlay/runScript';
import { continueSentence } from '@/Core/controller/gamePlay/nextSentence';
import { resetStage } from '@/Core/controller/stage/resetStage';
import { logger } from '@/Core/util/logger';
import { stageStateManager } from '@/Core/Modules/stage/stageStateManager';
import { baseTransform } from '@/Core/Modules/stage/stageInterface';
import type { IStageState, ITransform } from '@/Core/Modules/stage/stageInterface';
import { applyStageEffectToTarget } from '@/Core/controller/stage/pixi/syncPixiStageState';
import { mergeSetEffectPreviewTransform } from './previewSetEffectTransform';
import { requestEmbeddedLaunchId } from './runtime/embeddedPreviewBootstrap';
import {
  createPreviewSyncTransport,
  PreviewSyncTransport,
  PreviewSyncTransportSocket,
} from './runtime/previewSyncTransport';
import { executePreviewSyncSceneCommand } from './runtime/previewSyncSceneCommand';
import { setDebugTextReadMode } from '@/Core/Modules/readHistory';
import { applyPreviewDebugVariables } from './runtime/previewDebugVariables';
import { handleReferenceBoxQuery } from './runtime/handlers/referenceBoxQueryHandler';
import {
  cloneBaseTransform,
  createTargetTransformBaselineManager,
  isTargetTransformBaselineSyncSettled,
} from './runtime/targetTransformBaseline';

let previewSyncRuntimeStarted = false;
type StageStateSnapshot = IStageState;

interface RegisterPreviewLogContext {
  requestId: string;
  gameId: string | undefined;
  embeddedLaunchId: string | undefined;
}

type PreviewRequestEnvelope = RequestEnvelopeByType<PreviewRequestType>;
type PreviewQueryEnvelope = RequestEnvelopeByType<PreviewQueryType>;
type RawRequestEnvelope = {
  kind: 'request';
  type: string;
  requestId: string;
};

const UNSUPPORTED_REQUEST_MESSAGE = '当前预览运行时不支持该请求类型';

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
  const setEffectBaselines = new Map<string, ITransform>();
  const targetTransformBaselines = createTargetTransformBaselineManager();
  const embeddedLaunchIdPromise = requestEmbeddedLaunchId();
  let transport!: PreviewSyncTransport;
  let nextSyncSceneRevision = 0;
  let activeSyncSceneRevision: number | null = null;

  const createRequestId = () => `req-${Date.now()}-${Math.random().toString(16).slice(2)}`;

  const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;

  const isRawRequestEnvelope = (value: unknown): value is RawRequestEnvelope =>
    isRecord(value) &&
    value.kind === 'request' &&
    typeof value.type === 'string' &&
    typeof value.requestId === 'string';

  const sendRequestError = (
    request: Pick<RawRequestEnvelope, 'type' | 'requestId'>,
    code: PreviewRequestErrorCode,
    message?: string,
  ) => {
    transport.send(createRequestErrorEnvelope(request.type, request.requestId, message ? { code, message } : { code }));
  };

  const resetRegistrationState = () => {
    registered = false;
    pendingRegisterRequestId = null;
    pendingRegisterContext = null;
    lastPublishedSceneName = null;
    lastPublishedSentenceId = null;
    lastPublishedStageState = null;
    setEffectBaselines.clear();
    activeSyncSceneRevision = null;
    WebGAL.gameplay.isFastPreview = false;
    targetTransformBaselines.invalidateCurrentRevision();
  };

  const startSyncSceneTransaction = () => {
    nextSyncSceneRevision += 1;
    activeSyncSceneRevision = nextSyncSceneRevision;
    return activeSyncSceneRevision;
  };

  const isActiveSyncSceneRevision = (revision: number) => activeSyncSceneRevision === revision;

  const finishSyncSceneTransaction = (revision: number) => {
    if (!isActiveSyncSceneRevision(revision)) {
      return false;
    }

    activeSyncSceneRevision = null;
    return true;
  };

  const cancelActiveSyncScene = () => {
    activeSyncSceneRevision = null;
    WebGAL.gameplay.isFastPreview = false;
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

  const publishStageSnapshot = (force: boolean, stageState = stageStateManager.getCalculationStageState()) => {
    if (!registered) {
      return;
    }
    if (activeSyncSceneRevision !== null) {
      return;
    }

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

  const publishSettledStageSnapshot = () => {
    publishStageSnapshot(true, stageStateManager.getViewStageState());
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

  const finishRegisterPreview = () => {
    const registeredPreviewContext = pendingRegisterContext;
    if (registeredPreviewContext) {
      logger.info('编辑器同步 V1 注册完成', registeredPreviewContext);
    }

    pendingRegisterRequestId = null;
    pendingRegisterContext = null;
    registered = true;
    publishReady();
    publishStageSnapshot(true);
  };

  const emitFastPreviewTimeout = (payload: FastPreviewTimeoutPayload) => {
    if (!registered) {
      return;
    }
    transport.send(createEventEnvelope('preview.event.fast-preview-timeout', payload));
  };

  const handleSyncScene = (payload: SyncScenePayload) => {
    const syncSceneRevision = startSyncSceneTransaction();
    const isLatestSyncScene = () => isActiveSyncSceneRevision(syncSceneRevision);
    setEffectBaselines.clear();
    const { transformBaselineRevision } = payload;
    if (transformBaselineRevision) {
      targetTransformBaselines.acceptRevision(transformBaselineRevision);
    } else {
      targetTransformBaselines.invalidateCurrentRevision();
    }

    executePreviewSyncSceneCommand(payload, {
      onFastPreviewTimeout: emitFastPreviewTimeout,
      isLatest: isLatestSyncScene,
      onBeforeTargetScriptExecute: () => {
        if (!isLatestSyncScene()) {
          return;
        }
        if (!transformBaselineRevision) {
          return;
        }

        targetTransformBaselines.captureSnapshot(
          transformBaselineRevision,
          stageStateManager.getCalculationStageState(),
        );
      },
      onSettled: (result) => {
        if (!finishSyncSceneTransaction(syncSceneRevision)) {
          return;
        }

        if (result === null) {
          if (transformBaselineRevision) {
            targetTransformBaselines.failRevision(transformBaselineRevision);
          }
          return;
        }

        if (!transformBaselineRevision) {
          publishSettledStageSnapshot();
          return;
        }

        const isSyncSettled = isTargetTransformBaselineSyncSettled(result, payload);
        if (!isSyncSettled || !targetTransformBaselines.publishCapturedSnapshot(transformBaselineRevision)) {
          targetTransformBaselines.failRevision(transformBaselineRevision);
          publishSettledStageSnapshot();
          return;
        }

        setEffectBaselines.clear();
        publishSettledStageSnapshot();
      },
    });
  };

  const handleRunSnippet = (payload: RunSnippetPayload) => {
    cancelActiveSyncScene();
    setEffectBaselines.clear();
    targetTransformBaselines.invalidateCurrentRevision();
    applyPreviewDebugVariables(payload.debugVariables);
    const scene = WebgalParser.parse(payload.snippet, 'temp.txt', 'temp.txt');
    (scene.sentenceList as unknown as ISentence[]).forEach((sentence) => {
      runScript(sentence, { autoFastSave: false });
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
    cancelActiveSyncScene();
    setEffectBaselines.clear();
    targetTransformBaselines.invalidateCurrentRevision();
    resetStage(true, true, { autoFastSave: false });
    applyPreviewDebugVariables(payload.debugVariables);
    WebGAL.sceneManager.sceneData.currentScene = sceneParser(payload.sceneContent, 'temp', './temp.txt');
    applyComponentVisibility({
      showTitle: false,
      showMenuPanel: false,
      isEnterGame: true,
      showPanicOverlay: false,
    });
    setTimeout(() => {
      continueSentence({ autoFastSave: false });
    }, 100);
  };

  const handleSetFontOptimization = (payload: SetFontOptimizationPayload) => {
    webgalStore.dispatch(setFontOptimization(payload.enabled));
  };

  const handleSetComponentVisibility = (payload: SetComponentVisibilityPayload) => {
    applyComponentVisibility(payload);
  };

  const handleSetTextReadMode = (payload: SetTextReadModePayload) => {
    setDebugTextReadMode(payload.isRead, { autoFastSave: false });
  };

  const getSetEffectBaseline = (target: string): ITransform => {
    const cachedBaseline = setEffectBaselines.get(target);
    if (cachedBaseline) {
      return cachedBaseline;
    }

    const baselineOverride = targetTransformBaselines.getReadyTransformBaselineOverride(target);
    const baseline = mergeSetEffectPreviewTransform(baseTransform, baselineOverride);
    setEffectBaselines.set(target, baseline);
    return baseline;
  };

  const handleSetEffect = (payload: SetEffectPayload) => {
    const baseline = getSetEffectBaseline(payload.target);
    const newTransform = mergeSetEffectPreviewTransform(baseline, payload.transform);
    WebGAL.gameplay.pixiStage?.removeAnimationByTargetKey(payload.target);
    if (payload.phase === 'preview') {
      applyStageEffectToTarget(payload.target, newTransform);
      return;
    }

    stageStateManager.updateEffectAndCommit(
      {
        target: payload.target,
        transform: newTransform,
      },
      { autoFastSave: false },
    );
  };

  const previewCommandHandlers: {
    [K in PreviewCommandType]: (payload: PreviewCommandPayloadByType[K]) => PreviewCommandResponsePayloadByType[K];
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
    'preview.command.set-text-read-mode': (payload: SetTextReadModePayload) => {
      handleSetTextReadMode(payload);
      return {};
    },
  };

  const isPreviewQueryEnvelope = (envelope: PreviewRequestEnvelope): envelope is PreviewQueryEnvelope => {
    return isPreviewQueryType(envelope.type);
  };

  const handlePreviewQuery = (envelope: PreviewQueryEnvelope) => {
    switch (envelope.type) {
      case 'preview.query.reference-box':
        void handleReferenceBoxQuery(envelope, WebGAL.gameplay.pixiStage)
          .then((response) => {
            transport.send(response);
          })
          .catch((error) => {
            logger.error(`执行编辑器同步 V1 请求失败：${envelope.type}`, error);
            sendRequestError(envelope, 'internal-error', '预览运行时无法安全完成该请求');
          });
        return;
      case 'preview.query.base-transform':
        transport.send(
          createResponseEnvelope('preview.query.base-transform', envelope.requestId, {
            baseTransform: cloneBaseTransform(),
          }),
        );
        return;
      case 'preview.query.transform-baseline':
        transport.send(
          createResponseEnvelope(
            'preview.query.transform-baseline',
            envelope.requestId,
            targetTransformBaselines.queryTransformBaseline(
              envelope.payload.target,
              envelope.payload.transformBaselineRevision,
            ),
          ),
        );
        return;
    }
  };

  const handlePreviewCommand = <TType extends PreviewCommandType>(
    type: TType,
    payload: PreviewCommandPayloadByType[TType],
  ): PreviewCommandResponsePayloadByType[TType] => {
    const handler = previewCommandHandlers[type] as (
      nextPayload: PreviewCommandPayloadByType[TType],
    ) => PreviewCommandResponsePayloadByType[TType];

    return handler(payload);
  };

  const respondToPreviewRequest = (envelope: PreviewRequestEnvelope) => {
    if (isPreviewQueryEnvelope(envelope)) {
      handlePreviewQuery(envelope);
      return;
    }

    const responsePayload = handlePreviewCommand(envelope.type, envelope.payload);
    transport.send(createResponseEnvelope(envelope.type, envelope.requestId, responsePayload));
  };

  const handleProtocolEnvelope = (envelope: AnyProtocolEnvelope) => {
    if (envelope.kind === 'response' && envelope.type === 'session.register-preview') {
      if (pendingRegisterRequestId !== null && envelope.requestId === pendingRegisterRequestId) {
        finishRegisterPreview();
      }
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
        sendRequestError(envelope, 'unsupported-request-type', UNSUPPORTED_REQUEST_MESSAGE);
      }
      return;
    }

    try {
      respondToPreviewRequest(envelope);
    } catch (error) {
      logger.error(`执行编辑器同步 V1 请求失败：${envelope.type}`, error);
      sendRequestError(envelope, 'internal-error', '预览运行时无法安全完成该请求');
    }
  };

  const handleRawMessage = (rawData: unknown) => {
    try {
      const envelope = JSON.parse(String(rawData)) as unknown;
      if (!isAnyProtocolEnvelope(envelope)) {
        if (isRawRequestEnvelope(envelope)) {
          logger.warn(`收到非法的编辑器同步 V1 请求：${envelope.type}`);
          sendRequestError(envelope, 'bad-request', '请求 envelope 格式不合法');
          return;
        }

        logger.warn('收到无法识别的编辑器同步 V1 消息');
        return;
      }

      handleProtocolEnvelope(envelope);
    } catch (error) {
      logger.error('解析编辑器同步 V1 消息失败', error);
    }
  };

  transport = createPreviewSyncTransport({
    url: wsUrl,
    subprotocol: EDITOR_PREVIEW_PROTOCOL_V1_SUBPROTOCOL,
    onConnecting: resetRegistrationState,
    onOpen: registerPreview,
    onMessage: handleRawMessage,
    onClose: resetRegistrationState,
    logInfo: (message) => logger.info(message),
    logError: (message, error) => logger.error(message, error),
    logWarn: (message, error) => logger.warn(message, error),
  });

  const storeUnsubscribe = stageStateManager.subscribe((stageState) => {
    publishStageSnapshot(false, stageState);
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
