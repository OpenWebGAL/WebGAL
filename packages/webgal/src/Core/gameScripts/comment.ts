import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { createNonePerform, IPerform } from '@/Core/Modules/perform/performInterface';
import { logger } from '@/Core/util/logger';

/**
 * 注释，打LOG
 * @param sentence
 */
export const comment = (sentence: ISentence): IPerform => {
  logger.debug(`脚本内注释${sentence.content}`);
  return createNonePerform();
};
