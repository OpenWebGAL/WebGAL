import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { IPerform } from '@/Core/controller/perform/performInterface';
import { RUNTIME_GAMEPLAY } from '@/Core/runtime/gamePlay';
import { logger } from '@/Core/util/etc/logger';
import { IResult, call } from '../util/pixiPerformManager/pixiPerformManager';

/**
 * 运行一段pixi演出
 * @param sentence
 */
export const pixi = (sentence: ISentence): IPerform => {
  const pixiPerformName = 'PixiPerform' + sentence.content;
  RUNTIME_GAMEPLAY.performList.forEach((e) => {
    if (e.performName === pixiPerformName) {
      return {
        performName: 'none',
        duration: 0,
        isOver: false,
        isHoldOn: true,
        stopFunction: () => {},
        blockingNext: () => false,
        blockingAuto: () => false,
        stopTimeout: undefined, // 暂时不用，后面会交给自动清除
      };
    }
  });
  const res: IResult = call(sentence.content);
  const { container, tickerKey } = res;

  return {
    performName: pixiPerformName,
    duration: 0,
    isOver: false,
    isHoldOn: true,
    stopFunction: () => {
      logger.warn('现在正在卸载pixi演出');
      container.destroy({ texture: true, baseTexture: true });
      RUNTIME_GAMEPLAY.pixiStage?.effectsContainer.removeChild(container);
      RUNTIME_GAMEPLAY.pixiStage?.removeAnimation(tickerKey);
    },
    blockingNext: () => false,
    blockingAuto: () => false,
    stopTimeout: undefined, // 暂时不用，后面会交给自动清除
  };
};
