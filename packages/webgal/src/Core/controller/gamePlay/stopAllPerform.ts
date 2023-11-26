import { logger } from '@/Core/util/logger';

import { WebGAL } from '@/Core/WebGAL';

export const stopAllPerform = () => {
  logger.warn('清除所有演出');
  for (let i = 0; i < WebGAL.gameplay.performController.performList.length; i++) {
    const e = WebGAL.gameplay.performController.performList[i];
    e.stopFunction();
    clearTimeout(e.stopTimeout as unknown as number);
    WebGAL.gameplay.performController.performList.splice(i, 1);
    i--;
  }
};
