import {
  commandType,
  IAsset,
  IScene,
  ISentence,
} from './interface/sceneInterface';
import { scriptParser } from './scriptParser/scriptParser';
import uniqWith from 'lodash/uniqWith';
import { fileType } from './interface/assets';
import { ConfigMap } from './config/scriptConfig';

/**
 * 场景解析器
 * @param rawScene 原始场景
 * @param sceneName 场景名称
 * @param sceneUrl 场景url
 * @param assetsPrefetcher
 * @param assetSetter
 * @param ADD_NEXT_ARG_LIST
 * @param SCRIPT_CONFIG_MAP
 * @return {IScene} 解析后的场景
 */
export const sceneParser = (
  rawScene: string,
  sceneName: string,
  sceneUrl: string,
  assetsPrefetcher: (assetList: Array<IAsset>) => void,
  assetSetter: (fileName: string, assetType: fileType) => string,
  ADD_NEXT_ARG_LIST: commandType[],
  SCRIPT_CONFIG_MAP: ConfigMap,
): IScene => {
  const rawSentenceList = rawScene.replaceAll('\r', '').split('\n'); // 原始句子列表

  // 去分号留到后面去做了，现在注释要单独处理
  const rawSentenceListWithoutEmpty = rawSentenceList;
  // .map((sentence) => sentence.split(";")[0])
  // .filter((sentence) => sentence.trim() !== "");
  let assetsList: Array<IAsset> = []; // 场景资源列表
  let subSceneList: Array<string> = []; // 子场景列表
  const sentenceList: Array<ISentence> = rawSentenceListWithoutEmpty.map(
    (sentence) => {
      const returnSentence: ISentence = scriptParser(
        sentence,
        assetSetter,
        ADD_NEXT_ARG_LIST,
        SCRIPT_CONFIG_MAP,
      );
      // 在这里解析出语句可能携带的资源和场景，合并到 assetsList 和 subSceneList
      assetsList = [...assetsList, ...returnSentence.sentenceAssets];
      subSceneList = [...subSceneList, ...returnSentence.subScene];
      return returnSentence;
    },
  );

  // 开始资源的预加载
  assetsList = uniqWith(assetsList); // 去重
  assetsPrefetcher(assetsList);

  return {
    sceneName: sceneName, // 场景名称
    sceneUrl: sceneUrl,
    sentenceList: sentenceList, // 语句列表
    assetsList: assetsList, // 资源列表
    subSceneList: subSceneList, // 子场景列表
  };
};
