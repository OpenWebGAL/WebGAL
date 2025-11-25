import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { IPerform } from '@/Core/Modules/perform/performInterface';
import { webgalStore } from '@/store/store';
import { setStage, stageActions } from '@/store/stageReducer';
import cloneDeep from 'lodash/cloneDeep';
import { getBooleanArgByKey, getNumberArgByKey, getStringArgByKey } from '@/Core/util/getSentenceArg';
import { IFreeFigure, IStageState, ITransform } from '@/store/stageInterface';
import { AnimationFrame, IUserAnimation } from '@/Core/Modules/animations';
import { generateTransformAnimationObj } from '@/Core/controller/stage/pixi/animations/generateTransformAnimationObj';
import { assetSetter, fileType } from '@/Core/util/gameAssetsAccess/assetSetter';
import { logger } from '@/Core/util/logger';
import { getAnimateDuration } from '@/Core/Modules/animationFunctions';
import { WebGAL } from '@/Core/WebGAL';
import { baseBlinkParam, baseFocusParam, BlinkParam, FocusParam } from '@/Core/live2DCore';
import { DEFAULT_FIG_IN_DURATION, DEFAULT_FIG_OUT_DURATION, WEBGAL_NONE } from '../constants';
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
  let key = getStringArgByKey(sentence, 'id') ?? '';
  const isFreeFigure = key ? true : false;
  const id = key ? key : `fig-${pos}`;

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
  const transformString = getStringArgByKey(sentence, 'transform');
  const ease = getStringArgByKey(sentence, 'ease') ?? '';
  let duration = getNumberArgByKey(sentence, 'duration') ?? DEFAULT_FIG_IN_DURATION;
  const enterAnimation = getStringArgByKey(sentence, 'enter');
  const exitAnimation = getStringArgByKey(sentence, 'exit');
  let zIndex = getNumberArgByKey(sentence, 'zIndex') ?? -1;
  const enterDuration = getNumberArgByKey(sentence, 'enterDuration') ?? duration;
  duration = enterDuration;
  const exitDuration = getNumberArgByKey(sentence, 'exitDuration') ?? DEFAULT_FIG_OUT_DURATION;

  const dispatch = webgalStore.dispatch;

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
  let isUrlChanged = true;
  if (key !== '') {
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
  /**
   * 处理 Effects
   */
  if (isUrlChanged) {
    webgalStore.dispatch(stageActions.removeEffectByTargetId(id));
    webgalStore.dispatch(stageActions.removeAnimationSettingsByTarget(id));
    const oldStageObject = WebGAL.gameplay.pixiStage?.getStageObjByKey(id);
    if (oldStageObject) {
      oldStageObject.isExiting = true;
    }
  }
  const setAnimationNames = (key: string, sentence: ISentence) => {
    // 处理 transform 和 默认 transform
    let animationObj: AnimationFrame[];
    if (transformString) {
      console.log(transformString);
      try {
        const frame = JSON.parse(transformString) as AnimationFrame;
        animationObj = generateTransformAnimationObj(key, frame, duration, ease);
        // 因为是切换，必须把一开始的 alpha 改为 0
        animationObj[0].alpha = 0;
        const animationName = (Math.random() * 10).toString(16);
        const newAnimation: IUserAnimation = { name: animationName, effects: animationObj };
        WebGAL.animationManager.addAnimation(newAnimation);
        duration = getAnimateDuration(animationName);
        webgalStore.dispatch(
          stageActions.updateAnimationSettings({ target: key, key: 'enterAnimationName', value: animationName }),
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
      animationObj = generateTransformAnimationObj(key, frame as AnimationFrame, duration, ease);
      // 因为是切换，必须把一开始的 alpha 改为 0
      animationObj[0].alpha = 0;
      const animationName = (Math.random() * 10).toString(16);
      const newAnimation: IUserAnimation = { name: animationName, effects: animationObj };
      WebGAL.animationManager.addAnimation(newAnimation);
      duration = getAnimateDuration(animationName);
      webgalStore.dispatch(
        stageActions.updateAnimationSettings({ target: key, key: 'enterAnimationName', value: animationName }),
      );
    }

    if (enterAnimation) {
      webgalStore.dispatch(
        stageActions.updateAnimationSettings({ target: key, key: 'enterAnimationName', value: enterAnimation }),
      );
      duration = getAnimateDuration(enterAnimation);
    }
    if (exitAnimation) {
      webgalStore.dispatch(
        stageActions.updateAnimationSettings({ target: key, key: 'exitAnimationName', value: exitAnimation }),
      );
      duration = getAnimateDuration(exitAnimation);
    }
    if (enterDuration >= 0) {
      webgalStore.dispatch(
        stageActions.updateAnimationSettings({ target: key, key: 'enterDuration', value: enterDuration }),
      );
    }
    if (exitDuration >= 0) {
      webgalStore.dispatch(
        stageActions.updateAnimationSettings({ target: key, key: 'exitDuration', value: exitDuration }),
      );
    }
  };

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
    setAnimationNames(key, sentence);
    postFigureStateSet();
    dispatch(stageActions.setFreeFigureByKey(freeFigureItem));
  } else {
    /**
     * 下面的代码是设置与位置关联的立绘的
     */
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
