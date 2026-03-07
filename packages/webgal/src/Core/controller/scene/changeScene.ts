import { sceneFetcher } from './sceneFetcher';
import { sceneParser } from '../../parser/sceneParser';
import { logger } from '../../util/logger';
import { nextSentence } from '@/Core/controller/gamePlay/nextSentence';
import uniqWith from 'lodash/uniqWith';
import { scenePrefetcher } from '@/Core/util/prefetcher/scenePrefetcher';

import { WebGAL } from '@/Core/WebGAL';
import { arg } from './sceneInterface';
import { stageActions } from '@/store/stageReducer';
import { webgalStore } from '@/store/store';

/**
 * 切换场景
 * @param sceneUrl 场景路径
 * @param sceneName 场景名称
 * @param args 场景参数
 */
export const changeScene = (sceneUrl: string, sceneName: string, args: Array<arg>) => {
  if (WebGAL.sceneManager.lockSceneWrite) {
    return;
  }
  WebGAL.sceneManager.lockSceneWrite = true;
  // 场景写入到运行时
  sceneFetcher(sceneUrl)
    .then((rawScene) => {
      WebGAL.sceneManager.sceneData.currentScene = sceneParser(rawScene, sceneName, sceneUrl);
      WebGAL.sceneManager.sceneData.currentSentenceId = 0;
      // 开始场景的预加载
      const subSceneList = WebGAL.sceneManager.sceneData.currentScene.subSceneList;
      WebGAL.sceneManager.settledScenes.push(sceneUrl); // 放入已加载场景列表，避免递归加载相同场景
      const subSceneListUniq = uniqWith(subSceneList); // 去重
      scenePrefetcher(subSceneListUniq);
      logger.debug('现在切换场景，切换后的结果：', WebGAL.sceneManager.sceneData);
      WebGAL.sceneManager.lockSceneWrite = false;
      // 写入场景调用参数
      webgalStore.dispatch(
        stageActions.addSceneArgument({
          url: sceneUrl,
          value: args,
        }),
      );
      nextSentence();
    })
    .catch((e) => {
      logger.error('场景调用错误', e);
      WebGAL.sceneManager.lockSceneWrite = false;
    });
};
