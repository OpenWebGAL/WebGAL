import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { IPerform } from '@/Core/Modules/perform/performInterface';
import { WebGAL } from '@/Core/WebGAL';
import { logger } from '@/Core/util/logger';
import { getStringArgByKey } from '@/Core/util/getSentenceArg';
import { WEBGAL_NONE } from '../constants';

/**
 * Unlocks a Steam achievement via the renderer → Electron bridge.
 * The script expects the first positional parameter to be the achievement id.
 */
export const callSteam = (sentence: ISentence): IPerform => {
  for (const arg of sentence.args) {
    if (arg.key === 'achievementId') {
      const achievementId = getStringArgByKey(sentence, 'achievementId');
      if (achievementId) {
        WebGAL.steam
          .unlockAchievement(achievementId)
          .then((result) => {
            logger.info(`callSteam: achievement ${achievementId} unlock ${result ? 'succeeded' : 'failed'}`);
          })
          .catch((error) => {
            logger.error(`callSteam: achievement ${achievementId} unlock threw`, error);
          });
      }
    }
  }
  const noperform: IPerform = {
    performName: WEBGAL_NONE,
    duration: 0,
    isHoldOn: false,
    stopFunction: () => {},
    blockingNext: () => false,
    blockingAuto: () => true,
    stopTimeout: undefined,
  };

  return noperform;
};
