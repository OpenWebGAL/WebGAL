import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { IPerform } from '@/Core/Modules/perform/performInterface';
import { webgalStore } from '@/store/store';
import { setStage, stageActions } from '@/store/stageReducer';
import cloneDeep from 'lodash/cloneDeep';
import { getSentenceArgByKey } from '@/Core/util/getSentenceArg';
import { IFreeFigure, IStageState, ITransform } from '@/store/stageInterface';
import { IUserAnimation } from '@/Core/Modules/animations';
import { generateTransformAnimationObj } from '@/Core/gameScripts/function/generateTransformAnimationObj';
import { assetSetter, fileType } from '@/Core/util/gameAssetsAccess/assetSetter';
import { logger } from '@/Core/util/etc/logger';
import { getAnimateDuration } from '@/Core/Modules/animationFunctions';
import { WebGAL } from '@/Core/WebGAL';
/**
 * 更改立绘
 * @param sentence 语句
 */
// eslint-disable-next-line complexity
export function changeFigure(sentence: ISentence): IPerform {
  // 根据参数设置指定位置
  let pos: 'center' | 'left' | 'right' = 'center';
  let content = sentence.content;
  let isFreeFigure = false;
  let motion = '';
  let expression = '';
  let key = '';
  let duration = 500;
  let mouthOpen = '';
  let mouthClose = '';
  let mouthHalfOpen = '';
  let eyesOpen = '';
  let eyesClose = '';
  let animationFlag: any = '';
  let mouthAnimationKey: any = 'mouthAnimation';
  let eyesAnimationKey: any = 'blinkAnimation';
  const dispatch = webgalStore.dispatch;

  for (const e of sentence.args) {
    switch (e.key) {
      case 'left':
        if (e.value === true) {
          pos = 'left';
          mouthAnimationKey = 'mouthAnimationLeft';
          eyesAnimationKey = 'blinkAnimationLeft';
        }
        break;
      case 'right':
        if (e.value === true) {
          pos = 'right';
          mouthAnimationKey = 'mouthAnimationRight';
          eyesAnimationKey = 'blinkAnimationRight';
        }
        break;
      case 'clear':
        if (e.value === true) {
          content = '';
        }
        break;
      case 'id':
        isFreeFigure = true;
        key = e.value.toString();
        break;
      case 'motion':
        motion = e.value.toString();
        break;
      case 'expression':
        expression = e.value.toString();
        break;
      case 'mouthOpen':
        mouthOpen = e.value.toString();
        mouthOpen = assetSetter(mouthOpen, fileType.figure);
        break;
      case 'mouthClose':
        mouthClose = e.value.toString();
        mouthClose = assetSetter(mouthClose, fileType.figure);
        break;
      case 'mouthHalfOpen':
        mouthHalfOpen = e.value.toString();
        mouthHalfOpen = assetSetter(mouthHalfOpen, fileType.figure);
        break;
      case 'eyesOpen':
        eyesOpen = e.value.toString();
        eyesOpen = assetSetter(eyesOpen, fileType.figure);
        break;
      case 'eyesClose':
        eyesClose = e.value.toString();
        eyesClose = assetSetter(eyesClose, fileType.figure);
        break;
      case 'animationFlag':
        animationFlag = e.value.toString();
        break;
      case 'none':
        content = '';
        break;
      default:
        break;
    }
  }

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
  /**
   * 处理 Effects
   */
  if (isRemoveEffects) {
    const deleteKey = `fig-${pos}`;
    const deleteKey2 = `${key}`;
    webgalStore.dispatch(stageActions.removeEffectByTargetId(deleteKey));
    webgalStore.dispatch(stageActions.removeEffectByTargetId(deleteKey2));
  }
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
    const freeFigureItem: IFreeFigure = { key, name: content, basePosition: pos };
    setAnimationNames(key, sentence);
    if (motion) {
      dispatch(stageActions.setLive2dMotion({ target: key, motion }));
    }
    if (expression) {
      dispatch(stageActions.setLive2dExpression({ target: 'live2dExpression', expression }));
    }
    dispatch(stageActions.setFreeFigureByKey(freeFigureItem));
  } else {
    const positionMap = {
      center: 'fig-center',
      left: 'fig-left',
      right: 'fig-right',
    };
    const dispatchMap: Record<string, keyof IStageState> = {
      center: 'figName',
      left: 'figNameLeft',
      right: 'figNameRight',
    };

    key = positionMap[pos];
    setAnimationNames(key, sentence);
    if (motion) {
      dispatch(stageActions.setLive2dMotion({ target: key, motion }));
    }
    if (expression) {
      dispatch(stageActions.setLive2dExpression({ target: key, expression }));
    }
    dispatch(setStage({ key: dispatchMap[pos], value: content }));
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
}
