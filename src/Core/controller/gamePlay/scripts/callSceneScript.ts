import {ISentence} from "../../../interface/scene";
import {IPerform} from "../../../interface/perform";
import {callScene} from "../../scene/callScene";

export const callSceneScript = (sentence: ISentence): IPerform => {
    const sceneNameArray: Array<string> = sentence.content.split('/');
    const sceneName = sceneNameArray[sceneNameArray.length - 1];
    callScene(sentence.content, sceneName);
    return {
        performName: 'none',
        duration: 0,
        isOver: false,
        isHoldOn: true,
        stopFunction: () => {
        },
        blockingNext: () => false,
        blockingAuto: () => true,
        stopTimeout: undefined,//暂时不用，后面会交给自动清除
    };
}