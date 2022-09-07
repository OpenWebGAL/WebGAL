import { resetStage } from '@/Core/controller/stage/resetStage';
import { assetSetter, fileType } from '@/Core/util/gameAssetsAccess/assetSetter';
import { sceneFetcher } from '@/Core/controller/scene/sceneFetcher';
import { RUNTIME_SCENE_DATA } from '@/Core/runtime/sceneData';
import { sceneParser } from '@/Core/parser/sceneParser';
import { logger } from '../etc/logger';
import { webgalStore } from '@/store/store';
import { setVisibility } from '@/store/GUIReducer';
import { nextSentence } from '@/Core/controller/gamePlay/nextSentence';

export const syncWithOrigine = (str: string) => {
  const strLst = str.split(' ');
  const scene = strLst[1].replace(/json/g, 'scene');
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
    RUNTIME_SCENE_DATA.currentScene = sceneParser(rawScene, 'start.scene', sceneUrl);
    // 开始快进到指定语句
    const currentSceneName = RUNTIME_SCENE_DATA.currentScene.sceneName;
    syncFast(sentenceID, currentSceneName);
  });
};

export function syncFast(sentenceId: number, currentSceneName: string) {
  if (
    RUNTIME_SCENE_DATA.currentSentenceId < sentenceId &&
    RUNTIME_SCENE_DATA.currentScene.sceneName === currentSceneName
  ) {
    nextSentence();
    setTimeout(() => syncFast(sentenceId, currentSceneName), 2);
  }
}
