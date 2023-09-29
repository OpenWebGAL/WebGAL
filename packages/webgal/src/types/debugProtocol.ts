import { IStageState } from '@/store/stageInterface';

export enum DebugCommand {
  // 跳转
  JUMP,
  // 同步自客户端
  SYNCFC,
  // 同步自编辑器
  SYNCFE,
}

export interface IDebugMessage {
  command: DebugCommand;
  sceneMsg: {
    sentence: number;
    scene: string;
  };
  stageSyncMsg: IStageState;
}
