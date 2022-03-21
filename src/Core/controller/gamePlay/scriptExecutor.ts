import {commandType, ISentence} from "../../interface/scene";
import {runtime_currentBacklog} from "../../runtime/backlog";
import {storeRef} from "../../store/storeRef";
import {runtime_currentSceneData} from "../../runtime/sceneData";

/**
 * 语句执行器
 * 执行语句并根据情况立即执行下一句或者加入backlog
 */
export const scriptExecutor = () => {
    const currentScript: ISentence = runtime_currentSceneData
        .currentScene
        .sentenceList[runtime_currentSceneData.currentSentenceId];
    let isNext = false;//是否要进行下一句
    currentScript.args.forEach(e => {
        if (e.key === 'next' && e.value) {
            isNext = true;
        }
    })
    const isSaveBacklog = currentScript.command === commandType.say; //是否在本句保存backlog（一般遇到对话保存）
    let currentStageState: any;
    if (storeRef.stageRef) {
        const currentStageStoreRef: any = storeRef.stageRef.current;
        currentStageStoreRef.setStage('SentenceID', runtime_currentSceneData.currentSentenceId);
        currentStageState = currentStageStoreRef.getStageState();
    }
    if (isNext) {
        runtime_currentSceneData.currentSentenceId++;
        scriptExecutor();
        return;
    }
    if (isSaveBacklog) {
        runtime_currentBacklog.push(currentStageState);
    }
    runtime_currentSceneData.currentSentenceId++;
}