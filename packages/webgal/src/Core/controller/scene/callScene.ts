import { sceneFetcher } from './sceneFetcher';
import { sceneParser } from '../../parser/sceneParser';
import { logger } from '../../util/logger';
import { continueSentence } from '@/Core/controller/gamePlay/nextSentence';
import { clearPrefetchLinks } from '@/Core/util/prefetcher/assetsPrefetcher';
import type { IStageCommitOptions } from '@/Core/Modules/stage/stageStateManager';

import { WebGAL } from '@/Core/WebGAL';

/**
 * 调用场景
 * @param sceneUrl 场景路径
 * @param sceneName 场景名称
 */
export const callScene = (sceneUrl: string, sceneName: string, commitOptions: IStageCommitOptions = {}) => {
  if (WebGAL.sceneManager.lockSceneWrite) {
    return;
  }
  WebGAL.sceneManager.lockSceneWrite = true;
  const isFastPreviewSceneWrite = WebGAL.gameplay.isFastPreview;
  let shouldAutoNext = false;
  // 先将本场景压入场景栈
  WebGAL.sceneManager.sceneData.sceneStack.push({
    sceneName: WebGAL.sceneManager.sceneData.currentScene.sceneName,
    sceneUrl: WebGAL.sceneManager.sceneData.currentScene.sceneUrl,
    continueLine: WebGAL.sceneManager.sceneData.currentSentenceId,
  });
  // 场景写入到运行时
  const sceneWritePromise = sceneFetcher(sceneUrl)
    .then((rawScene) => {
      WebGAL.sceneManager.sceneData.currentScene = sceneParser(rawScene, sceneName, sceneUrl);
      WebGAL.sceneManager.sceneData.currentSentenceId = 0;
      clearPrefetchLinks();
      WebGAL.sceneManager.settledScenes.add(sceneUrl); // 放入已加载场景列表，避免递归加载相同场景
      logger.debug('现在调用场景，调用结果：', WebGAL.sceneManager.sceneData);
      shouldAutoNext = !isFastPreviewSceneWrite;
    })
    .catch((e) => {
      logger.error('场景调用错误', e);
    })
    .finally(() => {
      WebGAL.sceneManager.lockSceneWrite = false;
      if (WebGAL.sceneManager.sceneWritePromise === sceneWritePromise) {
        WebGAL.sceneManager.sceneWritePromise = null;
      }
      if (shouldAutoNext) {
        // 场景写入完成后的第一句推进是内核流程，不应触发用户 next 语义。
        continueSentence(commitOptions);
      }
    });
  WebGAL.sceneManager.sceneWritePromise = sceneWritePromise;
};
