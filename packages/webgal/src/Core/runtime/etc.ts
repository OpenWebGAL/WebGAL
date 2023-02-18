/**
 * 其他运行时临时变量
 */
import { ITransform } from '@/store/stageInterface';

export const RUNTIME_GAME_INFO = {
  gameName: '',
  gameKey: '',
};

// export const RUNTIME_ETC = {
//   // 剩余的预加载场景数
//   currentPreloadRemainingSceneCount: 2,
// };

export interface IUserAnimation {
  name: string;
  effects: Array<ITransform & { duration: number }>;
}

export const RUNTIME_SETTLED_SCENES: Array<string> = [];
export const RUNTIME_SETTLED_ASSETS: Array<string> = [];
export const RUNTIME_USER_ANIMATIONS: Array<IUserAnimation> = [];
