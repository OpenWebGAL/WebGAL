import { resetStage } from '@/Core/controller/stage/resetStage';
import { assetSetter, fileType } from '@/Core/util/gameAssetsAccess/assetSetter';
import { sceneFetcher } from '@/Core/controller/scene/sceneFetcher';
import { sceneParser } from '@/Core/parser/sceneParser';
import { logger } from '../logger';
import { webgalStore } from '@/store/store';
import { setVisibility } from '@/store/GUIReducer';
import { nextSentence } from '@/Core/controller/gamePlay/nextSentence';

import { WebGAL } from '@/Core/WebGAL';
import cloneDeep from 'lodash/cloneDeep';
import { IScene } from '@/Core/controller/scene/sceneInterface';
import { jumpFromBacklog } from '@/Core/controller/storage/jumpFromBacklog';

let syncFastTimeout: ReturnType<typeof setTimeout> | undefined;

export const syncWithOrigine = (sceneName: string, sentenceId: number, expermental = false) => {
  logger.warn('正在跳转到' + sceneName + ':' + sentenceId);
  const dispatch = webgalStore.dispatch;
  dispatch(setVisibility({ component: 'showTitle', visibility: false }));
  dispatch(setVisibility({ component: 'showMenuPanel', visibility: false }));
  dispatch(setVisibility({ component: 'isShowLogo', visibility: false }));
  const title = document.getElementById('Title_enter_page');
  if (title) {
    title.style.display = 'none';
  }
  const pastScene = cloneDeep(WebGAL.sceneManager.sceneData.currentScene);
  // 重新获取场景
  const sceneUrl: string = assetSetter(sceneName, fileType.scene);
  // 场景写入到运行时
  sceneFetcher(sceneUrl).then((rawScene) => {
    // 等等，先检查一下能不能恢复场景
    const lastSameSentence = findLastSameSentence(pastScene, WebGAL.sceneManager.sceneData.currentScene, sentenceId);
    const lastRecoverySentenceId = Math.min(sentenceId, lastSameSentence);
    const recId = findLastAvailableBacklog(lastRecoverySentenceId, sceneName);
    const isCanRec = recId >= 0 && expermental;
    resetStage(!isCanRec);
    WebGAL.sceneManager.sceneData.currentScene = sceneParser(rawScene, sceneName, sceneUrl);
    // 开始快进到指定语句
    const currentSceneName = WebGAL.sceneManager.sceneData.currentScene.sceneName;
    WebGAL.gameplay.isFast = true;
    if (isCanRec) {
      jumpFromBacklog(recId, false);
    }
    if (syncFastTimeout) {
      // 之前发生的跳转要清理掉
      clearTimeout(syncFastTimeout);
    }
    syncFast(sentenceId, currentSceneName);
  });
};

export function syncFast(sentenceId: number, currentSceneName: string) {
  if (
    WebGAL.sceneManager.sceneData.currentSentenceId < sentenceId &&
    WebGAL.sceneManager.sceneData.currentScene.sceneName === currentSceneName
  ) {
    nextSentence();
    syncFastTimeout = setTimeout(() => syncFast(sentenceId, currentSceneName), 2);
  } else {
    WebGAL.gameplay.isFast = false;
  }
}

function findLastSameSentence(oldScene: IScene, newScene: IScene, sentenceId: number): number {
  let lastSameSentence = 0;
  for (let i = 0; i < sentenceId && i < oldScene.sentenceList.length; i++) {
    const oldSentenceStr = JSON.stringify(oldScene.sentenceList[i]);
    const newSentenceStr = JSON.stringify(newScene.sentenceList[i]);
    if (oldSentenceStr !== newSentenceStr) {
      break;
    }
    lastSameSentence = i;
  }
  return lastSameSentence;
}

function findLastAvailableBacklog(targetSentence: number, sceneName: string) {
  let lastAvailable = -1;
  WebGAL.backlogManager.getBacklog().forEach((e, i) => {
    const recSentenceId = e.saveScene.currentSentenceId;
    const recSceneName = e.saveScene.sceneName;
    if (recSentenceId <= targetSentence && recSceneName === sceneName) {
      lastAvailable = i;
    }
  });
  return lastAvailable;
}
