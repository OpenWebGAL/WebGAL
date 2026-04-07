import { webgalStore } from '@/store/store';
import { setVisibility } from '@/store/GUIReducer';
import { WebGAL } from '@/Core/WebGAL';
import { resetStage } from '@/Core/controller/stage/resetStage';
import { sceneFetcher } from '@/Core/controller/scene/sceneFetcher';
import { IScene } from '@/Core/controller/scene/sceneInterface';
import { jumpFromBacklog } from '@/Core/controller/storage/jumpFromBacklog';
import { nextSentence } from '@/Core/controller/gamePlay/nextSentence';
import { sceneParser } from '@/Core/parser/sceneParser';
import { logger } from '@/Core/util/logger';
import { assetSetter, fileType } from '@/Core/util/gameAssetsAccess/assetSetter';
import { SyncScenePayload } from '../../../../types/editorPreviewProtocol';
import cloneDeep from 'lodash/cloneDeep';
import isEqual from 'lodash/isEqual';

let fastForwardTimeout: ReturnType<typeof setTimeout> | undefined;

export function executePreviewSyncSceneCommand({ sceneName, sentenceId, syncMode }: SyncScenePayload): void {
  logger.warn('正在跳转到' + sceneName + ':' + sentenceId);

  const dispatch = webgalStore.dispatch;
  dispatch(setVisibility({ component: 'showTitle', visibility: false }));
  dispatch(setVisibility({ component: 'showMenuPanel', visibility: false }));
  dispatch(setVisibility({ component: 'isShowLogo', visibility: false }));

  const title = document.querySelector('.html-body__title-enter') as HTMLElement | null;
  if (title) {
    title.style.display = 'none';
  }

  const previousScene = cloneDeep(WebGAL.sceneManager.sceneData.currentScene);
  const sceneUrl = assetSetter(sceneName, fileType.scene);

  sceneFetcher(sceneUrl).then((rawScene) => {
    const nextScene = sceneParser(rawScene, sceneName, sceneUrl);
    const lastSharedSentenceId = findLastSharedSentence(previousScene, nextScene, sentenceId);
    const recoverySentenceId = Math.min(sentenceId, lastSharedSentenceId);
    const backlogIndex = findLastAvailableBacklogEntry(recoverySentenceId, sceneName);
    const allowBacklogRecovery = backlogIndex >= 0 && syncMode === 'fast';

    resetStage(!allowBacklogRecovery);
    WebGAL.sceneManager.sceneData.currentScene = nextScene;
    WebGAL.gameplay.isFast = true;

    if (allowBacklogRecovery) {
      jumpFromBacklog(backlogIndex, false);
    }

    if (fastForwardTimeout) {
      clearTimeout(fastForwardTimeout);
    }

    fastForwardToSentence(sentenceId, WebGAL.sceneManager.sceneData.currentScene.sceneName);
  });
}

export function fastForwardToSentence(targetSentenceId: number, currentSceneName: string): void {
  if (
    WebGAL.sceneManager.sceneData.currentSentenceId < targetSentenceId &&
    WebGAL.sceneManager.sceneData.currentScene.sceneName === currentSceneName
  ) {
    nextSentence();
    fastForwardTimeout = setTimeout(() => fastForwardToSentence(targetSentenceId, currentSceneName), 2);
    return;
  }

  WebGAL.gameplay.isFast = false;
}

function findLastSharedSentence(previousScene: IScene, currentScene: IScene, targetSentenceId: number): number {
  let lastSharedSentenceId = 0;
  const comparableSentenceCount = Math.min(
    targetSentenceId,
    previousScene.sentenceList.length,
    currentScene.sentenceList.length,
  );

  for (let index = 0; index < comparableSentenceCount; index += 1) {
    if (!isEqual(previousScene.sentenceList[index], currentScene.sentenceList[index])) {
      break;
    }

    lastSharedSentenceId = index;
  }

  return lastSharedSentenceId;
}

function findLastAvailableBacklogEntry(targetSentenceId: number, sceneName: string): number {
  let lastAvailableIndex = -1;

  WebGAL.backlogManager.getBacklog().forEach((entry, index) => {
    const backlogSentenceId = entry.saveScene.currentSentenceId;
    const backlogSceneName = entry.saveScene.sceneName;

    if (backlogSentenceId <= targetSentenceId && backlogSceneName === sceneName) {
      lastAvailableIndex = index;
    }
  });

  return lastAvailableIndex;
}
