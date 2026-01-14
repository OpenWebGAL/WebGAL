import { IGameVar } from '@/store/stageInterface';

export {};

declare global {
  interface Window {
    gameConfigInit?: IGameVar;
  }
}
