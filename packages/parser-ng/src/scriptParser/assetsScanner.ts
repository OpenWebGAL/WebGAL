import { arg, commandType, IAsset } from '../interface/sceneInterface';
import { fileType } from '../interface/assets';

/**
 * 根据语句类型、语句内容、参数列表，扫描该语句可能携带的资源
 * @param command 语句类型
 * @param content 语句内容
 * @param args 参数列表
 * @return {Array<IAsset>} 语句携带的参数列表
 */
export const assetsScanner = (
  command: commandType,
  content: string,
  args: Array<arg>,
): Array<IAsset> => {
  let hasVocalArg = false;
  const returnAssetsList: Array<IAsset> = [];
  if (command === commandType.say) {
    args.forEach((e) => {
      if (e.key === 'vocal') {
        hasVocalArg = true;
        returnAssetsList.push({
          name: e.value as string,
          url: e.value as string,
          lineNumber: 0,
          type: fileType.vocal,
        });
      }
    });
  }
  if (content === 'none' || content === '') {
    return returnAssetsList;
  }
  // 处理语句携带的资源
  if (command === commandType.changeBg) {
    returnAssetsList.push({
      name: content,
      url: content,
      lineNumber: 0,
      type: fileType.background,
    });
  }
  if (command === commandType.changeFigure) {
    returnAssetsList.push({
      name: content,
      url: content,
      lineNumber: 0,
      type: fileType.figure,
    });
  }
  if (command === commandType.miniAvatar) {
    returnAssetsList.push({
      name: content,
      url: content,
      lineNumber: 0,
      type: fileType.figure,
    });
  }
  if (command === commandType.video) {
    returnAssetsList.push({
      name: content,
      url: content,
      lineNumber: 0,
      type: fileType.video,
    });
  }
  if (command === commandType.bgm) {
    returnAssetsList.push({
      name: content,
      url: content,
      lineNumber: 0,
      type: fileType.bgm,
    });
  }
  return returnAssetsList;
};
