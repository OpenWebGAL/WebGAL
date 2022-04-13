import {ISentence} from '../../../interface/coreInterface/sceneInterface';
import {IPerform} from '../../../interface/coreInterface/performInterface';
import {getRef} from "../../../../Core/store/storeRef";

/**
 * 语句执行的模板代码
 * @param sentence
 */
export const miniAvatar = (sentence: ISentence): IPerform => {
    getRef('stageRef').setStage('miniAvatar', sentence.content);
    return {
        performName: 'none',
        duration: 0,
        isOver: false,
        isHoldOn: true,
        stopFunction: () => {
        },
        blockingNext: () => false,
        blockingAuto: () => true,
        stopTimeout: undefined, // 暂时不用，后面会交给自动清除
    };
};
