import {resetStage} from "@/Core/util/resetStage";
import {assetSetter, fileType} from "@/Core/util/assetSetter";
import {sceneFetcher} from "@/Core/util/sceneFetcher";
import {runtime_currentSceneData} from "@/Core/runtime/sceneData";
import {sceneParser} from "@/Core/parser/sceneParser";
import {scriptExecutor} from "@/Core/controller/gamePlay/scriptExecutor";
import {logger} from "./logger";
import {webgalStore} from "@/Core/store/store";
import {setVisibility} from "@/Core/store/GUIReducer";

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
    scriptExecutor(sentenceID);
  });
};
