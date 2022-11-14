import { RUNTIME_SCENE_DATA } from '@/Core/runtime/sceneData';
import { commandType } from '@/Core/controller/scene/sceneInterface';
import { nextSentence } from '@/Core/controller/gamePlay/nextSentence';

export const jmp = (labelName: string) => {
  // 在当前场景中找到指定的标签。
  const currentLine = RUNTIME_SCENE_DATA.currentSentenceId;
  let result = currentLine;
  RUNTIME_SCENE_DATA.currentScene.sentenceList.forEach((sentence, index) => {
    if (sentence.command === commandType.label && sentence.content === labelName && index >= currentLine) {
      result = index;
    }
  });
  RUNTIME_SCENE_DATA.currentSentenceId = result;
  setTimeout(nextSentence, 1);
};
