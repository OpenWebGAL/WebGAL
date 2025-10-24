import { EnhancedNode } from '@/Stage/TextBox/TextBox';
import { textSize } from '@/store/userDataInterface';

export interface ITextboxProps {
  textArray: EnhancedNode[][];
  textDelay: number;
  currentConcatDialogPrev: string;
  currentDialogKey: string;
  isText: boolean;
  isSafari: boolean;
  isFirefox: boolean;
  miniAvatar: string;
  showName: EnhancedNode[][];
  isHasName: boolean;
  font: string;
  textDuration: number;
  textSizeState: textSize;
  isUseStroke: boolean;
  textboxOpacity: number;
}
