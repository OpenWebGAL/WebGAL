import { IAsset, IScene, ISentence } from "./interface/sceneInterface";
import { scriptParser } from "./scriptParser/scriptParser";
import * as __ from "lodash";
import { fileType } from "./interface/assets";

/**
 * 场景解析器
 * @param rawScene 原始场景
 * @param sceneName 场景名称
 * @param sceneUrl 场景url
 * @param assetsPrefetcher
 * @param assetSetter
 * @param ADD_NEXT_ARG_LIST
 * @param SCRIPT_CONFIG
 * @return {IScene} 解析后的场景
 */
export const sceneParser = (rawScene: string, sceneName: string, sceneUrl: string
  , assetsPrefetcher: ((assetList: Array<IAsset>) => void), assetSetter: (fileName: string, assetType: fileType) => string
  , ADD_NEXT_ARG_LIST, SCRIPT_CONFIG): IScene => {
  const rawSentenceList = rawScene.split("\n"); // 原始句子列表
  // 去除冒号后的内容
  // 去除分号后的内容
  const rawSentenceListWithoutEmpty = rawSentenceList
    .map((sentence) => sentence.split(";")[0])
    .filter((sentence) => sentence.trim() !== "");
  let assetsList: Array<IAsset> = []; // 场景资源列表
  let subSceneList: Array<string> = []; // 子场景列表
  const sentenceList: Array<ISentence> = rawSentenceListWithoutEmpty.map((sentence) => {
    const returnSentence: ISentence = scriptParser(sentence, assetSetter, ADD_NEXT_ARG_LIST, SCRIPT_CONFIG);
    // 在这里解析出语句可能携带的资源和场景，合并到 assetsList 和 subSceneList
    assetsList = [...assetsList, ...returnSentence.sentenceAssets];
    subSceneList = [...subSceneList, ...returnSentence.subScene];
    return returnSentence;
  });

  // 开始资源的预加载
  assetsList = __.uniqWith(assetsList); // 去重
  assetsPrefetcher(assetsList);

  return {
    sceneName: sceneName, // 场景名称
    sceneUrl: sceneUrl,
    sentenceList: sentenceList, // 语句列表
    assetsList: assetsList, // 资源列表
    subSceneList: subSceneList // 子场景列表
  };
};
