import {ISentence} from '@/Core/interface/coreInterface/sceneInterface';
import {IPerform} from '@/Core/interface/coreInterface/performInterface';
import {webgalStore} from "@/Core/store/store";
import {setStage} from "@/Core/store/stageReducer";

/**
 * 显示小头像
 * @param sentence
 */
export const miniAvatar = (sentence: ISentence): IPerform => {
    let content = sentence.content;
    if (sentence.content === 'none' || sentence.content === '') {
        content = '';
    }
    webgalStore.dispatch(setStage({key: 'miniAvatar', value: content}));
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
