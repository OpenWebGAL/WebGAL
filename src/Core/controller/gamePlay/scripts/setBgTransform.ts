import {ISentence} from '@/Core/interface/coreInterface/sceneInterface';
import {IPerform} from '@/Core/interface/coreInterface/performInterface';
import {IEffect} from "@/Core/interface/stateInterface/stageInterface";
import {webgalStore} from "@/Core/store/store";
import _ from 'lodash';
import {setStage} from "@/Core/store/stageReducer";

/**
 * 设置背景变换
 * @param sentence
 */
export const setBgTransform = (sentence: ISentence): IPerform => {
    const stageState = webgalStore.getState().stage;
    const effectList: Array<IEffect> = stageState.effects;
    const newEffectList = _.cloneDeep(effectList);
    let isTargetSet = false;
    newEffectList.forEach((e) => {
        if (e.target === 'MainStage_bg_MainContainer') {
            isTargetSet = true;
            e.transform = sentence.content;
        }
    });
    if (!isTargetSet) {
        newEffectList.push({
            target: 'MainStage_bg_MainContainer',
            transform: sentence.content,
            filter: ''
        });
    }
    webgalStore.dispatch(setStage({key: 'effects', value: newEffectList}));
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
