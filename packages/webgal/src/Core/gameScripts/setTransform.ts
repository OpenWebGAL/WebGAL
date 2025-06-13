import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { IPerform } from '@/Core/Modules/perform/performInterface';
import { getSentenceArgByKey } from '@/Core/util/getSentenceArg';
import PixiStage, { IAnimationObject } from '@/Core/controller/stage/pixi/PixiController';
import { logger } from '@/Core/util/logger';
import { webgalStore } from '@/store/store';
import { generateTimelineObj } from '@/Core/controller/stage/pixi/animations/timeline';
import cloneDeep from 'lodash/cloneDeep';
import { baseTransform, ITransform } from '@/store/stageInterface';
import { AnimationFrame, IUserAnimation } from '../Modules/animations';
import { generateTransformAnimationObj } from '@/Core/controller/stage/pixi/animations/generateTransformAnimationObj';
import { WebGAL } from '@/Core/WebGAL';
import { getAnimateDuration, getAnimationObject } from '../Modules/animationFunctions';

/**
 * 设置变换
 * @param sentence
 */
export const setTransform = (sentence: ISentence): IPerform => {
  const startDialogKey = webgalStore.getState().stage.currentDialogKey;
  const animationName = (Math.random() * 10).toString(16);
  const animationString = sentence.content;
  let animationObj: AnimationFrame[];
  const duration = getSentenceArgByKey(sentence, 'duration');
  const ease = (getSentenceArgByKey(sentence, 'ease') as string) ?? '';
  const writeDefault = (getSentenceArgByKey(sentence, 'writeDefault') as boolean) ?? false;
  const target = (getSentenceArgByKey(sentence, 'target')?.toString() ?? '0') as string;
  const keep = getSentenceArgByKey(sentence, 'keep') === true;
  const performInitName = `animation-${target}`;

  WebGAL.gameplay.performController.unmountPerform(performInitName, true);

  try {
    const frame = JSON.parse(animationString) as AnimationFrame;
    animationObj = generateTransformAnimationObj(target, frame, duration, ease);
    console.log('animationObj:', animationObj);
  } catch (e) {
    // 解析都错误了，歇逼吧
    animationObj = [];
  }

  const newAnimation: IUserAnimation = { name: animationName, effects: animationObj };
  WebGAL.animationManager.addAnimation(newAnimation);
  const animationDuration = getAnimateDuration(animationName);

  const key = `${target}-${animationName}-${animationDuration}`;
  let stopFunction = () => {};
  setTimeout(() => {
    WebGAL.gameplay.pixiStage?.stopPresetAnimationOnTarget(target);
    const animationObj: IAnimationObject | null = getAnimationObject(
      animationName,
      target,
      animationDuration,
      writeDefault,
    );
    if (animationObj) {
      logger.debug(`动画${animationName}作用在${target}`, animationDuration);
      WebGAL.gameplay.pixiStage?.registerAnimation(animationObj, key, target);
    }
  }, 0);
  stopFunction = () => {
    setTimeout(() => {
      const endDialogKey = webgalStore.getState().stage.currentDialogKey;
      const isHasNext = startDialogKey !== endDialogKey;
      WebGAL.gameplay.pixiStage?.removeAnimationWithSetEffects(key);
    }, 0);
  };

  return {
    performName: performInitName,
    duration: animationDuration,
    isHoldOn: keep,
    stopFunction,
    blockingNext: () => false,
    blockingAuto: () => !keep,
    stopTimeout: undefined, // 暂时不用，后面会交给自动清除
  };
};
