/**
 * 扫描子场景
 * @param content 语句内容
 * @return {Array<string>} 子场景列表
 */
import { commandType } from '../interface/sceneInterface';

export const subSceneScanner = (
  command: commandType,
  content: string,
): Array<string> => {
  const subSceneList: Array<string> = [];
  if (
    command === commandType.changeScene ||
    command === commandType.callScene
  ) {
    subSceneList.push(content);
  }
  if (command === commandType.choose) {
    const chooseList = content.split('|');
    const chooseValue = chooseList.map((e) => e.split(':')[1] ?? '');
    chooseValue.forEach((e) => {
      if (e.match(/\./)) {
        subSceneList.push(e);
      }
    });
  }
  return subSceneList;
};
