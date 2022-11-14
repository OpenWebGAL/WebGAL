import { sceneEntry } from '@/Core/runtime/runtimeInterface';
import { RUNTIME_SCENE_DATA } from '../../runtime/sceneData';
import { sceneFetcher } from './sceneFetcher';
import { sceneParser } from '../../parser/sceneParser';
import { logger } from '../../util/etc/logger';
import { nextSentence } from '@/Core/controller/gamePlay/nextSentence';

/**
 * 恢复场景
 * @param entry 场景入口
 */
export const restoreScene = (entry: sceneEntry) => {
  // 场景写入到运行时
  sceneFetcher(entry.sceneUrl).then((rawScene) => {
    RUNTIME_SCENE_DATA.currentScene = sceneParser(rawScene, entry.sceneName, entry.sceneUrl);
    RUNTIME_SCENE_DATA.currentSentenceId = entry.continueLine + 1; // 重设场景
    logger.debug('现在恢复场景，恢复后场景：', RUNTIME_SCENE_DATA.currentScene);
    nextSentence();
  });
};
