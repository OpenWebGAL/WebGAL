import {runtime_currentSceneData} from "../../../../../Core/runtime/sceneData";
import {commandType} from "../../../../../Core/interface/coreInterface/sceneInterface";
import {eventSender} from "../../../../../Core/controller/eventBus/eventSender";

export const jmp = (labelName:string) =>{
    // 在当前场景中找到指定的标签。
    const currentLine = runtime_currentSceneData.currentSentenceId;
    let result = currentLine;
    runtime_currentSceneData.currentScene.sentenceList.forEach((sentence,index)=>{
        if(sentence.command === commandType.label&&sentence.content === labelName&&index >= currentLine){
            result = index;
        }
    });
    runtime_currentSceneData.currentSentenceId = result;
    eventSender('nextSentence_target',0,0);
};
