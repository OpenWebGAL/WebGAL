import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { IPerform } from '@/Core/Modules/perform/performInterface';
// import {getRandomPerformName} from '../../../util/getRandomPerformName';
import styles from '@/Stage/stage.module.scss';
import { webgalStore } from '@/store/store';
import { setStage, stageActions } from '@/store/stageReducer';
import { getSentenceArgByKey } from '@/Core/util/getSentenceArg';
import { unlockCgInUserData } from '@/store/userDataReducer';
import { logger } from '@/Core/util/logger';
import { baseTransform, ITransform } from '@/store/stageInterface';
import { generateTransformAnimationObj } from '@/Core/controller/stage/pixi/animations/generateTransformAnimationObj';
import { AnimationFrame, IUserAnimation } from '@/Core/Modules/animations';
import cloneDeep from 'lodash/cloneDeep';
import {
  createDefaultEnterExitAnimation,
  createEnterExitAnimation,
  getAnimateDuration,
  getEnterAnimationKey,
  getOldTargetKey,
} from '@/Core/Modules/animationFunctions';
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
  let duration = 1000;
  let name = '';
  let series = 'default';
  sentence.args.forEach((e) => {
    if (e.key === 'unlockname') {
      name = e.value.toString();
    }
    if (e.key === 'series') {
      series = e.value.toString();
    }
  });

  const dispatch = webgalStore.dispatch;
  if (name !== '') dispatch(unlockCgInUserData({ name, url, series }));

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
    dispatch(stageActions.removeEffectByTargetId(`bg-main`));
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
