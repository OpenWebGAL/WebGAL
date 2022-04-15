import {ISentence} from '../../../interface/coreInterface/sceneInterface';
import {IPerform} from '../../../interface/coreInterface/performInterface';
import {getRef} from "../../../../Core/store/storeRef";

/**
 * 显示小头像
 * @param sentence
 */
export const miniAvatar = (sentence: ISentence): IPerform => {
    let content = sentence.content;
    if(sentence.content ==='none'|| sentence.content ===''){
        content = '';
    }
    getRef('stageRef').setStage('miniAvatar', content);
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
