import {IScene} from "../../interface/scene";
import {runtime_currentSceneData} from "../../runtime/sceneData";
import {nextSentence} from "../gamePlay/nextSentence";
import {eventSender} from "../eventBus/eventSender";
import {sceneFetcher} from "../../util/sceneFetcher";
import {sceneParser} from "../../parser/sceneParser";

export const changeScene = (sceneUrl: string, sceneName: string) => {
    runtime_currentSceneData.currentSentenceId = 0;//重设场景
    //场景写入到运行时
    sceneFetcher(sceneUrl).then(rawScene => {
        runtime_currentSceneData.currentScene = sceneParser(rawScene, sceneName, sceneUrl);
        eventSender('nextSentence_target', 0, 0);//通过事件来发送下一句指令，防止拿到过期状态
    })
}