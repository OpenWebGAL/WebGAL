import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { IPerform } from '@/Core/Modules/perform/performInterface';
// import {getRandomPerformName} from '../../../util/getRandomPerformName';
import styles from '@/Stage/stage.module.scss';
import { webgalStore } from '@/store/store';
import { setStage, stageActions } from '@/store/stageReducer';
import { getNumberArgByKey, getStringArgByKey } from '@/Core/util/getSentenceArg';
import { unlockCgInUserData } from '@/store/userDataReducer';
import { logger } from '@/Core/util/logger';
import { ITransform } from '@/store/stageInterface';
import { generateTransformAnimationObj } from '@/Core/controller/stage/pixi/animations/generateTransformAnimationObj';
import { AnimationFrame, IUserAnimation } from '@/Core/Modules/animations';
import cloneDeep from 'lodash/cloneDeep';
import { getAnimateDuration } from '@/Core/Modules/animationFunctions';
import { WebGAL } from '@/Core/WebGAL';

/**
 * 进行背景图片的切换
 * @param sentence 语句
 * @return {IPerform}
 */
export const changeBg = (sentence: ISentence): IPerform => {
  const url = sentence.content;
  const unlockName = getStringArgByKey(sentence, 'unlockname') ?? '';
  const series = getStringArgByKey(sentence, 'series') ?? 'default';
  const transformString = getStringArgByKey(sentence, 'transform');
  let duration = getNumberArgByKey(sentence, 'duration') ?? 1000;
  const ease = getStringArgByKey(sentence, 'ease') ?? '';

  const dispatch = webgalStore.dispatch;
  if (unlockName !== '') {
    dispatch(unlockCgInUserData({ name: unlockName, url, series }));
  }

  /**
   * 删掉相关 Effects，因为已经移除了
   */
  if (webgalStore.getState().stage.bgName !== sentence.content) {
    dispatch(stageActions.removeEffectByTargetId(`bg-main`));
  }

  // 处理 transform 和 默认 transform
  let animationObj: AnimationFrame[];
  if (transformString) {
    try {
      const frame = JSON.parse(transformString.toString()) as AnimationFrame;
      animationObj = generateTransformAnimationObj('bg-main', frame, duration, ease);
      // 因为是切换，必须把一开始的 alpha 改为 0
      animationObj[0].alpha = 0;
      const animationName = (Math.random() * 10).toString(16);
      const newAnimation: IUserAnimation = { name: animationName, effects: animationObj };
      WebGAL.animationManager.addAnimation(newAnimation);
      duration = getAnimateDuration(animationName);
      WebGAL.animationManager.nextEnterAnimationName.set('bg-main', animationName);
    } catch (e) {
      // 解析都错误了，歇逼吧
      applyDefaultTransform();
    }
  } else {
    applyDefaultTransform();
  }

  function applyDefaultTransform() {
    // 应用默认的
    const frame = {};
    animationObj = generateTransformAnimationObj('bg-main', frame as AnimationFrame, duration, ease);
    // 因为是切换，必须把一开始的 alpha 改为 0
    animationObj[0].alpha = 0;
    const animationName = (Math.random() * 10).toString(16);
    const newAnimation: IUserAnimation = { name: animationName, effects: animationObj };
    WebGAL.animationManager.addAnimation(newAnimation);
    duration = getAnimateDuration(animationName);
    WebGAL.animationManager.nextEnterAnimationName.set('bg-main', animationName);
  }

  // 应用动画的优先级更高一点
  const enterAnimation = getStringArgByKey(sentence, 'enter');
  const exitAnimation = getStringArgByKey(sentence, 'exit');
  if (enterAnimation) {
    WebGAL.animationManager.nextEnterAnimationName.set('bg-main', enterAnimation);
    duration = getAnimateDuration(enterAnimation);
  }
  if (exitAnimation) {
    WebGAL.animationManager.nextExitAnimationName.set('bg-main-off', exitAnimation);
    duration = getAnimateDuration(exitAnimation);
  }

  dispatch(setStage({ key: 'bgName', value: sentence.content }));

  return {
    performName: `bg-main-${sentence.content}`,
    duration,
    isHoldOn: false,
    stopFunction: () => {
      WebGAL.gameplay.pixiStage?.stopPresetAnimationOnTarget('bg-main');
    },
    blockingNext: () => false,
    blockingAuto: () => true,
    stopTimeout: undefined, // 暂时不用，后面会交给自动清除
  };
};
