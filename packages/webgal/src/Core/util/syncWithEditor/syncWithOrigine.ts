import { webgalStore } from '@/store/store';
import { setVisibility } from '@/store/GUIReducer';
import { WebGAL } from '@/Core/WebGAL';
import { resetStage } from '@/Core/controller/stage/resetStage';
import { sceneFetcher } from '@/Core/controller/scene/sceneFetcher';
import { commitForward, forward } from '@/Core/controller/gamePlay/nextSentence';
import { sceneParser } from '@/Core/parser/sceneParser';
import { logger } from '@/Core/util/logger';
import { assetSetter, fileType } from '@/Core/util/gameAssetsAccess/assetSetter';

export const syncWithOrigine = (sceneName: string, sentenceId: number) => {
  logger.warn('正在跳转到' + sceneName + ':' + sentenceId);
  WebGAL.gameplay.isFastPreview = false;
  const dispatch = webgalStore.dispatch;
  dispatch(setVisibility({ component: 'showTitle', visibility: false }));
  dispatch(setVisibility({ component: 'showMenuPanel', visibility: false }));
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
      syncFast(sentenceId, currentSceneName);
    })
    .catch((e) => {
      WebGAL.gameplay.isFast = false;
      WebGAL.gameplay.isFastPreview = false;
      logger.error('实时预览跳转错误', e);
    });
};

export function syncFast(sentenceId: number, currentSceneName: string) {
  WebGAL.gameplay.isFast = true;
  WebGAL.gameplay.isFastPreview = true;
  let forwardCount = 0;
  const maxForwardCount = Math.max(sentenceId + 1000, 1000);

  try {
    while (
      WebGAL.sceneManager.sceneData.currentSentenceId < sentenceId &&
      WebGAL.sceneManager.sceneData.currentScene.sceneName === currentSceneName
    ) {
      const prevSentenceId = WebGAL.sceneManager.sceneData.currentSentenceId;
      const prevSceneName = WebGAL.sceneManager.sceneData.currentScene.sceneName;
      const isForwarded = forward();
      forwardCount++;

      if (!isForwarded) {
        break;
      }

      if (WebGAL.gameplay.performController.hasPendingBlockingStateCalculationPerform()) {
        logger.warn('实时预览在需要外部输入的语句前停止演算');
        break;
      }

      if (
        WebGAL.sceneManager.sceneData.currentSentenceId === prevSentenceId &&
        WebGAL.sceneManager.sceneData.currentScene.sceneName === prevSceneName
      ) {
        logger.warn('实时预览跳转停止：本次 forward 没有推进语句指针');
        break;
      }

      if (forwardCount > maxForwardCount) {
        logger.warn('实时预览跳转停止：超过最大演算次数');
        break;
      }
    }
  } finally {
    WebGAL.gameplay.isFast = false;
    WebGAL.gameplay.isFastPreview = false;
  }

  commitForward();
}
