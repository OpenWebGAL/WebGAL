import { runtime_currentSceneData } from '../../runtime/sceneData'
import { sceneFetcher } from '../../util/sceneFetcher'
import { sceneParser } from '../../parser/sceneParser'
import { eventSender } from '../eventBus/eventSender'
import { logger } from '../../util/logger'

export const callScene = (sceneUrl: string, sceneName: string) => {
    // 先将本场景压入场景栈
    runtime_currentSceneData.sceneStack.push({
        sceneName: runtime_currentSceneData.currentScene.sceneName,
        sceneUrl: runtime_currentSceneData.currentScene.sceneUrl,
        continueLine: runtime_currentSceneData.currentSentenceId,
    })
    // 场景写入到运行时
    sceneFetcher(sceneUrl).then((rawScene) => {
        runtime_currentSceneData.currentScene = sceneParser(rawScene, sceneName, sceneUrl)
        runtime_currentSceneData.currentSentenceId = 0
        logger.debug('切换后的场景', runtime_currentSceneData)
        eventSender('nextSentence_target', 0, 0) // 通过事件来发送下一句指令，防止拿到过期状态
    })
}
