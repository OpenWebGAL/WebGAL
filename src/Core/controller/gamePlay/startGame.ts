import {runtime_currentSceneData} from '../../runtime/sceneData';
import {assetSetter, fileType} from '../../util/assetSetter';
import {sceneFetcher} from '../../util/sceneFetcher';
import {sceneParser} from '../../parser/sceneParser';
import {eventSender} from "@/Core/controller/eventBus/eventSender";
import {resetStage} from "@/Core/util/resetStage";
import {webgalStore} from "@/Core/store/store";
import {setVisibility} from "@/Core/store/GUIReducer";

/**
 * 从头开始游戏
 */
export const startGame = () => {
    resetStage(true);

    // 重新获取初始场景
    const sceneUrl: string = assetSetter('start.txt', fileType.scene);
    // 场景写入到运行时
    sceneFetcher(sceneUrl).then((rawScene) => {
        runtime_currentSceneData.currentScene = sceneParser(rawScene, 'start.txt', sceneUrl);
        // 开始第一条语句
        eventSender('nextSentence_target', 0, 0);
    });
    webgalStore.dispatch(setVisibility({component: "showTitle", visibility: false}));
};
