import { resetStage } from '@/Core/controller/stage/resetStage';
import { assetSetter, fileType } from '@/Core/util/gameAssetsAccess/assetSetter';
import { sceneFetcher } from '@/Core/controller/scene/sceneFetcher';
import { sceneParser } from '@/Core/parser/sceneParser';
import { logger } from '../etc/logger';
import { webgalStore } from '@/store/store';
import { setVisibility } from '@/store/GUIReducer';
import { nextSentence } from '@/Core/controller/gamePlay/nextSentence';
import { WebGAL } from '@/main';

export const syncWithOrigine = (str: string) => {
  const strLst = str.split(' ');
  const scene = strLst[1].replace(/json/g, 'txt');
  const sentenceID = parseInt(strLst[2], 10);
  logger.warn('正在跳转到' + scene + ':' + sentenceID);
  const dispatch = webgalStore.dispatch;
  dispatch(setVisibility({ component: 'showTitle', visibility: false }));
  dispatch(setVisibility({ component: 'showMenuPanel', visibility: false }));
  resetStage(true);
  // 重新获取初始场景
  const sceneUrl: string = assetSetter(scene, fileType.scene);
  // 场景写入到运行时
  sceneFetcher(sceneUrl).then((rawScene) => {
    WebGAL.sceneManager.sceneData.currentScene = sceneParser(rawScene, 'start.txt', sceneUrl);
    // 开始快进到指定语句
    const currentSceneName = WebGAL.sceneManager.sceneData.currentScene.sceneName;
    WebGAL.gameplay.isFast = true;
    syncFast(sentenceID, currentSceneName);
  });
};

export function syncFast(sentenceId: number, currentSceneName: string) {
  if (
    WebGAL.sceneManager.sceneData.currentSentenceId < sentenceId &&
    WebGAL.sceneManager.sceneData.currentScene.sceneName === currentSceneName
  ) {
    nextSentence();
    setTimeout(() => syncFast(sentenceId, currentSceneName), 2);
  } else {
    WebGAL.gameplay.isFast = false;
  }
}
