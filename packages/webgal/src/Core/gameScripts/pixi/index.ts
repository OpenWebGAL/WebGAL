import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { IPerform } from '@/Core/Modules/perform/performInterface';
import { logger } from '@/Core/util/logger';
import { IResult, call } from '../../util/pixiPerformManager/pixiPerformManager';

import { WebGAL } from '@/Core/WebGAL';

/**
 * 运行一段pixi演出
 * @param sentence
 */
export const pixi = (sentence: ISentence): IPerform => {
  const pixiPerformName = 'PixiPerform' + sentence.content;
  let fg: IResult['fg'];
  let bg: IResult['bg'];

  return {
    performName: pixiPerformName,
    duration: 0,
    isHoldOn: true,
    startFunction: () => {
      const res: IResult = call(sentence.content);
      fg = res.fg;
      bg = res.bg;
    },
    stopFunction: () => {
      logger.warn('现在正在卸载pixi演出');
      if (fg) {
        fg.container.destroy({ texture: true, baseTexture: true });
        WebGAL.gameplay.pixiStage?.foregroundEffectsContainer.removeChild(fg.container);
        WebGAL.gameplay.pixiStage?.removeAnimation(fg.tickerKey);
      }
      if (bg) {
        bg.container.destroy({ texture: true, baseTexture: true });
        WebGAL.gameplay.pixiStage?.backgroundEffectsContainer.removeChild(bg.container);
        WebGAL.gameplay.pixiStage?.removeAnimation(bg.tickerKey);
      }
    },
    blockingNext: () => false,
    blockingAuto: () => false,
  };
};
