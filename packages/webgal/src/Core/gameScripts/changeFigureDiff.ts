import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { figureStateKeyByPosition, FIGURE_POSITIONS } from '@/Core/Modules/stage/stageInterface';
import { stageStateManager } from '@/Core/Modules/stage/stageStateManager';
import { getFigurePositionFromArgs, getStringArgByKey } from '@/Core/util/getSentenceArg';
import { WebGAL } from '@/Core/WebGAL';
import { changeFigure } from './changeFigure';
import { DEFAULT_FIG_OUT_DURATION } from '@/Core/constants';

// 只允许定位和流程参数；指定变换、动画或模型参数时，保留普通换图的完整语义。
const blendArgs = new Set<string>(['id', 'next', 'continue', 'when', ...FIGURE_POSITIONS]);

/** 状态更新完全复用普通换图；差分只是一项提交时可放弃的渲染优化。 */
export function changeFigureDiff(sentence: ISentence) {
  const position = getFigurePositionFromArgs(sentence) || 'center';
  const id = getStringArgByKey(sentence, 'id');
  const key = id || `fig-${position}`;
  const state = stageStateManager.getCalculationStageState();
  // 普通换图会覆盖源 URL 和退出设置，因此先记录这次替换的起点。
  const source = id
    ? state.freeFigure.find((figure) => figure.key === id)?.name
    : state[figureStateKeyByPosition[position]];
  const exit = state.animationSettings.find((setting) => setting.target === key);
  const customExit =
    exit?.exitAnimationName || (exit?.exitDuration ?? DEFAULT_FIG_OUT_DURATION) !== DEFAULT_FIG_OUT_DURATION;
  const perform = changeFigure(sentence);
  if (!source || customExit || !sentence.args.every((arg) => blendArgs.has(arg.key))) return perform;
  // 此时计算状态已是普通换图的结果；标记只决定上屏时采用哪一种过渡。
  WebGAL.figureDiffManager.mark(key, { sourceUrl: source, targetUrl: sentence.content });
  return {
    ...perform,
    startFunction: () => {
      // 提交时已注册混合动画就直接沿用；否则启动普通入场。结束仍由原演出负责。
      if (!WebGAL.gameplay.pixiStage?.hasAnimation(`${key}-softin`)) perform.startFunction?.();
    },
  };
}
