import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { IPerform } from '@/Core/Modules/perform/performInterface';
import cloneDeep from 'lodash/cloneDeep';
import isEqual from 'lodash/isEqual';
import {
  getBooleanArgByKey,
  getFigurePositionFromArgs,
  getNumberArgByKey,
  getStringArgByKey,
} from '@/Core/util/getSentenceArg';
import { figureStateKeyByPosition, IFreeFigure, normalizeFigureBounds } from '@/Core/Modules/stage/stageInterface';
import { AnimationFrame, IUserAnimation } from '@/Core/Modules/animations';
import { generateTransformAnimationObj } from '@/Core/controller/stage/pixi/animations/generateTransformAnimationObj';
import { generateTimelineObj } from '@/Core/controller/stage/pixi/animations/timeline';
import { assetSetter, fileType } from '@/Core/util/gameAssetsAccess/assetSetter';
import { logger } from '@/Core/util/logger';
import { applyAnimationEndState, getAnimateDuration } from '@/Core/Modules/animationFunctions';
import { WebGAL } from '@/Core/WebGAL';
import { baseBlinkParam, baseFocusParam, BlinkParam, FocusParam } from '@/Core/live2DCore';
import { DEFAULT_FIG_IN_DURATION, DEFAULT_FIG_OUT_DURATION, WEBGAL_NONE } from '../constants';
import { stageStateManager } from '@/Core/Modules/stage/stageStateManager';
import { parseTransformFrame } from './parseTransformFrame';
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
  const pos = getFigurePositionFromArgs(sentence) || 'center';

  // id 与 自由立绘
  let key = getStringArgByKey(sentence, 'id') ?? '';
  const isFreeFigure = key ? true : false;
  const id = key ? key : `fig-${pos}`;

  // live2d 或 spine 相关
  let motion = getStringArgByKey(sentence, 'motion') ?? '';
  const skin = getStringArgByKey(sentence, 'skin') ?? '';
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
  let blendMode = getStringArgByKey(sentence, 'blendMode');
  const enterDuration = getNumberArgByKey(sentence, 'enterDuration') ?? duration;
  duration = enterDuration;
  const exitDuration = getNumberArgByKey(sentence, 'exitDuration') ?? DEFAULT_FIG_OUT_DURATION;
  const ignoreDefault = getBooleanArgByKey(sentence, 'ignoreDefault') ?? false;

  const currentFigureAssociatedAnimation = stageStateManager.getCalculationStageState().figureAssociatedAnimation;
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
  stageStateManager.setStage('figureAssociatedAnimation', filteredFigureAssociatedAnimation);

  /**
   * 立绘的身份：图片地址、基准位置、Live2D 绘制范围。
   *
   * 这三者只在创建舞台对象时落地，事后无法就地修改，所以身份一变就是「关掉旧立绘、开一个新的」，
   * 判定口径与 syncFigureSlot 保持一致。位置立绘的位置已经编码在 key 里，无需再比。
   * 未写 -bounds 的语句沿用旧绘制范围，不算身份变化。
   */
  const currentState = stageStateManager.getCalculationStageState();
  const currentBounds = currentState.live2dMotion.find((e) => e.target === id)?.overrideBounds;
  const isBoundsChanged =
    !!boundsFromArgs && !isEqual(normalizeFigureBounds(bounds), normalizeFigureBounds(currentBounds));
  let isIdentityChanged = true;
  if (key !== '') {
    const figWithKey = currentState.freeFigure.find((e) => e.key === key);
    if (figWithKey && figWithKey.name === sentence.content && figWithKey.basePosition === pos && !isBoundsChanged) {
      isIdentityChanged = false;
    }
  } else if (currentState[figureStateKeyByPosition[pos]] === sentence.content && !isBoundsChanged) {
    isIdentityChanged = false;
  }
  /**
   * 处理 Effects
   *
   * 旧立绘的退场由提交阶段（syncFigureSlot）负责，这里只清演算状态，不碰舞台对象。
   */
  if (isIdentityChanged) {
    // 必须先卸载旧的动画演出：它的 stopFunction 会写回终态，晚于清空 effects 会把旧变换复活
    WebGAL.gameplay.performController.unmountPerform(`animation-${id}`, true);
    stageStateManager.removeEffectByTargetId(id);
    stageStateManager.removeAnimationSettingsByTarget(id);
  }
  const setAnimationNames = (key: string, sentence: ISentence) => {
    // 如果立绘被关闭了，那么就不用设置了
    if (content === '') {
      return;
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
      animationObj = generateTransformAnimationObj(key, frame, duration, ease, !ignoreDefault);
      // 因为是切换，必须把一开始的 alpha 改为 0
      animationObj[0].alpha = 0;
      const animationName = (Math.random() * 10).toString(16);
      const newAnimation: IUserAnimation = { name: animationName, effects: animationObj };
      WebGAL.animationManager.addAnimation(newAnimation);
      duration = getAnimateDuration(animationName);
      stageStateManager.updateAnimationSettings({ target: key, key: 'enterAnimationName', value: animationName });
    }

    function applyDefaultTransform() {
      // 应用默认的
      const frame = {};
      applyTransform(frame as AnimationFrame);
    }
    stageStateManager.updateAnimationSettings({
      target: key,
      key: 'enterAnimationIgnoreDefault',
      value: ignoreDefault,
    });

    if (enterAnimation) {
      stageStateManager.updateAnimationSettings({ target: key, key: 'enterAnimationName', value: enterAnimation });
      duration = getAnimateDuration(enterAnimation);
    }
    if (exitAnimation) {
      stageStateManager.updateAnimationSettings({ target: key, key: 'exitAnimationName', value: exitAnimation });
      stageStateManager.updateAnimationSettings({
        target: key,
        key: 'exitAnimationIgnoreDefault',
        value: ignoreDefault,
      });
      duration = getAnimateDuration(exitAnimation);
    }
    if (enterDuration >= 0) {
      stageStateManager.updateAnimationSettings({ target: key, key: 'enterDuration', value: enterDuration });
    }
    if (exitDuration >= 0) {
      stageStateManager.updateAnimationSettings({ target: key, key: 'exitDuration', value: exitDuration });
    }
  };

  function postFigureStateSet() {
    if (isIdentityChanged) {
      // 当身份发生变化时，即发生新立绘替换
      // 应当赋予一些参数以默认值，防止从旧立绘的状态获取数据
      bounds = normalizeFigureBounds(bounds);
      blink = blink ?? cloneDeep(baseBlinkParam);
      focus = focus ?? cloneDeep(baseFocusParam);
      zIndex = Math.max(zIndex, 0);
      blendMode = blendMode ?? 'normal';
      stageStateManager.setLive2dMotion({ target: key, motion, skin, overrideBounds: bounds });
      stageStateManager.setLive2dExpression({ target: key, expression });
      stageStateManager.setLive2dBlink({ target: key, blink });
      stageStateManager.setLive2dFocus({ target: key, focus });
      stageStateManager.setFigureMetaData([key, 'zIndex', zIndex, false]);
      stageStateManager.setFigureMetaData([key, 'blendMode', blendMode, false]);
    } else {
      // 当身份没有发生变化时，即没有新立绘替换
      // 应当保留旧立绘的状态，仅在需要时更新
      if (motion || skin || bounds) {
        stageStateManager.setLive2dMotion({ target: key, motion, skin, overrideBounds: bounds });
      }
      if (expression) {
        stageStateManager.setLive2dExpression({ target: key, expression });
      }
      if (blink) {
        stageStateManager.setLive2dBlink({ target: key, blink });
      }
      if (focus) {
        stageStateManager.setLive2dFocus({ target: key, focus });
      }
      if (zIndex >= 0) {
        stageStateManager.setFigureMetaData([key, 'zIndex', zIndex, false]);
      }
      if (blendMode) {
        stageStateManager.setFigureMetaData([key, 'blendMode', blendMode, false]);
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
    stageStateManager.setFreeFigureByKey(freeFigureItem);
  } else {
    /**
     * 下面的代码是设置与位置关联的立绘的
     */
    key = `fig-${pos}`;
    setAnimationNames(key, sentence);
    postFigureStateSet();
    stageStateManager.setStage(figureStateKeyByPosition[pos], content);
  }

  /**
   * 入场动画
   *
   * 终态在演算期写入 effects，演出只负责视觉过渡，因此不需要任何延迟结算。
   * 与 setTransform 共用 `animation-${key}` 演出名，同目标的动画冲突由演出去重统一裁决。
   */
  const isEntering = isIdentityChanged && content !== '';
  const enterAnimationSetting = isEntering
    ? stageStateManager.getCalculationStageState().animationSettings.find((setting) => setting.target === key)
    : undefined;
  const enterAnimationName = enterAnimationSetting?.enterAnimationName;
  const enterAnimationTimeline = enterAnimationName
    ? applyAnimationEndState(
        enterAnimationName,
        key,
        false,
        !(enterAnimationSetting?.enterAnimationIgnoreDefault ?? false),
      )
    : null;
  const enterAnimationDuration = enterAnimationName ? getAnimateDuration(enterAnimationName) : 0;
  const enterAnimationKey = `${key}-softin`;

  return {
    performName: isEntering ? `animation-${key}` : `enter-${key}`,
    duration,
    isHoldOn: false,
    startFunction: () => {
      if (!enterAnimationTimeline || WebGAL.gameplay.skipAnimation) return;
      const animationObject = generateTimelineObj(enterAnimationTimeline, key, enterAnimationDuration);
      WebGAL.gameplay.pixiStage?.registerAnimation(animationObject, enterAnimationKey, key);
    },
    stopFunction: () => {
      WebGAL.gameplay.pixiStage?.removeAnimation(enterAnimationKey);
    },
    blockingNext: () => false,
    blockingAuto: () => true,
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
