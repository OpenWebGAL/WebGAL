import {ISentence} from '@/Core/interface/coreInterface/sceneInterface';
import {IPerform} from '@/Core/interface/coreInterface/performInterface';

/**
 * 语句执行的模板代码
 * @param sentence
 */
export const setFigAni = (sentence: ISentence): IPerform => {
    const content = sentence.content;
    sentence.args.forEach(e => {
        if (e.key === 'left' && e.value) {
            const figLeft = document.getElementById('figLeftContainer');
            if(figLeft){
                figLeft.style.animation = content;
            }
        }
        if (e.key === 'center' && e.value) {
            const figCenter = document.getElementById('figCenterContainer');
            if(figCenter){
                figCenter.style.animation = content;
            }
        }
        if (e.key === 'right' && e.value) {
            const figRight = document.getElementById('figRightContainer');
            if(figRight){
                figRight.style.animation = content;
            }
        }
    });
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
