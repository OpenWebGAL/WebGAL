import { nextSentence } from '@/Core/controller/gamePlay/nextSentence';
import { jumpToLabel } from '@/Core/gameScripts/label/jumpToLabel';

export const jmp = (labelName: string, autoNext = true) => {
  const isJumped = jumpToLabel(labelName);
  if (isJumped && autoNext) {
    setTimeout(nextSentence, 1);
  }
};
