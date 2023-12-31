import { commandType } from '@/Core/controller/scene/sceneInterface';
import { nextSentence } from '@/Core/controller/gamePlay/nextSentence';

import { WebGAL } from '@/Core/WebGAL';

export const jmp = (labelName: string) => {
  // 在当前场景中找到指定的标签。
  const currentLine = WebGAL.sceneManager.sceneData.currentSentenceId;
  let result = currentLine;
  WebGAL.sceneManager.sceneData.currentScene.sentenceList.forEach((sentence, index) => {
    if (sentence.command === commandType.label && sentence.content === labelName && index !== currentLine) {
      result = index;
    }
  });
  WebGAL.sceneManager.sceneData.currentSentenceId = result;
  setTimeout(nextSentence, 1);
};
