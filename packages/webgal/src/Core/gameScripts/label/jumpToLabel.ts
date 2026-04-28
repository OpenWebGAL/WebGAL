import { commandType } from '@/Core/controller/scene/sceneInterface';
import { WebGAL } from '@/Core/WebGAL';

export const jumpToLabel = (labelName: string) => {
  const currentLine = WebGAL.sceneManager.sceneData.currentSentenceId;
  let targetLine = -1;
  WebGAL.sceneManager.sceneData.currentScene.sentenceList.forEach((sentence, index) => {
    if (sentence.command === commandType.label && sentence.content === labelName && index !== currentLine) {
      targetLine = index;
    }
  });
  if (targetLine < 0) {
    return false;
  }
  WebGAL.sceneManager.sceneData.currentSentenceId = targetLine;
  return true;
};
