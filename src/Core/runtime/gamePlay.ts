import { IGamePlay } from '@/Core/runtime/runtimeInterface';

/**
 * 游戏运行时变量
 */
export const RUNTIME_GAMEPLAY: IGamePlay = {
  performList: [],
  timeoutList: [],
  isAuto: false,
  isFast: false,
  autoInterval: null,
  fastInterval: null,
  autoTimeout: null,
  pixiStage: null,
};
