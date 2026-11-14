import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { figureStateKeyByPosition, FIGURE_POSITIONS } from '@/Core/Modules/stage/stageInterface';
import { stageStateManager } from '@/Core/Modules/stage/stageStateManager';
import { createNonePerform, IPerform } from '@/Core/Modules/perform/performInterface';
import { getFigurePositionFromArgs, getStringArgByKey } from '@/Core/util/getSentenceArg';
import { logger } from '@/Core/util/logger';
import { WebGAL } from '@/Core/WebGAL';
import { DEFAULT_FIG_IN_DURATION, WEBGAL_NONE } from '@/Core/constants';
import { generateUniversalSoftInAnimationObj } from '@/Core/controller/stage/pixi/animations/universalSoftIn';
import { applyTransformToPixiContainer } from '@/Core/controller/stage/pixi/stageEffectTransform';
import { stageResource } from '@/Core/controller/stage/pixi/assets/resourceTypes';
import { changeFigure } from './changeFigure';
import { FIGURE_ASSOCIATED_ARGS, setFigureAssociatedAnimation } from './figureAssociatedAnimation';

// 差分只换图片及与之配套的口型眨眼图；变换、动画、模型等参数属于 changeFigure。
const diffArgs = new Set<string>(['id', 'next', 'continue', 'when', ...FIGURE_POSITIONS, ...FIGURE_ASSOCIATED_ARGS]);

// Live2D、Spine 用内置的表情与动作系统，不属于图片差分。
const isModel = (url: string) => stageResource(url).kind !== 'texture';

/**
 * 同一立绘的差分替换（如换表情），与换立绘的 changeFigure 区分：
 * 只改图片地址，变换、层级、混合模式与入退场设置都保留；
 * 口型眨眼图随表情整体替换为本句参数。
 * 上屏时优先混合；条件不满足时退回淡出淡入，同样不重置立绘状态。
 */
export function changeFigureDiff(sentence: ISentence): IPerform {
  const position = getFigurePositionFromArgs(sentence) || 'center';
  const id = getStringArgByKey(sentence, 'id');
  const key = id || `fig-${position}`;
  const state = stageStateManager.getCalculationStageState();
  const freeFigure = id ? state.freeFigure.find((figure) => figure.key === id) : undefined;
  const source = id ? freeFigure?.name : state[figureStateKeyByPosition[position]];
  const target = sentence.content;
  if ([source, target].some((url) => url && url !== WEBGAL_NONE && isModel(url))) {
    logger.warn(`changeFigureDiff 不适用于 Live2D 与 Spine，本句不执行：${target}`);
    return createNonePerform();
  }
  // 没有可替换的立绘或要移除立绘时，不存在差分，按普通换图的语义处理。
  if (!source || !target || target === WEBGAL_NONE) return changeFigure(sentence);
  const ignoredArgs = sentence.args.filter((arg) => !diffArgs.has(arg.key)).map((arg) => arg.key);
  if (ignoredArgs.length) logger.warn(`changeFigureDiff 只替换图片，已忽略参数：${ignoredArgs.join(', ')}`);
  // 旧表情的口型眨眼图不再适用，换成本句参数；舞台侧会丢弃仍在进行的旧口型眨眼。
  setFigureAssociatedAnimation(sentence, key);
  // 已是目标图片时无需替换，也不能对现有对象补淡入。
  if (source === target) return createNonePerform();

  if (freeFigure) stageStateManager.setFreeFigureByKey({ ...freeFigure, name: target });
  else stageStateManager.setStage(figureStateKeyByPosition[position], target);
  // 标记只决定上屏时采用混合还是淡出淡入，不进入存档。
  WebGAL.figureDiffManager.mark(key, { sourceUrl: source, targetUrl: target });

  return createDiffPerform(key);
}

/** 混合动画由提交时的舞台同步注册；未能混合时由本演出为新对象补淡入。 */
function createDiffPerform(key: string): IPerform {
  const softInKey = `${key}-softin`;
  return {
    // 并行式命名：登记时不会去重掉同目标已有的动画演出；
    // 之后同目标的非并行 setTransform、setAnimation、changeFigure 会按前缀接管并移除本演出，
    // 此时 updateEffect 已清除差分标记，上屏走回退，淡入随本演出一起取消。
    performName: `animation-${key}#diff`,
    duration: DEFAULT_FIG_IN_DURATION,
    isHoldOn: false,
    startFunction: () => {
      const stage = WebGAL.gameplay.pixiStage;
      // 提交时已注册混合动画就直接沿用；否则为新建的对象补一个只改透明度的淡入。
      if (!stage || WebGAL.gameplay.skipAnimation || stage.hasAnimation(softInKey)) return;
      const container = stage.getStageObjByKey(key)?.pixiContainer;
      if (!container) return;
      // 动画期间对象被锁定，不接收 effects，因此先落地保留下来的变换。
      const effect = stageStateManager.getViewStageState().effects.find((item) => item.target === key);
      applyTransformToPixiContainer(container, effect?.transform);
      container.alphaFilterVal = 0;
      stage.registerAnimation(generateUniversalSoftInAnimationObj(key, DEFAULT_FIG_IN_DURATION), softInKey, key);
    },
    stopFunction: () => {
      WebGAL.gameplay.pixiStage?.removeAnimation(softInKey);
    },
    blockingNext: () => false,
    blockingAuto: () => true,
  };
}
