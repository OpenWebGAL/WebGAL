import { webgalStore } from '@/store/store';
import { setVisibility } from '@/store/GUIReducer';
import { WebGAL } from '@/Core/WebGAL';
import { resetStage } from '@/Core/controller/stage/resetStage';
import { sceneFetcher } from '@/Core/controller/scene/sceneFetcher';
import { commitForward, forward } from '@/Core/controller/gamePlay/nextSentence';
import { sceneParser } from '@/Core/parser/sceneParser';
import { logger } from '@/Core/util/logger';
import { assetSetter, fileType } from '@/Core/util/gameAssetsAccess/assetSetter';
import type { IFastPreviewTimeoutPayload } from '@/types/debugProtocol';

const FAST_PREVIEW_MAX_DURATION_MS = 500;
const FAST_PREVIEW_TIMEOUT_CHECK_INTERVAL = 100;

type FastPreviewTimeoutHandler = (payload: IFastPreviewTimeoutPayload) => void;

export const syncWithOrigine = (
  sceneName: string,
  sentenceId: number,
  onFastPreviewTimeout?: FastPreviewTimeoutHandler,
) => {
  logger.warn('正在跳转到' + sceneName + ':' + sentenceId);
  WebGAL.gameplay.isFastPreview = false;
  const dispatch = webgalStore.dispatch;
  dispatch(setVisibility({ component: 'showTitle', visibility: false }));
  dispatch(setVisibility({ component: 'showMenuPanel', visibility: false }));
  dispatch(setVisibility({ component: 'isEnterGame', visibility: true }));
  dispatch(setVisibility({ component: 'isShowLogo', visibility: false }));
  const title = document.querySelector('.html-body__title-enter') as HTMLElement;
  if (title) {
    title.style.display = 'none';
  }
  // 重新获取场景
  const sceneUrl: string = assetSetter(sceneName, fileType.scene);
  // 场景写入到运行时
  sceneFetcher(sceneUrl)
    .then((rawScene) => {
      resetStage(true);
      WebGAL.sceneManager.sceneData.currentScene = sceneParser(rawScene, sceneName, sceneUrl);
      // 开始快进到指定语句
      const currentSceneName = WebGAL.sceneManager.sceneData.currentScene.sceneName;
      void syncFast(sentenceId, currentSceneName, onFastPreviewTimeout);
    })
    .catch((e) => {
      WebGAL.gameplay.isFast = false;
      WebGAL.gameplay.isFastPreview = false;
      logger.error('实时预览跳转错误', e);
    });
};

export async function syncFast(
  sentenceId: number,
  currentSceneName: string,
  onFastPreviewTimeout?: FastPreviewTimeoutHandler,
) {
  const fastPreviewStartTime = performance.now();
  const baseSceneStackDepth = WebGAL.sceneManager.sceneData.sceneStack.length;
  WebGAL.gameplay.isFast = true;
  WebGAL.gameplay.isFastPreview = true;
  let forwardCount = 0;
  let isTimedOut = false;
  let timeoutElapsedMs = 0;
  let suspendedElapsedMs = 0;

  try {
    while (shouldContinueFastPreview(sentenceId, currentSceneName, baseSceneStackDepth)) {
      const prevSentenceId = WebGAL.sceneManager.sceneData.currentSentenceId;
      const prevSceneName = WebGAL.sceneManager.sceneData.currentScene.sceneName;
      const isForwarded = forward();
      forwardCount++;
      const sceneWriteWaitStart = performance.now();
      const awaitedSceneWrite = await waitForPendingSceneWrite();
      if (awaitedSceneWrite) {
        suspendedElapsedMs += performance.now() - sceneWriteWaitStart;
      }

      if (!isForwarded && !awaitedSceneWrite) {
        break;
      }

      if (forwardCount % FAST_PREVIEW_TIMEOUT_CHECK_INTERVAL === 0) {
        const elapsedMs = performance.now() - fastPreviewStartTime - suspendedElapsedMs;
        if (elapsedMs > FAST_PREVIEW_MAX_DURATION_MS) {
          isTimedOut = true;
          timeoutElapsedMs = Math.round(elapsedMs);
          break;
        }
      }

      if (WebGAL.gameplay.performController.hasPendingBlockingStateCalculationPerform()) {
        logger.warn('实时预览在需要外部输入的语句前停止演算');
        break;
      }

      if (
        WebGAL.sceneManager.sceneData.currentSentenceId === prevSentenceId &&
        WebGAL.sceneManager.sceneData.currentScene.sceneName === prevSceneName &&
        !awaitedSceneWrite
      ) {
        logger.warn('实时预览跳转停止：本次 forward 没有推进语句指针');
        break;
      }

    }
  } finally {
    WebGAL.gameplay.isFast = false;
    WebGAL.gameplay.isFastPreview = false;
  }

  commitForward();
  const forwardedLineCount =
    WebGAL.sceneManager.sceneData.currentScene.sceneName === currentSceneName
      ? Math.min(WebGAL.sceneManager.sceneData.currentSentenceId, sentenceId)
      : sentenceId;
  const fastPreviewElapsedMs = Math.round(performance.now() - fastPreviewStartTime - suspendedElapsedMs);
  if (isTimedOut) {
    const payload: IFastPreviewTimeoutPayload = {
      scene: WebGAL.sceneManager.sceneData.currentScene.sceneName,
      sentence: WebGAL.sceneManager.sceneData.currentSentenceId,
      targetSentence: sentenceId,
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
}

function shouldContinueFastPreview(sentenceId: number, currentSceneName: string, baseSceneStackDepth: number) {
  const sceneData = WebGAL.sceneManager.sceneData;
  if (sceneData.currentScene.sceneName === currentSceneName) {
    return sceneData.currentSentenceId < sentenceId;
  }
  return sceneData.sceneStack.length > baseSceneStackDepth;
}

async function waitForPendingSceneWrite() {
  const sceneWritePromise = WebGAL.sceneManager.sceneWritePromise;
  if (!sceneWritePromise) {
    return false;
  }
  await sceneWritePromise;
  return true;
}
