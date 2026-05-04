import { commandType, ISentence } from '@/Core/controller/scene/sceneInterface';
import { createNonePerform, IPerform } from '@/Core/Modules/perform/performInterface';
import { logger } from '@/Core/util/logger';

import { WebGAL } from '@/Core/WebGAL';
import { stageStateManager } from '@/Core/Modules/stage/stageStateManager';

/**
 * 初始化pixi
 * @param sentence
 */
export const pixiInit = (sentence: ISentence): IPerform => {
  logger.warn('pixi 被脚本重新初始化');
  WebGAL.gameplay.performController.unmountPerformByPrefix('PixiPerform', true);
  stageStateManager.removeAllPixiPerforms();
  return createNonePerform();
};
