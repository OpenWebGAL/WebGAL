import { ReactNode } from 'react';

export interface ITextboxProps {
  textArray: ReactNode[];
  textDelay: number;
  currentConcatDialogPrev: string;
  currentDialogKey: string;
  isText: boolean;
  isSafari: boolean;
  isFirefox: boolean;
  fontSize: string;
  miniAvatar: string;
  showName: string;
  font: string;
  textDuration: number;
  textSizeState: number;
  lineLimit: number;
  isUseStroke: boolean;
  textboxOpacity: number;
}
