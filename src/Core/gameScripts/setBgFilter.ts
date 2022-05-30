import {ISentence} from '@/interface/coreInterface/sceneInterface';
import {IPerform} from '@/interface/coreInterface/performInterface';
import {IEffect} from "@/interface/stateInterface/stageInterface";
import { logger } from '@/Core/util/etc/logger';
import {webgalStore} from "@/Core/store/store";
import {setStage} from "@/Core/store/stageReducer";
import  cloneDeep  from 'lodash/cloneDeep';

/**
 * 设置背景效果
 * @param sentence
 */
export const setBgFilter = (sentence: ISentence): IPerform => {
  const stageState = webgalStore.getState().stage;
  const effectList: Array<IEffect> =stageState.effects;
  const newEffectList = cloneDeep(effectList);
  let isTargetSet = false;
  newEffectList.forEach((e) => {
    if (e.target === 'MainStage_bg_MainContainer') {
      logger.warn('已存在效果，正在修改');
      isTargetSet = true;
      e.filter = sentence.content;
    }
  });
  if (!isTargetSet) {
    newEffectList.push({
      target: 'MainStage_bg_MainContainer',
      transform: '',
      filter: sentence.content
    });
  }
  webgalStore.dispatch(setStage({key: 'effects', value: newEffectList}));
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
