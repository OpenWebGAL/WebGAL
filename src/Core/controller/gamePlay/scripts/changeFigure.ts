import {ISentence} from "../../../interface/scene";
import {IPerform} from "../../../interface/perform";
import {getRef} from "../../../store/storeRef";

export const changeFigure = (sentence: ISentence): IPerform => {
    //根据参数设置指定位置
    let pos = 'center';
    let content = sentence.content;
    for (const e of sentence.args) {
        if (e.key === 'left' && e.value === true) {
            pos = 'left';
        }
        if (e.key === 'right' && e.value === true) {
            pos = 'right';
        }
        if (e.key === 'clear' && e.value === true) {
            content = '';
        }
        if (content === 'none') {
            content = '';
        }
    }
    const stageStrore = getRef('stageRef');
    switch (pos) {
        case 'center':
            stageStrore.setStage('figName', content);
            break;
        case 'left':
            stageStrore.setStage('figNameLeft', content);
            break;
        case 'right':
            stageStrore.setStage('figNameRight', content);
            break;
    }
    return {
        performName: 'none',
        duration: 0,
        isOver: false,
        isHoldOn: false,
        stopFunction: () => {
        },
        blockingNext: () => false,
        blockingAuto: () => false,
        stopTimeout: undefined,//暂时不用，后面会交给自动清除
    };
}