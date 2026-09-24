import { EnhancedNode } from '@/Stage/TextBox/TextBox';

export interface ITextboxProps {
  textArray: EnhancedNode[][];
  textDelay: number;
  // concat 继承的前缀所占的渲染节点数（拆字会合并单词与标点，不等于字符串长度）
  concatPrefixNodeCount: number;
  currentDialogKey: string;
  isRead: boolean;
  isText: boolean;
  isSafari: boolean;
  isFirefox: boolean;
  fontSize: string;
  miniAvatar: string;
  showName: EnhancedNode[][];
  isHasName: boolean;
  font: string;
  textDuration: number;
  textRevealEnd?: number; // 本句渐显的结束时间（毫秒），普通对话不限制
  textSizeState: number;
  lineLimit: number;
  isUseStroke: boolean;
  textboxOpacity: number;
}
