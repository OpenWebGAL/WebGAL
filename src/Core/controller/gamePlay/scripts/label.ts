import { ISentence } from '@/Core/interface/coreInterface/sceneInterface';
import { IPerform } from '@/Core/interface/coreInterface/performInterface';

/**
 * 标签代码，什么也不做
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
