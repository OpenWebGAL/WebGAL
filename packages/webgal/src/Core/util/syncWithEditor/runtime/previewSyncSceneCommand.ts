import { webgalStore } from '@/store/store';
import { setVisibility } from '@/store/GUIReducer';
import { WebGAL } from '@/Core/WebGAL';
import { resetStage } from '@/Core/controller/stage/resetStage';
import { sceneFetcher } from '@/Core/controller/scene/sceneFetcher';
import { commitForward, forward } from '@/Core/controller/gamePlay/nextSentence';
import { stopFast } from '@/Core/controller/gamePlay/fastSkip';
import { sceneParser } from '@/Core/parser/sceneParser';
import { logger } from '@/Core/util/logger';
import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { assetSetter, fileType } from '@/Core/util/gameAssetsAccess/assetSetter';
import type { FastPreviewTimeoutPayload, SyncScenePayload, SyncSceneSettleMode } from '@/types/editorPreviewProtocol';
import { applyPreviewDebugVariables } from './previewDebugVariables';

export const FAST_PREVIEW_MAX_DURATION_MS = 500;
const FAST_PREVIEW_TIMEOUT_CHECK_INTERVAL = 100;

export type FastPreviewTimeoutEmitter = (payload: FastPreviewTimeoutPayload) => void;

export interface FastPreviewResult {
  sceneName: string;
  sentenceId: number;
  isTimedOut: boolean;
  stopReason: FastPreviewStopReason;
}

export type FastPreviewStopReason = 'target-reached' | 'timeout' | 'state-calculation-blocked' | 'no-progress';

export interface PreviewSyncSceneCommandCallbacks {
  onFastPreviewTimeout?: FastPreviewTimeoutEmitter;
  onBeforeTargetScriptExecute?: () => void;
  onSettled?: (result: FastPreviewResult | null) => void;
  isLatest?: () => boolean;
}

interface RunFastPreviewOptions {
  onBeforeTargetScriptExecute?: () => void;
  isLatest?: () => boolean;
}

export function executePreviewSyncSceneCommand(
  { sceneName, sentenceId, debugVariables, settleMode = 'normal' }: SyncScenePayload,
  callbacks: PreviewSyncSceneCommandCallbacks = {},
): void {
  const isLatest = () => callbacks.isLatest?.() ?? true;
  logger.warn('正在跳转到' + sceneName + ':' + sentenceId);
  WebGAL.gameplay.isFastPreview = false;

  const dispatch = webgalStore.dispatch;
  dispatch(setVisibility({ component: 'showTitle', visibility: false }));
  dispatch(setVisibility({ component: 'showMenuPanel', visibility: false }));
  dispatch(setVisibility({ component: 'isEnterGame', visibility: true }));
  dispatch(setVisibility({ component: 'isShowLogo', visibility: false }));

  const title = document.querySelector('.html-body__title-enter') as HTMLElement | null;
  if (title) {
    title.style.display = 'none';
  }

  const sceneUrl = assetSetter(sceneName, fileType.scene);

  sceneFetcher(sceneUrl)
    .then((rawScene) => {
      if (!isLatest()) {
        return;
      }

      resetStage(true, true, { commitStageState: false });
      applyPreviewDebugVariables(debugVariables);
      WebGAL.sceneManager.sceneData.currentScene = sceneParser(rawScene, sceneName, sceneUrl);
      const currentSceneName = WebGAL.sceneManager.sceneData.currentScene.sceneName;
      void runFastPreview(sentenceId, currentSceneName, callbacks.onFastPreviewTimeout, settleMode, {
        onBeforeTargetScriptExecute: callbacks.onBeforeTargetScriptExecute,
        isLatest: callbacks.isLatest,
      })
        .then((result) => {
          if (!isLatest()) {
            return;
          }

          callbacks.onSettled?.(result);
        })
        .catch((error) => {
          if (!isLatest()) {
            return;
          }

          logger.error('实时预览跳转错误', error);
          callbacks.onSettled?.(null);
        });
    })
    .catch((error) => {
      if (!isLatest()) {
        return;
      }

      stopFast();
      WebGAL.gameplay.isFastPreview = false;
      logger.error('实时预览跳转错误', error);
      callbacks.onSettled?.(null);
    });
}

