import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { IPerform } from '@/Core/controller/perform/performInterface';
import { RUNTIME_GAMEPLAY } from '@/Core/runtime/gamePlay';
import pixiRain from './pixiPerformScripts/rain';
import { pixiSnow } from '@/Core/gameScripts/pixiPerformScripts/snow';
import { logger } from '@/Core/util/etc/logger';

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
  let container: any;
  let tickerKey: any;
  let res: any;
  switch (sentence.content) {
    case 'rain':
      res = pixiRain(6, 10);
      container = res.container;
      tickerKey = res.tickerKey;
      break;
    case 'snow':
      res = pixiSnow(3);
      container = res.container;
      tickerKey = res.tickerKey;
      break;
  }
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
