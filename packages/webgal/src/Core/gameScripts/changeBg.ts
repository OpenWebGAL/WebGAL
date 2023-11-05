import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { IPerform } from '@/Core/Modules/perform/performInterface';
// import {getRandomPerformName} from '../../../util/getRandomPerformName';
import styles from '../../Components/Stage/stage.module.scss';
import { webgalStore } from '@/store/store';
import { setStage, stageActions } from '@/store/stageReducer';
import { getSentenceArgByKey } from '@/Core/util/getSentenceArg';
import { unlockCgInUserData } from '@/store/userDataReducer';
import { logger } from '@/Core/util/etc/logger';
import { ITransform } from '@/store/stageInterface';
import { generateTransformAnimationObj } from '@/Core/gameScripts/function/generateTransformAnimationObj';
import { IUserAnimation } from '@/Core/Modules/animations';
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

  /**
   * 删掉相关 Effects，因为已经移除了
   */
  dispatch(stageActions.removeEffectByTargetId(`bg-main`));

  // 处理 transform 和 默认 transform
  const transformString = getSentenceArgByKey(sentence, 'transform');
  let duration = getSentenceArgByKey(sentence, 'duration');
  if (!duration || typeof duration !== 'number') {
    duration = 1000;
  }
  let animationObj: (ITransform & {
    duration: number;
  })[];
  if (transformString) {
    try {
      const frame = JSON.parse(transformString.toString()) as ITransform & { duration: number };
      animationObj = generateTransformAnimationObj('bg-main', frame, duration);
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
    animationObj = generateTransformAnimationObj('bg-main', frame as ITransform & { duration: number }, duration);
    // 因为是切换，必须把一开始的 alpha 改为 0
    animationObj[0].alpha = 0;
    const animationName = (Math.random() * 10).toString(16);
    const newAnimation: IUserAnimation = { name: animationName, effects: animationObj };
    WebGAL.animationManager.addAnimation(newAnimation);
    duration = getAnimateDuration(animationName);
    WebGAL.animationManager.nextEnterAnimationName.set('bg-main', animationName);
  }

  // 应用动画的优先级更高一点
  if (getSentenceArgByKey(sentence, 'enter')) {
    WebGAL.animationManager.nextEnterAnimationName.set('bg-main', getSentenceArgByKey(sentence, 'enter')!.toString());
    duration = getAnimateDuration(getSentenceArgByKey(sentence, 'enter')!.toString());
  }
  if (getSentenceArgByKey(sentence, 'exit')) {
    WebGAL.animationManager.nextExitAnimationName.set('bg-main-off', getSentenceArgByKey(sentence, 'exit')!.toString());
    duration = getAnimateDuration(getSentenceArgByKey(sentence, 'exit')!.toString());
  }
  dispatch(setStage({ key: 'bgName', value: sentence.content }));

  return {
    performName: 'none',
    duration,
    isHoldOn: false,
    stopFunction: () => {},
    blockingNext: () => false,
    blockingAuto: () => true,
    stopTimeout: undefined, // 暂时不用，后面会交给自动清除
  };
};
