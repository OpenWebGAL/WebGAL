import {ISentence} from '../../../interface/coreInterface/sceneInterface';
import {IPerform} from '../../../interface/coreInterface/performInterface';
import {jmp} from "../../../../Core/controller/gamePlay/scripts/function/jmp";

/**
 * 跳转到指定标签
 * @param sentence
 */
export const jumpLabel = (sentence: ISentence): IPerform => {
    jmp(sentence.content);
    return {
        performName: 'none',
        duration: 0,
        isOver: false,
        isHoldOn: false,
        stopFunction: () => {
        },
        blockingNext: () => false,
        blockingAuto: () => true,
        stopTimeout: undefined, // 暂时不用，后面会交给自动清除
    };
};
