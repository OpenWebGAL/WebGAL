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
  // 重新拉取模板样式文件
  REFETCH_TEMPLATE_FILES,
  // 返回主界面
  SET_COMPONENT_VISIBILITY,
  // 临时场景
  TEMP_SCENE,
  // 字体优化
  FONT_OPTIMIZATION,
}

export interface IDebugMessage {
  event: string;
  data: {
    command: DebugCommand;
    sceneMsg: {
      sentence: number;
      scene: string;
    };
    message: string;
    stageSyncMsg: IStageState;
  };
}

export interface IComponentsVisibility {
  showStarter: boolean; // 是否显示初始界面（用于使得bgm可以播放)
  showTitle: boolean; // 是否显示标题界面
  showMenuPanel: boolean; // 是否显示Menu界面
  showTextBox: boolean;
  showControls: boolean;
  controlsVisibility: boolean;
  showBacklog: boolean;
  showExtra: boolean;
  showGlobalDialog: boolean;
  showPanicOverlay: boolean;
  isEnterGame: boolean;
  isShowLogo: boolean;
}

export interface IComponentVisibilityCommand {
  component: keyof IComponentsVisibility;
  visibility: boolean;
}
