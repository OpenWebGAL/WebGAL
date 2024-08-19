import { sceneFetcher } from './sceneFetcher';
import { sceneParser } from '../../parser/sceneParser';
import { logger } from '../../util/logger';
import { nextSentence } from '@/Core/controller/gamePlay/nextSentence';
import { ISceneEntry } from '@/Core/Modules/scene';

import { WebGAL } from '@/Core/WebGAL';

/**
 * 恢复场景
 * @param entry 场景入口
 */
export const restoreScene = (entry: ISceneEntry) => {
  if (WebGAL.sceneManager.lockSceneWrite) {
    return;
  }
  WebGAL.sceneManager.lockSceneWrite = true;
  // 场景写入到运行时
  sceneFetcher(entry.sceneUrl)
    .then((rawScene) => {
      WebGAL.sceneManager.sceneData.currentScene = sceneParser(rawScene, entry.sceneName, entry.sceneUrl);
      WebGAL.sceneManager.sceneData.currentSentenceId = entry.continueLine + 1; // 重设场景
      logger.debug('现在恢复场景，恢复后场景：', WebGAL.sceneManager.sceneData.currentScene);
      WebGAL.sceneManager.lockSceneWrite = false;
      nextSentence();
    })
    .catch((e) => {
      logger.error('场景调用错误', e);
      WebGAL.sceneManager.lockSceneWrite = false;
    });
};
