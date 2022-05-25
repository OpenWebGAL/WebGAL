import {resetStage} from "@/Core/controller/stage/resetStage";
import {assetSetter, fileType} from "@/Core/util/gameAssetsAccess/assetSetter";
import {sceneFetcher} from "@/Core/controller/scene/sceneFetcher";
import {runtime_currentSceneData} from "@/Core/runtime/sceneData";
import {sceneParser} from "@/Core/parser/sceneParser";
import {logger} from "../etc/logger";
import {webgalStore} from "@/Core/store/store";
import {setVisibility} from "@/Core/store/GUIReducer";
import {nextSentence} from "@/Core/controller/gamePlay/nextSentence";

export const syncWithOrigine = (str: string) => {
  const strLst = str.split(' ');
  const scene = strLst[1].replace(/json/g, 'txt');
  const sentenceID = parseInt(strLst[2], 10);
  logger.warn('正在跳转到' + scene + ':' + sentenceID);
  const dispatch = webgalStore.dispatch;
  dispatch(setVisibility({component: 'showTitle', visibility: false}));
  dispatch(setVisibility({component: 'showMenuPanel', visibility: false}));
  resetStage(true);
  // 重新获取初始场景
  const sceneUrl: string = assetSetter(scene, fileType.scene);
  // 场景写入到运行时
  sceneFetcher(sceneUrl).then((rawScene) => {
    runtime_currentSceneData.currentScene = sceneParser(rawScene, 'start.txt', sceneUrl);
    // 开始快进到指定语句
    syncFast(sentenceID);
  });
};

export function syncFast(sentenceId: number) {
  if (runtime_currentSceneData.currentSentenceId < sentenceId) {
    nextSentence();
    setTimeout(() => syncFast(sentenceId), 2);
  }
}
