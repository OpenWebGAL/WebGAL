import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { IPerform } from '@/Core/Modules/perform/performInterface';
import { webgalStore } from '@/store/store';
import cloneDeep from 'lodash/cloneDeep';
import { getStringArgByKey } from '@/Core/util/getSentenceArg';
import { setStage, stageActions } from '@/store/stageReducer';
import { WebGAL } from '@/Core/WebGAL';

/**
 * 设置转场效果
 * @param sentence
 */
export const setTransition = (sentence: ISentence): IPerform => {
  // 根据参数设置指定位置
  let key = getStringArgByKey(sentence, 'target') ?? '0';
  const enterAnimation = getStringArgByKey(sentence, 'enter');
  const exitAnimation = getStringArgByKey(sentence, 'exit');
  if (enterAnimation) {
    webgalStore.dispatch(
      stageActions.updateAnimationSettings({ target: key, key: 'enterAnimationName', value: enterAnimation }),
    );
  }
  if (exitAnimation) {
    webgalStore.dispatch(
      stageActions.updateAnimationSettings({ target: key, key: 'exitAnimationName', value: exitAnimation }),
    );
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
