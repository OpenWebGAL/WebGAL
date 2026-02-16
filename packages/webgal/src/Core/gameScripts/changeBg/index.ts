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
import { DEFAULT_BG_OUT_DURATION } from '@/Core/constants';
import localforage from 'localforage';

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
  let duration = getNumberArgByKey(sentence, 'duration') ?? DEFAULT_BG_OUT_DURATION;
  const enterDuration = getNumberArgByKey(sentence, 'enterDuration') ?? duration;
  duration = enterDuration;
  const exitDuration = getNumberArgByKey(sentence, 'exitDuration') ?? DEFAULT_BG_OUT_DURATION;
  const ease = getStringArgByKey(sentence, 'ease') ?? '';

  const dispatch = webgalStore.dispatch;
  if (unlockName !== '') {
    dispatch(unlockCgInUserData({ name: unlockName, url, series }));
    const userDataState = webgalStore.getState().userData;
    localforage.setItem(WebGAL.gameKey, userDataState).then(() => {});
  }

  /**
   * 判断背景 URL 是否发生了变化
   */
  const isUrlChanged = webgalStore.getState().stage.bgName !== sentence.content;

  /**
   * 删掉相关 Effects，因为已经移除了
   */
  if (isUrlChanged) {
    dispatch(stageActions.removeEffectByTargetId(`bg-main`));
    dispatch(stageActions.removeAnimationSettingsByTarget(`bg-main`));
  }

  // 处理 transform 和 默认 transform
  let animationObj: AnimationFrame[];
  if (transformString) {
    try {
      const frame = JSON.parse(transformString.toString()) as AnimationFrame;
      animationObj = generateTransformAnimationObj('bg-main', frame, enterDuration, ease);
      // 因为是切换，必须把一开始的 alpha 改为 0
      animationObj[0].alpha = 0;
      const animationName = (Math.random() * 10).toString(16);
      const newAnimation: IUserAnimation = { name: animationName, effects: animationObj };
      WebGAL.animationManager.addAnimation(newAnimation);
      duration = getAnimateDuration(animationName);
      webgalStore.dispatch(
        stageActions.updateAnimationSettings({ target: 'bg-main', key: 'enterAnimationName', value: animationName }),
      );
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
    webgalStore.dispatch(
      stageActions.updateAnimationSettings({ target: 'bg-main', key: 'enterAnimationName', value: animationName }),
    );
  }

  // 应用动画的优先级更高一点
  const enterAnimation = getStringArgByKey(sentence, 'enter');
  const exitAnimation = getStringArgByKey(sentence, 'exit');
  if (enterAnimation) {
    webgalStore.dispatch(
      stageActions.updateAnimationSettings({ target: 'bg-main', key: 'enterAnimationName', value: enterAnimation }),
    );
    duration = getAnimateDuration(enterAnimation);
  }
  if (exitAnimation) {
    webgalStore.dispatch(
      stageActions.updateAnimationSettings({ target: 'bg-main', key: 'exitAnimationName', value: exitAnimation }),
    );
    duration = getAnimateDuration(exitAnimation);
  }
  if (enterDuration >= 0) {
    webgalStore.dispatch(
      stageActions.updateAnimationSettings({ target: 'bg-main', key: 'enterDuration', value: enterDuration }),
    );
  }
  if (exitDuration >= 0) {
    webgalStore.dispatch(
      stageActions.updateAnimationSettings({ target: 'bg-main', key: 'exitDuration', value: exitDuration }),
    );
  }

  /**
   * 背景状态后处理
   */
  function postBgStateSet() {
    if (isUrlChanged) {
      // 当 URL 发生变化时，清理旧的 hold 动画
      WebGAL.gameplay.performController.unmountPerform(`animation-bg-main`, true);
    }
  }

  postBgStateSet();
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
