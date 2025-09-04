import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { IPerform } from '@/Core/Modules/perform/performInterface';
// import {getRandomPerformName} from '../../../util/getRandomPerformName';
import styles from '@/Stage/stage.module.scss';
import { webgalStore } from '@/store/store';
import { setStage, stageActions } from '@/store/stageReducer';
import { getNumberArgByKey, getStringArgByKey } from '@/Core/util/getSentenceArg';
import { unlockCgInUserData } from '@/store/userDataReducer';
import { baseTransform } from '@/store/stageInterface';
import cloneDeep from 'lodash/cloneDeep';
import { createEnterExitAnimation, getEnterAnimationKey, getOldTargetKey } from '@/Core/Modules/animationFunctions';
import { WebGAL } from '@/Core/WebGAL';
import { STAGE_KEYS } from '@/Core/constants';

/**
 * 进行背景图片的切换
 * @param sentence 语句
 * @return {IPerform}
 */
export const changeBg = (sentence: ISentence): IPerform => {
  const url = sentence.content;
  const key = STAGE_KEYS.BG_MAIN;
  const unlockName = getStringArgByKey(sentence, 'unlockname') ?? '';
  const series = getStringArgByKey(sentence, 'series') ?? 'default';
  let duration = getNumberArgByKey(sentence, 'duration') ?? 1000;

  const dispatch = webgalStore.dispatch;
  if (unlockName !== '') {
    dispatch(unlockCgInUserData({ name: unlockName, url, series }));
  }

  // 储存一下现有的 transform 给退场动画当起始帧用, 因为马上就要清除了
  const currentEffect = webgalStore.getState().stage.effects.find((e) => e.target === key);
  let currentTransform = baseTransform;
  if (currentEffect?.transform) {
    currentTransform = cloneDeep(currentEffect.transform);
  }

  /**
   * 删掉相关 Effects，因为已经移除了
   */
  if (webgalStore.getState().stage.bgName !== sentence.content) {
    dispatch(stageActions.removeEffectByTargetId(key));
  }

  duration = createEnterExitAnimation(sentence, key, duration, currentTransform);

  dispatch(setStage({ key: 'bgName', value: sentence.content }));

  return {
    performName: `${key}-${sentence.content}`,
    duration,
    isHoldOn: false,
    stopFunction: () => {
      const oldTargetKey = getOldTargetKey(key);
      const enterAnimationKey = getEnterAnimationKey(key);
      WebGAL.gameplay.pixiStage?.stopPresetAnimationOnTarget(key);
      WebGAL.gameplay.pixiStage?.stopPresetAnimationOnTarget(oldTargetKey);
      WebGAL.gameplay.pixiStage?.removeAnimation(enterAnimationKey, true);
      WebGAL.gameplay.pixiStage?.removeStageObjectByKey(oldTargetKey);
    },
    blockingNext: () => false,
    blockingAuto: () => true,
    stopTimeout: undefined, // 暂时不用，后面会交给自动清除
  };
};
