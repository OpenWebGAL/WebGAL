import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { IPerform } from '@/Core/Modules/perform/performInterface';
// import {getRandomPerformName} from '../../../util/getRandomPerformName';
import styles from '@/Stage/stage.module.scss';
import { webgalStore } from '@/store/store';
import { getBooleanArgByKey, getNumberArgByKey, getStringArgByKey } from '@/Core/util/getSentenceArg';
import { unlockCgInUserData } from '@/store/userDataReducer';
import { logger } from '@/Core/util/logger';
import { ITransform } from '@/Core/Modules/stage/stageInterface';
import { generateTransformAnimationObj } from '@/Core/controller/stage/pixi/animations/generateTransformAnimationObj';
import { generateTimelineObj } from '@/Core/controller/stage/pixi/animations/timeline';
import { AnimationFrame, IUserAnimation } from '@/Core/Modules/animations';
import cloneDeep from 'lodash/cloneDeep';
import { applyAnimationEndState, getAnimateDuration } from '@/Core/Modules/animationFunctions';
import { WebGAL } from '@/Core/WebGAL';
import { DEFAULT_BG_OUT_DURATION } from '@/Core/constants';
import localforage from 'localforage';
import { stageStateManager } from '@/Core/Modules/stage/stageStateManager';
import { parseTransformFrame } from '../parseTransformFrame';

/**
 * 进行背景图片的切换
 * @param sentence 语句
 * @return {IPerform}
 */
export const changeBg = (sentence: ISentence): IPerform => {
  const url = sentence.content;
  const unlockName = getStringArgByKey(sentence, 'unlockname') ?? '';
  const series = getStringArgByKey(sentence, 'series') ?? 'default';
  const order = getNumberArgByKey(sentence, 'order') ?? 0;
  const transformString = getStringArgByKey(sentence, 'transform');
  let duration = getNumberArgByKey(sentence, 'duration') ?? DEFAULT_BG_OUT_DURATION;
  const enterDuration = getNumberArgByKey(sentence, 'enterDuration') ?? duration;
  duration = enterDuration;
  const exitDuration = getNumberArgByKey(sentence, 'exitDuration') ?? DEFAULT_BG_OUT_DURATION;
  const ease = getStringArgByKey(sentence, 'ease') ?? '';
  const ignoreDefault = getBooleanArgByKey(sentence, 'ignoreDefault') ?? false;

  const dispatch = webgalStore.dispatch;
  if (unlockName !== '') {
    dispatch(unlockCgInUserData({ name: unlockName, url, series, order }));
    const userDataState = webgalStore.getState().userData;
    localforage.setItem(WebGAL.gameKey, userDataState).then(() => {});
  }

  /**
   * 判断背景 URL 是否发生了变化
   */
  const isUrlChanged = stageStateManager.getCalculationStageState().bgName !== sentence.content;

  /**
   * 删掉相关 Effects，因为已经移除了
   */
  if (isUrlChanged) {
    // 必须先卸载旧的动画演出：它的 stopFunction 会写回终态，晚于清空 effects 会把旧变换复活
    WebGAL.gameplay.performController.unmountPerform(`animation-bg-main`, true);
    stageStateManager.removeEffectByTargetId(`bg-main`);
    stageStateManager.removeAnimationSettingsByTarget(`bg-main`);
  }

  // 处理 transform 和 默认 transform
  let animationObj: AnimationFrame[];
  const frame = transformString ? parseTransformFrame(transformString) : null;
  if (frame) {
    applyTransform(frame);
  } else {
    applyDefaultTransform();
  }

  function applyTransform(frame: AnimationFrame) {
    animationObj = generateTransformAnimationObj('bg-main', frame, enterDuration, ease, !ignoreDefault);
    // 因为是切换，必须把一开始的 alpha 改为 0
    animationObj[0].alpha = 0;
    const animationName = (Math.random() * 10).toString(16);
    const newAnimation: IUserAnimation = { name: animationName, effects: animationObj };
    WebGAL.animationManager.addAnimation(newAnimation);
    duration = getAnimateDuration(animationName);
    stageStateManager.updateAnimationSettings({ target: 'bg-main', key: 'enterAnimationName', value: animationName });
  }

  function applyDefaultTransform() {
    // 应用默认的
    const frame = {};
    applyTransform(frame as AnimationFrame);
  }
  stageStateManager.updateAnimationSettings({
    target: 'bg-main',
    key: 'enterAnimationIgnoreDefault',
    value: ignoreDefault,
  });

  // 应用动画的优先级更高一点
  const enterAnimation = getStringArgByKey(sentence, 'enter');
  const exitAnimation = getStringArgByKey(sentence, 'exit');
  if (enterAnimation) {
    stageStateManager.updateAnimationSettings({ target: 'bg-main', key: 'enterAnimationName', value: enterAnimation });
    duration = getAnimateDuration(enterAnimation);
  }
  if (exitAnimation) {
    stageStateManager.updateAnimationSettings({ target: 'bg-main', key: 'exitAnimationName', value: exitAnimation });
    stageStateManager.updateAnimationSettings({
      target: 'bg-main',
      key: 'exitAnimationIgnoreDefault',
      value: ignoreDefault,
    });
    duration = getAnimateDuration(exitAnimation);
  }
  if (enterDuration >= 0) {
    stageStateManager.updateAnimationSettings({ target: 'bg-main', key: 'enterDuration', value: enterDuration });
  }
  if (exitDuration >= 0) {
    stageStateManager.updateAnimationSettings({ target: 'bg-main', key: 'exitDuration', value: exitDuration });
  }

  stageStateManager.setStage('bgName', sentence.content);

  /**
   * 入场动画
   *
   * 终态在演算期写入 effects，演出只负责视觉过渡，因此不需要任何延迟结算。
   * 与 setTransform 共用 `animation-bg-main` 演出名，同目标的动画冲突由演出去重统一裁决。
   */
  const isEntering = isUrlChanged && sentence.content !== '';
  const enterAnimationSetting = isEntering
    ? stageStateManager.getCalculationStageState().animationSettings.find((setting) => setting.target === 'bg-main')
    : undefined;
  const enterAnimationName = enterAnimationSetting?.enterAnimationName;
  const enterAnimationTimeline = enterAnimationName
    ? applyAnimationEndState(
        enterAnimationName,
        'bg-main',
        false,
        !(enterAnimationSetting?.enterAnimationIgnoreDefault ?? false),
      )
    : null;
  const enterAnimationDuration = enterAnimationName ? getAnimateDuration(enterAnimationName) : 0;
  const enterAnimationKey = 'bg-main-softin';

  return {
    performName: isEntering ? `animation-bg-main` : `bg-main-${sentence.content}`,
    duration,
    isHoldOn: false,
    startFunction: () => {
      if (!enterAnimationTimeline || WebGAL.gameplay.skipAnimation) return;
      const animationObject = generateTimelineObj(enterAnimationTimeline, 'bg-main', enterAnimationDuration);
      WebGAL.gameplay.pixiStage?.registerAnimation(animationObject, enterAnimationKey, 'bg-main');
    },
    stopFunction: () => {
      WebGAL.gameplay.pixiStage?.removeAnimation(enterAnimationKey);
    },
    blockingNext: () => false,
    blockingAuto: () => true,
  };
};
