import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { stageStateManager } from '@/Core/Modules/stage/stageStateManager';
import { assetSetter, fileType } from '@/Core/util/gameAssetsAccess/assetSetter';
import { getStringArgByKey } from '@/Core/util/getSentenceArg';

/** 口型、眨眼差分参数，changeFigure 与 changeFigureDiff 共用 */
export const FIGURE_ASSOCIATED_ARGS = [
  'mouthOpen',
  'mouthClose',
  'mouthHalfOpen',
  'eyesOpen',
  'eyesClose',
  'animationFlag',
];

/**
 * 口型、眨眼图是与当前立绘图片配套的整张图，换立绘或换差分后旧图都不再适用，
 * 因此每次都按本句参数整体替换，未写的参数即为不启用。
 */
export function setFigureAssociatedAnimation(sentence: ISentence, targetId: string) {
  const figureArg = (key: string) => assetSetter(getStringArgByKey(sentence, key) ?? '', fileType.figure);
  const current = stageStateManager.getCalculationStageState().figureAssociatedAnimation;
  stageStateManager.setStage('figureAssociatedAnimation', [
    ...current.filter((item) => item.targetId !== targetId),
    {
      targetId,
      animationFlag: getStringArgByKey(sentence, 'animationFlag') ?? '',
      mouthAnimation: {
        open: figureArg('mouthOpen'),
        close: figureArg('mouthClose'),
        halfOpen: figureArg('mouthHalfOpen'),
      },
      blinkAnimation: { open: figureArg('eyesOpen'), close: figureArg('eyesClose') },
    },
  ]);
}
