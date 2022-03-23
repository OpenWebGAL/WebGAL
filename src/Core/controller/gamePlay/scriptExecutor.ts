import {commandType, ISentence} from "../../interface/scene";
import {runtime_currentBacklog} from "../../runtime/backlog";
import {storeRef} from "../../store/storeRef";
import {runtime_currentSceneData} from "../../runtime/sceneData";
import {runScript} from "./runScript";

/**
 * 语句执行器
 * 执行语句并根据情况立即执行下一句或者加入backlog
 */
export const scriptExecutor = () => {
    //超过总语句数量，则不继续流程
    if (runtime_currentSceneData.currentSentenceId > runtime_currentSceneData.currentScene.sentenceList.length - 1)
        return;
    const currentScript: ISentence = runtime_currentSceneData
        .currentScene
        .sentenceList[runtime_currentSceneData.currentSentenceId];
    //执行语句
    runScript(currentScript);
    let isNext = false;//是否要进行下一句
    currentScript.args.forEach(e => { //判断是否有下一句的参数
        if (e.key === 'next' && e.value) {
            isNext = true;
        }
    })
    const isSaveBacklog = currentScript.command === commandType.say; //是否在本句保存backlog（一般遇到对话保存）
    let currentStageState: any;
    //同步当前舞台数据
    if (storeRef.stageRef) {
        const currentStageStoreRef: any = storeRef.stageRef.current;
        currentStageStoreRef.setStage('SentenceID', runtime_currentSceneData.currentSentenceId);
        currentStageState = currentStageStoreRef.getStageState();
    }
    //执行“下一句”
    if (isNext) {
        runtime_currentSceneData.currentSentenceId++;
        scriptExecutor();
        return;
    }
    //保存 backlog
    if (isSaveBacklog) {
        runtime_currentBacklog.push(currentStageState);
    }
    runtime_currentSceneData.currentSentenceId++;
}