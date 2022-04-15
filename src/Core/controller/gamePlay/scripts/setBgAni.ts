import {ISentence} from '../../../interface/coreInterface/sceneInterface';
import {IPerform} from '../../../interface/coreInterface/performInterface';

/**
 * 设置背景动画
 * @param sentence
 */
export const setBgAni = (sentence: ISentence): IPerform => {
    const content = sentence.content;
    const mainBg = document.getElementById('bgMain');
    if (mainBg) {
        mainBg.style.animation = content;
    }

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
