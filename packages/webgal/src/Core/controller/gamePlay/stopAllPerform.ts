import { logger } from '@/Core/util/logger';

import { WebGAL } from '@/Core/WebGAL';

export const stopAllPerform = () => {
  logger.warn('清除所有演出');
  WebGAL.gameplay.performController.removeAllPerform();
};
