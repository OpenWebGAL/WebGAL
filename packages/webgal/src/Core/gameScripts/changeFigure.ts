import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { IPerform } from '@/Core/Modules/perform/performInterface';
import { webgalStore } from '@/store/store';
import { setStage } from '@/store/stageReducer';
import { updateCurrentEffects } from '../controller/stage/pixi/PixiController';
import cloneDeep from 'lodash/cloneDeep';
import { getSentenceArgByKey } from '@/Core/util/getSentenceArg';
import { WebGAL } from '@/main';
import { IStageState, ITransform } from '@/store/stageInterface';
import { getAnimateDuration, IUserAnimation } from '@/Core/Modules/animations';
import { generateTransformAnimationObj } from '@/Core/gameScripts/function/generateTransformAnimationObj';

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
  let duration = 500;
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
  const index = newEffects.findIndex((e) => e.target === `fig-${pos}` || e.target === `${key}`);
  if (index >= 0) {
    newEffects.splice(index, 1);
  }
  updateCurrentEffects(newEffects);
  const setAnimationNames = (key: string, sentence: ISentence) => {
    // 处理 transform 和 默认 transform
    const transformString = getSentenceArgByKey(sentence, 'transform');
    const durationFromArg = getSentenceArgByKey(sentence, 'duration');
    if (durationFromArg && typeof durationFromArg === 'number') {
      duration = durationFromArg;
    }
    let animationObj: (ITransform & {
      duration: number;
    })[];
    if (transformString) {
      console.log(transformString);
      try {
        const frame = JSON.parse(transformString.toString()) as ITransform & { duration: number };
        animationObj = generateTransformAnimationObj(key, frame, duration);
        // 因为是切换，必须把一开始的 alpha 改为 0
        animationObj[0].alpha = 0;
        const animationName = (Math.random() * 10).toString(16);
        const newAnimation: IUserAnimation = { name: animationName, effects: animationObj };
        WebGAL.animationManager.addAnimation(newAnimation);
        duration = getAnimateDuration(animationName);
        WebGAL.animationManager.nextEnterAnimationName.set(key, animationName);
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
      animationObj = generateTransformAnimationObj(key, frame as ITransform & { duration: number }, duration);
      // 因为是切换，必须把一开始的 alpha 改为 0
      animationObj[0].alpha = 0;
      const animationName = (Math.random() * 10).toString(16);
      const newAnimation: IUserAnimation = { name: animationName, effects: animationObj };
      WebGAL.animationManager.addAnimation(newAnimation);
      duration = getAnimateDuration(animationName);
      WebGAL.animationManager.nextEnterAnimationName.set(key, animationName);
    }
    const enterAnim = getSentenceArgByKey(sentence, 'enter');
    const exitAnim = getSentenceArgByKey(sentence, 'exit');
    if (enterAnim) {
      WebGAL.animationManager.nextEnterAnimationName.set(key, enterAnim.toString());
      duration = getAnimateDuration(enterAnim.toString());
    }
    if (exitAnim) {
      WebGAL.animationManager.nextExitAnimationName.set(key + '-off', exitAnim.toString());
      duration = getAnimateDuration(exitAnim.toString());
    }
  };
  if (isFreeFigure) {
    const currentFreeFigures = webgalStore.getState().stage.freeFigure;

    /**
     * 重设
     */
    const index = currentFreeFigures.findIndex((figure) => figure.key === key);
    const newFreeFigure = cloneDeep(currentFreeFigures);
    if (index >= 0) {
      newFreeFigure[index].basePosition = pos;
      newFreeFigure[index].name = content;
    } else {
      // 新加
      if (content !== '') newFreeFigure.push({ key, name: content, basePosition: pos });
    }
    setAnimationNames(key, sentence);
    dispatch(setStage({ key: 'freeFigure', value: newFreeFigure }));
  } else {
    const positionMap = {
      center: 'fig-center',
      left: 'fig-left',
      right: 'fig-right',
    };
    const dispatchMap = {
      center: 'figName',
      left: 'figNameLeft',
      right: 'figNameRight',
    };

    key = positionMap[pos];
    setAnimationNames(key, sentence);
    dispatch(setStage({ key: dispatchMap[pos] as keyof IStageState, value: content }));
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
    duration,
    isHoldOn: false,
    stopFunction: () => {},
    blockingNext: () => false,
    blockingAuto: () => false,
    stopTimeout: undefined, // 暂时不用，后面会交给自动清除
  };
};
