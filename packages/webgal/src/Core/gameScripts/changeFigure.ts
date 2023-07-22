import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { IPerform } from '@/Core/Modules/perform/performInterface';
import { webgalStore } from '@/store/store';
import { setStage } from '@/store/stageReducer';
import { updateCurrentEffects } from '../controller/stage/pixi/PixiController';
import cloneDeep from 'lodash/cloneDeep';
import { getSentenceArgByKey } from '@/Core/util/getSentenceArg';
import { WebGAL } from '@/main';

/**
 * 更改立绘
 * @param sentence 语句
 */
export const changeFigure = (sentence: ISentence): IPerform => {
  // 根据参数设置指定位置
  let pos: 'center' | 'left' | 'right' = 'center';
  let content = sentence.content;
  let isFreeFigure = false;
  let motion = '';
  let key = '';
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
    if (e.key === 'id') {
      isFreeFigure = true;
      key = e.value.toString();
    }
    if (e.key === 'motion') {
      motion = e.value.toString();
    }
    if (content === 'none') {
      content = '';
    }
  }
  const dispatch = webgalStore.dispatch;

  /**
   * 删掉相关 Effects，因为已经移除了
   */
  const prevEffects = webgalStore.getState().stage.effects;
  const newEffects = cloneDeep(prevEffects);
  const index = newEffects.findIndex((e) => e.target === `fig-${pos}${key}`);
  if (index >= 0) {
    newEffects.splice(index, 1);
  }
  updateCurrentEffects(newEffects);
  if (isFreeFigure) {
    const currentFreeFigures = webgalStore.getState().stage.freeFigure;

    /**
     * 重设
     */
    const index = currentFreeFigures.findIndex((figure) => figure.key === key);
    const newFreeFigure = cloneDeep(currentFreeFigures);
    if (index >= 0) {
      // if (content === '') {
      //   // 移除
      //   newFreeFigure.splice(index, 1);
      // } else {
      newFreeFigure[index].basePosition = pos;
      newFreeFigure[index].name = content;
      // }
    } else {
      // 新加
      if (content !== '') newFreeFigure.push({ key, name: content, basePosition: pos });
    }
    if (getSentenceArgByKey(sentence, 'enter')) {
      WebGAL.animationManager.nextEnterAnimationName.set(key, getSentenceArgByKey(sentence, 'enter')!.toString());
    }
    if (getSentenceArgByKey(sentence, 'exit')) {
      WebGAL.animationManager.nextExitAnimationName.set(
        key + '-off',
        getSentenceArgByKey(sentence, 'exit')!.toString(),
      );
    }
    dispatch(setStage({ key: 'freeFigure', value: newFreeFigure }));
  } else
    switch (pos) {
      case 'center':
        key = 'fig-center';
        if (getSentenceArgByKey(sentence, 'enter')) {
          WebGAL.animationManager.nextEnterAnimationName.set(key, getSentenceArgByKey(sentence, 'enter')!.toString());
        }
        if (getSentenceArgByKey(sentence, 'exit')) {
          WebGAL.animationManager.nextExitAnimationName.set(
            key + '-off',
            getSentenceArgByKey(sentence, 'exit')!.toString(),
          );
        }
        dispatch(setStage({ key: 'figName', value: content }));
        break;
      case 'left':
        key = 'fig-left';
        if (getSentenceArgByKey(sentence, 'enter')) {
          WebGAL.animationManager.nextEnterAnimationName.set(key, getSentenceArgByKey(sentence, 'enter')!.toString());
        }
        if (getSentenceArgByKey(sentence, 'exit')) {
          WebGAL.animationManager.nextExitAnimationName.set(
            key + '-off',
            getSentenceArgByKey(sentence, 'exit')!.toString(),
          );
        }
        dispatch(setStage({ key: 'figNameLeft', value: content }));
        break;
      case 'right':
        key = 'fig-right';
        if (getSentenceArgByKey(sentence, 'enter')) {
          WebGAL.animationManager.nextEnterAnimationName.set(key, getSentenceArgByKey(sentence, 'enter')!.toString());
        }
        if (getSentenceArgByKey(sentence, 'exit')) {
          WebGAL.animationManager.nextExitAnimationName.set(
            key + '-off',
            getSentenceArgByKey(sentence, 'exit')!.toString(),
          );
        }
        dispatch(setStage({ key: 'figNameRight', value: content }));
        break;
    }
  if (motion) {
    const index = webgalStore.getState().stage.live2dMotion.findIndex((e) => e.target === key);
    let motionArr = webgalStore.getState().stage.live2dMotion;
    if (index <= 0) {
      // 应用一个新的 motion
      motionArr = [...webgalStore.getState().stage.live2dMotion, { target: key, motion }];
    } else {
      motionArr[index].motion = motion;
      // deep clone
      motionArr = [...motionArr];
    }
    dispatch(setStage({ key: 'live2dMotion', value: motionArr }));
  }
  return {
    performName: 'none',
    duration: 0,
    isHoldOn: false,
    stopFunction: () => {},
    blockingNext: () => false,
    blockingAuto: () => false,
    stopTimeout: undefined, // 暂时不用，后面会交给自动清除
  };
};
