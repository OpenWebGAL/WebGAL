import { IGamePlay } from '@/interface/coreInterface/runtimeInterface';

/**
 * 游戏运行时变量
 */
export const runtime_gamePlay: IGamePlay = {
  performList: [],
  timeoutList: [],
  isAuto: false,
  isFast: false,
  autoInterval: null,
  fastInterval: null,
  autoTimeout: null,
  currentPixi: null,
};
