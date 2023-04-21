import { logger } from '@/Core/util/etc/logger';
import { RUNTIME_GAMEPLAY } from '@/Core/runtime/gamePlay';

export const stopAllPerform = () => {
  logger.warn('清除所有演出');
  for (let i = 0; i < RUNTIME_GAMEPLAY.performList.length; i++) {
    const e = RUNTIME_GAMEPLAY.performList[i];
    e.stopFunction();
    clearTimeout(e.stopTimeout as unknown as number);
    RUNTIME_GAMEPLAY.performList.splice(i, 1);
    i--;
  }
};
