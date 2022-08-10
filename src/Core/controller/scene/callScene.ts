import { RUNTIME_SCENE_DATA } from '../../runtime/sceneData';
import { sceneFetcher } from './sceneFetcher';
import { sceneParser } from '../../parser/sceneParser';
import { logger } from '../../util/etc/logger';
import { nextSentence } from '@/Core/controller/gamePlay/nextSentence';

/**
 * 调用场景
 * @param sceneUrl 场景路径
 * @param sceneName 场景名称
 */
export const callScene = (sceneUrl: string, sceneName: string) => {
  // 先将本场景压入场景栈
  RUNTIME_SCENE_DATA.sceneStack.push({
    sceneName: RUNTIME_SCENE_DATA.currentScene.sceneName,
    sceneUrl: RUNTIME_SCENE_DATA.currentScene.sceneUrl,
    continueLine: RUNTIME_SCENE_DATA.currentSentenceId,
  });
  // 场景写入到运行时
  sceneFetcher(sceneUrl).then((rawScene) => {
    RUNTIME_SCENE_DATA.currentScene = sceneParser(rawScene, sceneName, sceneUrl);
    RUNTIME_SCENE_DATA.currentSentenceId = 0;
    logger.debug('现在调用场景，调用结果：', RUNTIME_SCENE_DATA);
    nextSentence();
  });
};
