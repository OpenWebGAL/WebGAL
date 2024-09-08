import { EnhancedNode } from '@/Stage/TextBox/TextBox';

export interface ITextboxProps {
  textArray: EnhancedNode[][];
  textDelay: number;
  currentConcatDialogPrev: string;
  currentDialogKey: string;
  isText: boolean;
  isSafari: boolean;
  isFirefox: boolean;
  fontSize: string;
  miniAvatar: string;
  showName: EnhancedNode[][];
  isHasName: boolean;
  font: string;
  textDuration: number;
  textSizeState: number;
  lineLimit: number;
  isUseStroke: boolean;
  textboxOpacity: number;
}
