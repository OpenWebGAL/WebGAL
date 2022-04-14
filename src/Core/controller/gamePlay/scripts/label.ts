import { ISentence } from '../../../interface/coreInterface/sceneInterface';
import { IPerform } from '../../../interface/coreInterface/performInterface';

/**
 * 语句执行的模板代码
 * @param sentence
 */
export const label = (sentence: ISentence): IPerform => {
    return {
        performName: 'none',
        duration: 0,
        isOver: false,
        isHoldOn: false,
        stopFunction: () => {},
        blockingNext: () => false,
        blockingAuto: () => true,
        stopTimeout: undefined, // 暂时不用，后面会交给自动清除
    };
};
