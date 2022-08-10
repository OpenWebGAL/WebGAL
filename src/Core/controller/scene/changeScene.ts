import { RUNTIME_SCENE_DATA } from '../../runtime/sceneData';
import { sceneFetcher } from './sceneFetcher';
import { sceneParser } from '../../parser/sceneParser';
import { logger } from '../../util/etc/logger';
import { nextSentence } from '@/Core/controller/gamePlay/nextSentence';
import { RUNTIME_SETTLED_SCENES } from '@/Core/runtime/etc';
import uniqWith from 'lodash/uniqWith';
import { scenePrefetcher } from '@/Core/util/prefetcher/scenePrefetcher';

/**
 * 切换场景
 * @param sceneUrl 场景路径
 * @param sceneName 场景名称
 */
export const changeScene = (sceneUrl: string, sceneName: string) => {
  // 场景写入到运行时
  sceneFetcher(sceneUrl).then((rawScene) => {
    RUNTIME_SCENE_DATA.currentScene = sceneParser(rawScene, sceneName, sceneUrl);
    RUNTIME_SCENE_DATA.currentSentenceId = 0;
    // 开始场景的预加载
    const subSceneList = RUNTIME_SCENE_DATA.currentScene.subSceneList;
    RUNTIME_SETTLED_SCENES.push(sceneUrl); // 放入已加载场景列表，避免递归加载相同场景
    const subSceneListUniq = uniqWith(subSceneList); // 去重
    scenePrefetcher(subSceneListUniq);
    logger.debug('现在切换场景，切换后的结果：', RUNTIME_SCENE_DATA);
    nextSentence();
  });
};
