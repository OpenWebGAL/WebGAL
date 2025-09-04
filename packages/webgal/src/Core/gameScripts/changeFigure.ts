import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { IPerform } from '@/Core/Modules/perform/performInterface';
import { webgalStore } from '@/store/store';
import { setStage, stageActions } from '@/store/stageReducer';
import cloneDeep from 'lodash/cloneDeep';
import { getBooleanArgByKey, getNumberArgByKey, getStringArgByKey } from '@/Core/util/getSentenceArg';
import { baseTransform, IFreeFigure, IStageState } from '@/store/stageInterface';
import { assetSetter, fileType } from '@/Core/util/gameAssetsAccess/assetSetter';
import { createEnterExitAnimation } from '@/Core/Modules/animationFunctions';
import { WebGAL } from '@/Core/WebGAL';
import { STAGE_KEYS } from '../constants';
import { baseBlinkParam, baseFocusParam, BlinkParam, FocusParam } from '@/Core/live2DCore';
import { DEFAULT_FADING_DURATION, WEBGAL_NONE } from '../constants';
import { logger } from '../util/logger';
/**
 * 更改立绘
 * @param sentence 语句
 */
// eslint-disable-next-line complexity
export function changeFigure(sentence: ISentence): IPerform {
  // 语句内容
  let content = sentence.content;
  if (content === WEBGAL_NONE) {
    content = '';
  }
  if (getBooleanArgByKey(sentence, 'clear')) {
    content = '';
  }

  // 根据参数设置指定位置
  let pos: 'center' | 'left' | 'right' = 'center';
  let mouthAnimationKey = 'mouthAnimation';
  let eyesAnimationKey = 'blinkAnimation';
  const leftFromArgs = getBooleanArgByKey(sentence, 'left') ?? false;
  const rightFromArgs = getBooleanArgByKey(sentence, 'right') ?? false;
  if (leftFromArgs) {
    pos = 'left';
    mouthAnimationKey = 'mouthAnimationLeft';
    eyesAnimationKey = 'blinkAnimationLeft';
  }
  if (rightFromArgs) {
    pos = 'right';
    mouthAnimationKey = 'mouthAnimationRight';
    eyesAnimationKey = 'blinkAnimationRight';
  }

  // id 与 自由立绘
  const idFromArgs = getStringArgByKey(sentence, 'id') ?? '';
  const isFreeFigure = idFromArgs ? true : false;
  let key = idFromArgs;
  if (!isFreeFigure) {
    const positionMap = {
      center: STAGE_KEYS.FIG_CENTER,
      left: STAGE_KEYS.FIG_LEFT,
      right: STAGE_KEYS.FIG_RIGHT,
    };
    key = positionMap[pos];
  }

  // live2d 或 spine 相关
  let motion = getStringArgByKey(sentence, 'motion') ?? '';
  let expression = getStringArgByKey(sentence, 'expression') ?? '';
  const boundsFromArgs = getStringArgByKey(sentence, 'bounds') ?? '';
  let bounds = getOverrideBoundsArr(boundsFromArgs);

  let blink: BlinkParam | null = null;
  const blinkFromArgs = getStringArgByKey(sentence, 'blink');
  if (blinkFromArgs) {
    try {
      blink = JSON.parse(blinkFromArgs) as BlinkParam;
    } catch (error) {
      logger.error('Failed to parse blink parameter:', error);
    }
  }

  let focus: FocusParam | null = null;
  const focusFromArgs = getStringArgByKey(sentence, 'focus');
  if (focusFromArgs) {
    try {
      focus = JSON.parse(focusFromArgs) as FocusParam;
    } catch (error) {
      logger.error('Failed to parse focus parameter:', error);
    }
  }

  // 图片立绘差分
  const mouthOpen = assetSetter(getStringArgByKey(sentence, 'mouthOpen') ?? '', fileType.figure);
  const mouthClose = assetSetter(getStringArgByKey(sentence, 'mouthClose') ?? '', fileType.figure);
  const mouthHalfOpen = assetSetter(getStringArgByKey(sentence, 'mouthHalfOpen') ?? '', fileType.figure);
  const eyesOpen = assetSetter(getStringArgByKey(sentence, 'eyesOpen') ?? '', fileType.figure);
  const eyesClose = assetSetter(getStringArgByKey(sentence, 'eyesClose') ?? '', fileType.figure);
  const animationFlag = getStringArgByKey(sentence, 'animationFlag') ?? '';

  // 其他参数
  let zIndex = getNumberArgByKey(sentence, 'zIndex') ?? -1;

  const dispatch = webgalStore.dispatch;

  const currentFigureAssociatedAnimation = webgalStore.getState().stage.figureAssociatedAnimation;
  const filteredFigureAssociatedAnimation = currentFigureAssociatedAnimation.filter((item) => item.targetId !== key);
  const newFigureAssociatedAnimationItem = {
    targetId: key,
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
  let isUrlChanged = true;
  if (isFreeFigure) {
    const figWithKey = webgalStore.getState().stage.freeFigure.find((e) => e.key === key);
    if (figWithKey) {
      if (figWithKey.name === sentence.content) {
        isUrlChanged = false;
      }
    }
  } else {
    if (pos === 'center') {
      if (webgalStore.getState().stage.figName === sentence.content) {
        isUrlChanged = false;
      }
    }
    if (pos === 'left') {
      if (webgalStore.getState().stage.figNameLeft === sentence.content) {
        isUrlChanged = false;
      }
    }
    if (pos === 'right') {
      if (webgalStore.getState().stage.figNameRight === sentence.content) {
        isUrlChanged = false;
      }
    }
  }

  // 储存一下现有的 transform 给退场动画当起始帧用, 因为马上就要清除了
  const currentEffect = webgalStore.getState().stage.effects.find((e) => e.target === key);
  let currentTransform = baseTransform;
  if (currentEffect?.transform) {
    currentTransform = cloneDeep(currentEffect.transform);
  }

  /**
   * 处理 Effects
   */
  if (isUrlChanged) {
    webgalStore.dispatch(stageActions.removeEffectByTargetId(key));
    const oldStageObject = WebGAL.gameplay.pixiStage?.getStageObjByKey(key);
    if (oldStageObject) {
      oldStageObject.isExiting = true;
    }
  }

  let duration = createEnterExitAnimation(sentence, key, DEFAULT_FADING_DURATION, currentTransform);

  function postFigureStateSet() {
    if (isUrlChanged) {
      // 当 url 发生变化时，即发生新立绘替换
      // 应当赋予一些参数以默认值，防止从旧立绘的状态获取数据
      // 并且关闭一些 hold 动画
      WebGAL.gameplay.performController.unmountPerform(`animation-${key}`, true);
      bounds = bounds ?? [0, 0, 0, 0];
      blink = blink ?? cloneDeep(baseBlinkParam);
      focus = focus ?? cloneDeep(baseFocusParam);
      zIndex = Math.max(zIndex, 0);
      dispatch(stageActions.setLive2dMotion({ target: key, motion, overrideBounds: bounds }));
      dispatch(stageActions.setLive2dExpression({ target: key, expression }));
      dispatch(stageActions.setLive2dBlink({ target: key, blink }));
      dispatch(stageActions.setLive2dFocus({ target: key, focus }));
      dispatch(stageActions.setFigureMetaData([key, 'zIndex', zIndex, false]));
    } else {
      // 当 url 没有发生变化时，即没有新立绘替换
      // 应当保留旧立绘的状态，仅在需要时更新
      if (motion || bounds) {
        dispatch(stageActions.setLive2dMotion({ target: key, motion, overrideBounds: bounds }));
      }
      if (expression) {
        dispatch(stageActions.setLive2dExpression({ target: key, expression }));
      }
      if (blink) {
        dispatch(stageActions.setLive2dBlink({ target: key, blink }));
      }
      if (focus) {
        dispatch(stageActions.setLive2dFocus({ target: key, focus }));
      }
      if (zIndex >= 0) {
        dispatch(stageActions.setFigureMetaData([key, 'zIndex', zIndex, false]));
      }
    }
  }

  if (isFreeFigure) {
    /**
     * 下面的代码是设置自由立绘的
     */
    const freeFigureItem: IFreeFigure = { key, name: content, basePosition: pos };
    postFigureStateSet();
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
    postFigureStateSet();
    dispatch(setStage({ key: dispatchMap[pos], value: content }));
  }

  return {
    performName: `enter-${key}`,
    duration,
    isHoldOn: false,
    stopFunction: () => {
      WebGAL.gameplay.pixiStage?.stopPresetAnimationOnTarget(key);
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
