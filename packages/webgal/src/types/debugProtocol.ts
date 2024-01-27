import { IStageState } from '@/store/stageInterface';

export enum DebugCommand {
  // 跳转
  JUMP,
  // 同步自客户端
  SYNCFC,
  // 同步自编辑器
  SYNCFE,
  // 执行指令
  EXE_COMMAND,
}

export interface IDebugMessage {
  command: DebugCommand;
  sceneMsg: {
    sentence: number;
    scene: string;
  };
  message: string;
  stageSyncMsg: IStageState;
}
