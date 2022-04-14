import { runtime_currentSceneData } from '../../runtime/sceneData';
import { eventSender } from '../eventBus/eventSender';
import { sceneFetcher } from '../../util/sceneFetcher';
import { sceneParser } from '../../parser/sceneParser';
import { logger } from '../../util/logger';

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
        eventSender('nextSentence_target', 0, 0); // 通过事件来发送下一句指令，防止拿到过期状态
    });
};
