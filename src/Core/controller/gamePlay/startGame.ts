import {runtime_currentSceneData} from '../../runtime/sceneData';
import {getRef} from '../../store/storeRef';
import {assetSetter, fileType} from '../../util/assetSetter';
import {sceneFetcher} from '../../util/sceneFetcher';
import {sceneParser} from '../../parser/sceneParser';
import {eventSender} from "@/Core/controller/eventBus/eventSender";
import {resetStage} from "@/Core/util/resetStage";

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
    getRef('GuiRef')!.current!.setVisibility('showTitle', false);
};
