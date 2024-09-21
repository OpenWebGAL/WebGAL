import { commandType } from '../interface/sceneInterface';
import { fileType } from '../interface/assets';

/**
 * 解析语句内容的函数，主要作用是把文件名改为绝对地址或相对地址（根据使用情况而定）
 * @param contentRaw 原始语句内容
 * @param type 语句类型
 * @param assetSetter
 * @return {string} 解析后的语句内容
 */
export const contentParser = (
  contentRaw: string,
  type: commandType,
  assetSetter: any,
) => {
  if (contentRaw === 'none' || contentRaw === '') {
    return '';
  }
  switch (type) {
    case commandType.playEffect:
      return assetSetter(contentRaw, fileType.vocal);
    case commandType.changeBg:
      return assetSetter(contentRaw, fileType.background);
    case commandType.changeFigure:
      return assetSetter(contentRaw, fileType.figure);
    case commandType.bgm:
      return assetSetter(contentRaw, fileType.bgm);
    case commandType.callScene:
      return assetSetter(contentRaw, fileType.scene);
    case commandType.changeScene:
      return assetSetter(contentRaw, fileType.scene);
    case commandType.miniAvatar:
      return assetSetter(contentRaw, fileType.figure);
    case commandType.video:
      return assetSetter(contentRaw, fileType.video);
    case commandType.choose:
      return getChooseContent(contentRaw, assetSetter);
    case commandType.unlockBgm:
      return assetSetter(contentRaw, fileType.bgm);
    case commandType.unlockCg:
      return assetSetter(contentRaw, fileType.background);
    default:
      return contentRaw;
  }
};

function getChooseContent(contentRaw: string, assetSetter: any): string {
  const chooseList = contentRaw.split(/(?<!\\)\|/);
  const chooseKeyList: Array<string> = [];
  const chooseValueList: Array<string> = [];
  for (const e of chooseList) {
    chooseKeyList.push(e.split(/(?<!\\):/)[0] ?? '');
    chooseValueList.push(e.split(/(?<!\\):/)[1] ?? '');
  }
  const parsedChooseList = chooseValueList.map((e) => {
    if (e.match(/\./)) {
      return assetSetter(e, fileType.scene);
    } else {
      return e;
    }
  });
  let ret = '';
  for (let i = 0; i < chooseKeyList.length; i++) {
    if (i !== 0) {
      ret = ret + '|';
    }
    ret = ret + `${chooseKeyList[i]}:${parsedChooseList[i]}`;
  }
  return ret;
}
