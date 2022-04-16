import {ISentence} from '../../../interface/coreInterface/sceneInterface';
import {IPerform} from '../../../interface/coreInterface/performInterface';
import {getRef} from "@/Core/store/storeRef";
import {IEffect} from "@/Core/interface/stateInterface/stageInterface";
import * as __ from 'lodash';
import { logger } from '@/Core/util/logger';

/**
 * 设置背景效果
 * @param sentence
 */
export const setBgFilter = (sentence: ISentence): IPerform => {
    const stageStore = getRef('stageRef');
    const effectList: Array<IEffect> =stageStore.stageState.effects;
    let isTargetSet = false;
    effectList.forEach((e) => {
        if (e.target === 'MainStage_bg_MainContainer') {
            logger.warn('已存在效果，正在修改');
            isTargetSet = true;
            e.filter = sentence.content;
        }
    });
    if (!isTargetSet) {
        effectList.push({
            target: 'MainStage_bg_MainContainer',
            transform: '',
            filter: sentence.content
        });
    }
    // stageStore.setStage('bgFilter', sentence.content);
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