export async function runFastPreview(
  sentenceId: number,
  currentSceneName: string,
  onFastPreviewTimeout?: FastPreviewTimeoutEmitter,
  settleMode: SyncSceneSettleMode = 'normal',
  options: RunFastPreviewOptions = {},
): Promise<FastPreviewResult | null> {
  const isLatest = () => options.isLatest?.() ?? true;
  const targetSentenceId = resolveStopSentenceId(sentenceId);
  const fastPreviewStartTime = performance.now();
  const baseSceneStackDepth = WebGAL.sceneManager.sceneData.sceneStack.length;
  stopFast();
  WebGAL.gameplay.isFastPreview = true;
  let forwardCount = 0;
  let isTimedOut = false;
  let stopReason: FastPreviewStopReason = 'target-reached';
  let timeoutElapsedMs = 0;
  let suspendedElapsedMs = 0;
  let didRunBeforeTargetScriptExecute = false;

  const runBeforeTargetScriptExecute = (sceneName: string, nextSentenceId: number) => {
    if (
      settleMode !== 'immediate' ||
      !options.onBeforeTargetScriptExecute ||
      didRunBeforeTargetScriptExecute ||
      sceneName !== currentSceneName ||
      nextSentenceId !== targetSentenceId - 1
    ) {
      return;
    }

    WebGAL.gameplay.performController.discardUncommittedNonHoldPerforms();
    WebGAL.gameplay.performController.clearNonHoldPerformsFromStageState();
    options.onBeforeTargetScriptExecute?.();
    didRunBeforeTargetScriptExecute = true;
  };

  try {
    while (shouldContinueFastPreview(targetSentenceId, currentSceneName, baseSceneStackDepth)) {
      if (!isLatest()) {
        return null;
      }

      const prevSentenceId = WebGAL.sceneManager.sceneData.currentSentenceId;
      const prevSceneName = WebGAL.sceneManager.sceneData.currentScene.sceneName;
      const isForwarded = forward({
        scriptExecution: {
          beforeSentenceExecute: ({ sceneName, sentenceId }) => {
            // sync-scene 的 sentenceId 是目标语句执行后的停止指针，目标编辑语句是 sentenceId - 1。
            runBeforeTargetScriptExecute(sceneName, sentenceId);
          },
        },
      });
      forwardCount++;
      const postForwardSceneName = WebGAL.sceneManager.sceneData.currentScene.sceneName;
      const postForwardSentenceId = WebGAL.sceneManager.sceneData.currentSentenceId;
      const sceneWriteWaitStart = performance.now();
      const awaitedSceneWrite = await waitForPendingSceneWrite();
      if (awaitedSceneWrite) {
        suspendedElapsedMs += performance.now() - sceneWriteWaitStart;
      }
      if (!isLatest()) {
        return null;
      }

      if (!isForwarded && !awaitedSceneWrite) {
        stopReason = 'no-progress';
        break;
      }

      if (forwardCount % FAST_PREVIEW_TIMEOUT_CHECK_INTERVAL === 0) {
        const elapsedMs = performance.now() - fastPreviewStartTime - suspendedElapsedMs;
        if (elapsedMs > FAST_PREVIEW_MAX_DURATION_MS) {
          isTimedOut = true;
          stopReason = 'timeout';
          timeoutElapsedMs = Math.round(elapsedMs);
          break;
        }
      }

      if (WebGAL.gameplay.performController.hasPendingBlockingStateCalculationPerform()) {
        logger.warn('实时预览在需要外部输入的语句前停止演算');
        stopReason = 'state-calculation-blocked';
        break;
      }

      if (postForwardSentenceId === prevSentenceId && postForwardSceneName === prevSceneName && !awaitedSceneWrite) {
        logger.warn('实时预览跳转停止：本次 forward 没有推进语句指针');
        stopReason = 'no-progress';
        break;
      }
    }
  } finally {
    if (isLatest()) {
      WebGAL.gameplay.isFastPreview = false;
    }
  }

  if (settleMode === 'immediate') {
    WebGAL.gameplay.performController.discardUncommittedNonHoldPerforms();
    WebGAL.gameplay.performController.clearNonHoldPerformsFromStageState();
  }

  if (!isLatest()) {
    return null;
  }

  commitForward();

  const forwardedLineCount =
    WebGAL.sceneManager.sceneData.currentScene.sceneName === currentSceneName
      ? Math.min(WebGAL.sceneManager.sceneData.currentSentenceId, targetSentenceId)
      : targetSentenceId;
  const fastPreviewElapsedMs = Math.round(performance.now() - fastPreviewStartTime - suspendedElapsedMs);

  if (isTimedOut) {
    const payload: FastPreviewTimeoutPayload = {
      sceneName: WebGAL.sceneManager.sceneData.currentScene.sceneName,
      sentenceId: WebGAL.sceneManager.sceneData.currentSentenceId,
      targetSentenceId,
      forwardedLineCount,
      elapsedMs: Math.max(timeoutElapsedMs, fastPreviewElapsedMs),
      maxDurationMs: FAST_PREVIEW_MAX_DURATION_MS,
    };
    logger.warn(
      `实时预览快进停止：超过最大耗时 ${FAST_PREVIEW_MAX_DURATION_MS}ms，已快进 ${forwardedLineCount} 行，用时 ${payload.elapsedMs}ms`,
    );
    onFastPreviewTimeout?.(payload);
  }

  logger.info(`实时预览快进完成：快进 ${forwardedLineCount} 行，用时 ${fastPreviewElapsedMs}ms`);
  return {
    sceneName: WebGAL.sceneManager.sceneData.currentScene.sceneName,
    sentenceId: WebGAL.sceneManager.sceneData.currentSentenceId,
    isTimedOut,
    stopReason,
  };
}

/**
 * 把停止指针从多行语句的续行占位上回退到该语句首行之后。
 *
 * 续行占位是带 -next 的注释，一次 forward 会沿着 -next 一路穿过它们，
 * 顺带把下一条真实语句也执行掉。而编辑器不论把指针落在续行的哪一行，
 * 想要的都是「执行完这条多行语句就停下」，即停在它首行之后。
 */
function resolveStopSentenceId(sentenceId: number): number {
  const sentenceList: ISentence[] = WebGAL.sceneManager.sceneData.currentScene.sentenceList;
  let stopSentenceId = sentenceId;
  while (stopSentenceId > 0 && sentenceList[stopSentenceId - 1]?.isLineBreakHolder) {
    stopSentenceId--;
  }

  return stopSentenceId;
}

function shouldContinueFastPreview(sentenceId: number, currentSceneName: string, baseSceneStackDepth: number): boolean {
  const sceneData = WebGAL.sceneManager.sceneData;
  if (sceneData.currentScene.sceneName === currentSceneName) {
    return sceneData.currentSentenceId < sentenceId;
  }
  return sceneData.sceneStack.length > baseSceneStackDepth;
}

async function waitForPendingSceneWrite(): Promise<boolean> {
  const sceneWritePromise = WebGAL.sceneManager.sceneWritePromise;
  if (!sceneWritePromise) {
    return false;
  }
  await sceneWritePromise;
  return true;
}
