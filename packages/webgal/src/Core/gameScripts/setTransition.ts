import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { IPerform } from '@/Core/Modules/perform/performInterface';
import { webgalStore } from '@/store/store';
import cloneDeep from 'lodash/cloneDeep';
import { updateCurrentEffects } from '@/Core/controller/stage/pixi/PixiController';
import { getSentenceArgByKey } from '@/Core/util/getSentenceArg';
import { WebGAL } from '@/main';
import { setStage } from '@/store/stageReducer';

/**
 * 设置转场效果
 * @param sentence
 */
export const setTransition = (sentence: ISentence): IPerform => {
  // 根据参数设置指定位置
  let key = '';
  for (const e of sentence.args) {
    if (e.key === 'target') {
      key = e.value.toString();
    }
  }
  if (getSentenceArgByKey(sentence, 'enter')) {
    WebGAL.animationManager.nextEnterAnimationName.set(key, getSentenceArgByKey(sentence, 'enter')!.toString());
  }
  if (getSentenceArgByKey(sentence, 'exit')) {
    WebGAL.animationManager.nextExitAnimationName.set(key + '-off', getSentenceArgByKey(sentence, 'exit')!.toString());
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
