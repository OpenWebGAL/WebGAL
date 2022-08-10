import { runtime_currentSceneData } from '../../runtime/sceneData';
import { sceneFetcher } from './sceneFetcher';
import { sceneParser } from '../../parser/sceneParser';
import { logger } from '../../util/etc/logger';
import { nextSentence } from '@/Core/controller/gamePlay/nextSentence';

/**
 * 切换场景
 * @param sceneUrl 场景路径
 * @param sceneName 场景名称
 */
export const changeScene = (sceneUrl: string, sceneName: string) => {
  // 场景写入到运行时
  sceneFetcher(sceneUrl).then((rawScene) => {
    runtime_currentSceneData.currentScene = sceneParser(rawScene, sceneName, sceneUrl);
    runtime_currentSceneData.currentSentenceId = 0;
    logger.debug('现在切换场景，切换后的结果：', runtime_currentSceneData);
    nextSentence();
  });
};
