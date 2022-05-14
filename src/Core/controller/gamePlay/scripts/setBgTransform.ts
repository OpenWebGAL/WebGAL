import {ISentence} from '@/Core/interface/coreInterface/sceneInterface';
import {IPerform} from '@/Core/interface/coreInterface/performInterface';
import {IEffect} from "@/Core/interface/stateInterface/stageInterface";
import {webgalStore} from "@/Core/store/store";

/**
 * 设置背景变换
 * @param sentence
 */
export const setBgTransform = (sentence: ISentence): IPerform => {
    const stageState = webgalStore.getState().stage;
    const effectList: Array<IEffect> = stageState.effects;
    let isTargetSet = false;
    effectList.forEach((e) => {
        if (e.target === 'MainStage_bg_MainContainer') {
            isTargetSet = true;
            e.transform = sentence.content;
        }
    });
    if (!isTargetSet) {
        effectList.push({
            target: 'MainStage_bg_MainContainer',
            transform: sentence.content,
            filter: ''
        });
    }
    // stageStore.setStage('effects', effectList);
    // stageStore.setStage('bgTransform',sentence.content);
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
