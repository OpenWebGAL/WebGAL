import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { IPerform } from '@/Core/Modules/perform/performInterface';
import { webgalStore } from '@/store/store';
import { setStage, stageActions } from '@/store/stageReducer';
import cloneDeep from 'lodash/cloneDeep';
import { getBooleanArgByKey, getNumberArgByKey, getStringArgByKey } from '@/Core/util/getSentenceArg';
import { baseTransform, IFreeFigure, IStageState, ITransform } from '@/store/stageInterface';
import { AnimationFrame, IUserAnimation } from '@/Core/Modules/animations';
import { generateTransformAnimationObj } from '@/Core/controller/stage/pixi/animations/generateTransformAnimationObj';
import { assetSetter, fileType } from '@/Core/util/gameAssetsAccess/assetSetter';
import { logger } from '@/Core/util/logger';
import { createDefaultEnterExitAnimation, getAnimateDuration } from '@/Core/Modules/animationFunctions';
import { WebGAL } from '@/Core/WebGAL';
/**
 * 更改立绘
 * @param sentence 语句
 */
// eslint-disable-next-line complexity
export function changeFigure(sentence: ISentence): IPerform {

  let pos: 'center' | 'left' | 'right' = 'center';
  let mouthAnimationKey = 'mouthAnimation';
  let eyesAnimationKey = 'blinkAnimation';
  let content = sentence.content;
  let isFreeFigure = false;
  let key = '';
  let duration = 500;
  const dispatch = webgalStore.dispatch;

  // Figure Position
  const leftFromArg = getBooleanArgByKey(sentence, 'left') ?? false;
  const rightFromArg = getBooleanArgByKey(sentence, 'right') ?? false;
  if (leftFromArg) {
    pos = 'left';
    mouthAnimationKey = 'mouthAnimationLeft';
    eyesAnimationKey = 'blinkAnimationLeft';
  }
  if (rightFromArg) {
    pos = 'right';
    mouthAnimationKey = 'mouthAnimationRight';
    eyesAnimationKey = 'blinkAnimationRight';
  }

  // Live2D
  const motion = getStringArgByKey(sentence, 'motion') ?? '';
  const expression = getStringArgByKey(sentence, 'expression') ?? '';
  const overrideBounds = getStringArgByKey(sentence, 'bounds') ?? '';

  // Expression Image
  const mouthOpenFromArg = getStringArgByKey(sentence, 'mouthOpen');
  const mouthOpen = mouthOpenFromArg ? assetSetter(mouthOpenFromArg, fileType.figure) : '';
  const mouthHalfOpenFromArg = getStringArgByKey(sentence, 'mouthHalfOpen');
  const mouthHalfOpen = mouthHalfOpenFromArg ? assetSetter(mouthHalfOpenFromArg, fileType.figure) : '';
  const mouthCloseFromArg = getStringArgByKey(sentence, 'mouthClose');
  const mouthClose = mouthCloseFromArg ? assetSetter(mouthCloseFromArg, fileType.figure) : '';
  const eyesOpenFromArg = getStringArgByKey(sentence, 'eyesOpen');
  const eyesOpen = eyesOpenFromArg ? assetSetter(eyesOpenFromArg, fileType.figure) : '';
  const eyesCloseFromArg = getStringArgByKey(sentence, 'eyesClose');
  const eyesClose = eyesCloseFromArg ? assetSetter(eyesCloseFromArg, fileType.figure) : '';

  // Other Args
  const clearFromArg = getBooleanArgByKey(sentence, 'clear') ?? false;
  if (clearFromArg) {
    content = '';
  }
  const noneFromArg = getBooleanArgByKey(sentence, 'none') ?? false;
  if (noneFromArg) {
    content = '';
  }
  const idFromArg = getStringArgByKey(sentence, 'id');
  if (idFromArg) {
    isFreeFigure = true;
    key = idFromArg;
  }
  const animationFlag = getStringArgByKey(sentence, 'animationFlag') ?? '';
  const  zIndex = getNumberArgByKey(sentence, 'zIndex') ?? -1;

  const id = key ? key : `fig-${pos}`;

  const currentFigureAssociatedAnimation = webgalStore.getState().stage.figureAssociatedAnimation;
  const filteredFigureAssociatedAnimation = currentFigureAssociatedAnimation.filter((item) => item.targetId !== id);
  const newFigureAssociatedAnimationItem = {
    targetId: id,
    animationFlag: animationFlag,
    mouthAnimation: {
      open: mouthOpen,
      close: mouthClose,
      halfOpen: mouthHalfOpen,
    },
    blinkAnimation: {
      open: eyesOpen,
      close: eyesClose,
    },
  };
  filteredFigureAssociatedAnimation.push(newFigureAssociatedAnimationItem);
  dispatch(setStage({ key: 'figureAssociatedAnimation', value: filteredFigureAssociatedAnimation }));

  /**
   * 如果 url 没变，不移除
   */
  let isRemoveEffects = true;
  if (key !== '') {
    const figWithKey = webgalStore.getState().stage.freeFigure.find((e) => e.key === key);
    if (figWithKey) {
      if (figWithKey.name === sentence.content) {
        isRemoveEffects = false;
      }
    }
  } else {
    if (pos === 'center') {
      if (webgalStore.getState().stage.figName === sentence.content) {
        isRemoveEffects = false;
      }
    }
    if (pos === 'left') {
      if (webgalStore.getState().stage.figNameLeft === sentence.content) {
        isRemoveEffects = false;
      }
    }
    if (pos === 'right') {
      if (webgalStore.getState().stage.figNameRight === sentence.content) {
        isRemoveEffects = false;
      }
    }
  }

  // 确定 key
  if (!isFreeFigure) {
    const positionMap = {
      center: 'fig-center',
      left: 'fig-left',
      right: 'fig-right',
    };
    key = positionMap[pos];
  }
  
  // 储存一下现有的 transform 给退场动画当起始帧用, 因为马上就要清除了
  const currentEffect = webgalStore.getState().stage.effects.find((e) => e.target === key);
  let currentTransform = baseTransform;
  if (currentEffect && currentEffect.transform) {
    currentTransform = currentEffect.transform;
  }

  /**
   * 处理 Effects
   */
  if (isRemoveEffects) {
    const deleteKey = `fig-${pos}`;
    const deleteKey2 = `${key}`;
    webgalStore.dispatch(stageActions.removeEffectByTargetId(deleteKey));
    webgalStore.dispatch(stageActions.removeEffectByTargetId(deleteKey2));
    // 重设 figureMetaData，这里是 zIndex，实际上任何键都可以，因为整体是移除那条记录
    dispatch(stageActions.setFigureMetaData([deleteKey, 'zIndex', 0, true]));
    dispatch(stageActions.setFigureMetaData([deleteKey2, 'zIndex', 0, true]));
  }
  const setAnimationNames = (key: string, sentence: ISentence) => {
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
    const enterAnim = getStringArgByKey(sentence, 'enter');
    const exitAnim = getStringArgByKey(sentence, 'exit');
    if (enterAnim) {
      WebGAL.animationManager.nextEnterAnimationName.set(key, enterAnim);
      duration = getAnimateDuration(enterAnim);
    }
    if (exitAnim) {
      WebGAL.animationManager.nextExitAnimationName.set(key + '-off', exitAnim);
      duration = getAnimateDuration(exitAnim);
    }
  };
  if (isFreeFigure) {
    /**
     * 下面的代码是设置自由立绘的
     */
    const freeFigureItem: IFreeFigure = { key, name: content, basePosition: pos };
    setAnimationNames(key, sentence);
    if (motion || overrideBounds) {
      dispatch(
        stageActions.setLive2dMotion({ target: key, motion, overrideBounds: getOverrideBoundsArr(overrideBounds) }),
      );
    }
    if (expression) {
      dispatch(stageActions.setLive2dExpression({ target: key, expression }));
    }
    if (zIndex > 0) {
      dispatch(stageActions.setFigureMetaData([key, 'zIndex', zIndex, false]));
    }
    dispatch(stageActions.setFreeFigureByKey(freeFigureItem));
  } else {
    /**
     * 下面的代码是设置与位置关联的立绘的
     */
    const dispatchMap: Record<string, keyof IStageState> = {
      center: 'figName',
      left: 'figNameLeft',
      right: 'figNameRight',
    };

    setAnimationNames(key, sentence);
    if (motion || overrideBounds) {
      dispatch(
        stageActions.setLive2dMotion({ target: key, motion, overrideBounds: getOverrideBoundsArr(overrideBounds) }),
      );
    }
    if (expression) {
      dispatch(stageActions.setLive2dExpression({ target: key, expression }));
    }
    if (zIndex > 0) {
      dispatch(stageActions.setFigureMetaData([key, 'zIndex', zIndex, false]));
    }
    dispatch(setStage({ key: dispatchMap[pos], value: content }));
  }

  return {
    performName: `enter-${key}`,
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
}

function getOverrideBoundsArr(raw: string): undefined | [number, number, number, number] {
  const parseOverrideBoundsResult = raw.split(',').map((e) => Number(e));
  let isPass = true;
  parseOverrideBoundsResult.forEach((e) => {
    if (isNaN(e)) {
      isPass = false;
    }
  });
  isPass = isPass && parseOverrideBoundsResult.length === 4;
  if (isPass) return parseOverrideBoundsResult as [number, number, number, number];
  else return undefined;
}
