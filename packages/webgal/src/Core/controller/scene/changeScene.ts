import { sceneFetcher } from './sceneFetcher';
import { sceneParser } from '../../parser/sceneParser';
import { logger } from '../../util/logger';
import { nextSentence } from '@/Core/controller/gamePlay/nextSentence';
import { clearPrefetchLinks } from '@/Core/util/prefetcher/assetsPrefetcher';

import { WebGAL } from '@/Core/WebGAL';
import { evaluateStageExpressionWithoutDot } from '@/Core/util/evalSentenceFn';

/**
 * 切换场景
 * @param sceneUrl 场景路径
 * @param sceneName 场景名称
 * @param args 场景参数
 */
export const changeScene = (sceneUrl: string, sceneName: string, params: Record<string, any> = {}) => {
  if (WebGAL.sceneManager.lockSceneWrite) {
    return;
  }
  WebGAL.sceneManager.lockSceneWrite = true;
  const isFastPreviewSceneWrite = WebGAL.gameplay.isFastPreview;
  let shouldAutoNext = false;
  // 场景写入到运行时
  const sceneWritePromise = sceneFetcher(sceneUrl)
    .then((rawScene) => {
      WebGAL.sceneManager.sceneData.currentScene = sceneParser(rawScene, sceneName, sceneUrl);
      WebGAL.sceneManager.sceneData.currentSentenceId = 0;
      clearPrefetchLinks();
      WebGAL.sceneManager.settledScenes.add(sceneUrl); // 放入已加载场景列表，避免递归加载相同场景
      logger.debug('现在切换场景，切换后的结果：', WebGAL.sceneManager.sceneData);
      shouldAutoNext = !isFastPreviewSceneWrite;
      WebGAL.sceneManager.currentSceneParams = Object.entries(params)
        .map(([key, value]) => ({
          key,
          value: evaluateStageExpressionWithoutDot(value),
        }))
        .reduce((res: Record<string, string>, item: Record<string, string>) => {
          res[item.key] = item.value;
          return res;
        }, {} as Record<string, string>); // 设置新场景参数并立即求值
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
        nextSentence();
      }
    });
  WebGAL.sceneManager.sceneWritePromise = sceneWritePromise;
};
