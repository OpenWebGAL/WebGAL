import type { IStageState } from './stageInterface';

type DialogText = Pick<IStageState, 'showText' | 'currentConcatDialogPrev' | 'currentDialogSegments'>;

/** 分段随舞台保存；旧存档按已知前缀恢复，其他命令替换全文后不沿用过期分段。 */
export function getDialogSegments({ showText, currentConcatDialogPrev, currentDialogSegments }: DialogText): string[] {
  if (currentDialogSegments?.join('') === showText) return currentDialogSegments;
  if (currentConcatDialogPrev && showText.startsWith(currentConcatDialogPrev)) {
    return [currentConcatDialogPrev, showText.slice(currentConcatDialogPrev.length)];
  }
  return [showText];
}
