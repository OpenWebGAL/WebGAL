import { continueSentence } from '@/Core/controller/gamePlay/nextSentence';
import { jumpToLabel } from '@/Core/gameScripts/label/jumpToLabel';
import type { IStageCommitOptions } from '@/Core/Modules/stage/stageStateManager';

export const jmp = (labelName: string, autoNext = true, commitOptions: IStageCommitOptions = {}) => {
  const isJumped = jumpToLabel(labelName);
  if (isJumped && autoNext) {
    setTimeout(() => continueSentence(commitOptions), 1);
  }
};
