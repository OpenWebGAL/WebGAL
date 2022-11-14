import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { IPerform } from '@/Core/controller/perform/performInterface';
import { IEffect } from '@/store/stageInterface';
import { webgalStore } from '@/store/store';
import { setStage } from '@/store/stageReducer';
import cloneDeep from 'lodash/cloneDeep';

/**
 * 设置立绘变换
 * @param sentence
 */
export const setFigTransform = (sentence: ISentence): IPerform => {
  // const stageState = webgalStore.getState().stage;
  // const effectList: Array<IEffect> = stageState.effects;
  // const newEffectList = cloneDeep(effectList);
  // let target = 'figCenterContainer';
  // sentence.args.forEach((e) => {
  //   if (e.key === 'left' && e.value) {
  //     target = 'figLeftContainer';
  //   }
  //   if (e.key === 'right' && e.value) {
  //     target = 'figRightContainer';
  //   }
  // });
  // let isTargetSet = false;
  // newEffectList.forEach((e) => {
  //   if (e.target === target) {
  //     isTargetSet = true;
  //     e.transform = sentence.content;
  //   }
  // });
  // if (!isTargetSet) {
  //   newEffectList.push({
  //     target: target,
  //     transform: sentence.content,
  //     filter: '',
  //   });
  // }
  // webgalStore.dispatch(setStage({ key: 'effects', value: newEffectList }));
  // stageStore.setStage('effects', effectList);
  // stageStore.setStage('bgTransform',sentence.content);
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
