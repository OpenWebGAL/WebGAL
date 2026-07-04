import { assetSetter, fileType } from '../../util/gameAssetsAccess/assetSetter';
import { sceneFetcher } from '../scene/sceneFetcher';
import { sceneParser } from '../../parser/sceneParser';
import { resetStage } from '@/Core/controller/stage/resetStage';
import { webgalStore } from '@/store/store';
import { setVisibility } from '@/store/GUIReducer';
import { continueSentence } from '@/Core/controller/gamePlay/nextSentence';
import { setEbg } from '@/Core/gameScripts/changeBg/setEbg';
import { restorePerform } from '@/Core/controller/storage/jumpFromBacklog';

import { hasFastSaveRecord, loadFastSaveGame } from '@/Core/controller/storage/fastSaveLoad';
import { WebGAL } from '@/Core/WebGAL';
import { stageStateManager } from '@/Core/Modules/stage/stageStateManager';

/**
 * 从头开始游戏
 */
export const startGame = () => {
  resetStage(true);

  // 重新获取初始场景
  const sceneUrl: string = assetSetter('start.txt', fileType.scene);
  // 场景写入到运行时
  sceneFetcher(sceneUrl).then((rawScene) => {
    WebGAL.sceneManager.sceneData.currentScene = sceneParser(rawScene, 'start.txt', sceneUrl);
    // 开始第一条语句
    continueSentence();
  });
  webgalStore.dispatch(setVisibility({ component: 'showTitle', visibility: false }));
};

export async function continueGame() {
  /**
   * 重设模糊背景
   */
  setEbg(stageStateManager.getViewStageState().bgName);
  if ((await hasFastSaveRecord())) {
    webgalStore.dispatch(setVisibility({ component: 'showTitle', visibility: false }));
    // 恢复记录
    await loadFastSaveGame();
  }
}
