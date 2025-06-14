import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { IPerform } from '@/Core/Modules/perform/performInterface';
// import {getRandomPerformName} from '../../../util/getRandomPerformName';
import styles from '@/Stage/stage.module.scss';
import { webgalStore } from '@/store/store';
import { setStage, stageActions } from '@/store/stageReducer';
import { getNumberArgByKey, getStringArgByKey } from '@/Core/util/getSentenceArg';
import { unlockCgInUserData } from '@/store/userDataReducer';
import { logger } from '@/Core/util/logger';
import { baseTransform, ITransform } from '@/store/stageInterface';
import { generateTransformAnimationObj } from '@/Core/controller/stage/pixi/animations/generateTransformAnimationObj';
import { AnimationFrame, IUserAnimation } from '@/Core/Modules/animations';
import cloneDeep from 'lodash/cloneDeep';
import { createDefaultEnterExitAnimation, getAnimateDuration } from '@/Core/Modules/animationFunctions';
import { WebGAL } from '@/Core/WebGAL';

/**
 * 进行背景图片的切换
 * @param sentence 语句
 * @return {IPerform}
 */
export const changeBg = (sentence: ISentence): IPerform => {
  const url = sentence.content;
  const key = 'bg-main';
  let name = '';
  let series = 'default';
  let duration = 500;

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
  if (currentEffect && currentEffect.transform) {
    currentTransform = currentEffect.transform;
  }

  /**
   * 删掉相关 Effects，因为已经移除了
   */
  dispatch(stageActions.removeEffectByTargetId(key));

  // 处理 transform 和 默认 transform
  const transformString = getStringArgByKey(sentence, 'transform');
  const durationFromArg = getNumberArgByKey(sentence, 'duration');
  duration = durationFromArg ?? duration;
  const ease = getStringArgByKey(sentence, 'ease') ?? '';

  if (transformString) {
    console.log(transformString);
    try {
      const transform = JSON.parse(transformString.toString()) as ITransform;
      const enterFrame = {...transform, duration: 0, ease: ''};
      const exitFrame = {...currentTransform, duration: 0, ease: ''};
      createDefaultEnterExitAnimation('enter', key, enterFrame, duration, ease);
      createDefaultEnterExitAnimation('exit', key, exitFrame, duration, ease);
    } catch (e) {
      // 解析都错误了，歇逼吧
      const enterFrame = {...baseTransform, duration: 0, ease: ''};
      const exitFrame = {...currentTransform, duration: 0, ease: ''};
      createDefaultEnterExitAnimation('enter', key, enterFrame, duration, ease);
      createDefaultEnterExitAnimation('exit', key, exitFrame, duration, ease);
    }
  } else {
    const enterFrame = {...baseTransform, duration: 0, ease: ''};
    const exitFrame = {...currentTransform, duration: 0, ease: ''};
    createDefaultEnterExitAnimation('enter', key, enterFrame, duration, ease);
    createDefaultEnterExitAnimation('exit', key, exitFrame, duration, ease);
  }

  // 应用动画的优先级更高一点
  const enter = getStringArgByKey(sentence, 'enter');
  const exit = getStringArgByKey(sentence, 'exit');
  if (enter) {
    WebGAL.animationManager.nextEnterAnimationName.set(key, enter);
    duration = getAnimateDuration(enter);
  }
  if (exit) {
    WebGAL.animationManager.nextExitAnimationName.set(key + '-off', exit);
    duration = getAnimateDuration(exit);
  }
  dispatch(setStage({ key: 'bgName', value: sentence.content }));

  return {
    performName: `${key}-${sentence.content}`,
    duration,
    isHoldOn: false,
    stopFunction: () => {
      WebGAL.gameplay.pixiStage?.stopPresetAnimationOnTarget(key);
      WebGAL.gameplay.pixiStage?.stopPresetAnimationOnTarget(key + '-old' + '-off');
    },
    blockingNext: () => false,
    blockingAuto: () => true,
    stopTimeout: undefined, // 暂时不用，后面会交给自动清除
  };
};
