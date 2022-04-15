import {ISentence} from '@/Core/interface/coreInterface/sceneInterface';
import {IPerform} from '@/Core/interface/coreInterface/performInterface';

/**
 * 设置立绘动画
 * @param sentence
 */
export const setFigAni = (sentence: ISentence): IPerform => {
    const content = sentence.content;
    sentence.args.forEach(e => {
        if (e.key === 'left' && e.value) {
            const figLeft = document.getElementById('figLeftContainer');
            if(figLeft){
                figLeft.style.animation = 'none';
                setTimeout(()=>{
                    figLeft.style.animation = content;
                },1);
            }
        }
        if (e.key === 'center' && e.value) {
            const figCenter = document.getElementById('figCenterContainer');
            if(figCenter){
                figCenter.style.animation = 'none';
                setTimeout(()=>{
                    figCenter.style.animation = content;
                },1);
            }
        }
        if (e.key === 'right' && e.value) {
            const figRight = document.getElementById('figRightContainer');
            if(figRight){
                figRight.style.animation = 'none';
                setTimeout(()=>{
                    figRight.style.animation = content;
                },1);
            }
        }
    });
    return {
        performName: 'figAni',
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
