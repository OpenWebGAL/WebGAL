import {sceneEntry} from "../../interface/runtime";
import {runtime_currentSceneData} from "../../runtime/sceneData";
import {sceneFetcher} from "../../util/sceneFetcher";
import {sceneParser} from "../../parser/sceneParser";
import {eventSender} from "../eventBus/eventSender";
import {logger} from "../../util/logger";

export const restoreScene = (entry: sceneEntry) => {
    logger.debug('正在准备恢复场景', entry);
    //场景写入到运行时
    sceneFetcher(entry.sceneUrl).then(rawScene => {
        runtime_currentSceneData.currentScene = sceneParser(rawScene, entry.sceneName, entry.sceneUrl);
        runtime_currentSceneData.currentSentenceId = entry.continueLine + 1;//重设场景
        logger.debug('恢复的场景', runtime_currentSceneData.currentScene)
        eventSender('nextSentence_target', 0, 0);//通过事件来发送下一句指令，防止拿到过期状态
    })
}