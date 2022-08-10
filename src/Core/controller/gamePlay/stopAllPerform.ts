import { logger } from '@/Core/util/etc/logger';
import { runtime_gamePlay } from '@/Core/runtime/gamePlay';

export const stopAllPerform = () => {
  logger.warn('清除所有演出');
  for (let i = 0; i < runtime_gamePlay.performList.length; i++) {
    const e = runtime_gamePlay.performList[i];
    e.stopFunction();
    clearTimeout(e.stopTimeout);
    runtime_gamePlay.performList.splice(i, 1);
    i--;
  }
};
