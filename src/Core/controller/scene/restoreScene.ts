import { sceneEntry } from '../../interface/coreInterface/runtimeInterface';
import { runtime_currentSceneData } from '../../runtime/sceneData';
import { sceneFetcher } from '../../util/sceneFetcher';
import { sceneParser } from '../../parser/sceneParser';
import { eventSender } from '../eventBus/eventSender';
import { logger } from '../../util/logger';

/**
 * 恢复场景
 * @param entry 场景入口
 */
export const restoreScene = (entry: sceneEntry) => {
    // 场景写入到运行时
    sceneFetcher(entry.sceneUrl).then((rawScene) => {
        runtime_currentSceneData.currentScene = sceneParser(rawScene, entry.sceneName, entry.sceneUrl);
        runtime_currentSceneData.currentSentenceId = entry.continueLine + 1; // 重设场景
        logger.debug('现在恢复场景，恢复后场景：', runtime_currentSceneData.currentScene);
        eventSender('nextSentence_target', 0, 0); // 通过事件来发送下一句指令，防止拿到过期状态
    });
};
