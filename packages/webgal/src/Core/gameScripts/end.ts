import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { createNonePerform, IPerform } from '@/Core/Modules/perform/performInterface';
import { assetSetter, fileType } from '@/Core/util/gameAssetsAccess/assetSetter';
import { sceneFetcher } from '@/Core/controller/scene/sceneFetcher';
import { sceneParser } from '@/Core/parser/sceneParser';
import { resetStage } from '@/Core/controller/stage/resetStage';
import { webgalStore } from '@/store/store';
import { setVisibility } from '@/store/GUIReducer';
import { playBgm } from '@/Core/controller/stage/playBgm';
import { WebGAL } from '@/Core/WebGAL';
import { dumpToStorageFast } from '@/Core/controller/storage/storageController';
import { removeFastSaveGameRecord } from '../controller/storage/fastSaveLoad';

/**
 * 结束游戏
 * @param sentence
 */
export const end = (sentence: ISentence): IPerform => {
  resetStage(true);
  const dispatch = webgalStore.dispatch;
  // 重新获取初始场景
  const sceneUrl: string = assetSetter('start.txt', fileType.scene);
  // scriptExecutor 会在命令返回后自增 sentenceId，必须在此之后重置，避免重置后又变为 1。
  // 移除延时需要先让执行器显式处理结束流程，与 Pixi 是否同步无关。
  setTimeout(() => {
    WebGAL.sceneManager.resetScene();
  }, 5);
  removeFastSaveGameRecord();
  dumpToStorageFast();
  sceneFetcher(sceneUrl).then((rawScene) => {
    // 场景写入到运行时
    WebGAL.sceneManager.sceneData.currentScene = sceneParser(rawScene, 'start.txt', sceneUrl);
  });
  dispatch(setVisibility({ component: 'showTitle', visibility: true }));
  playBgm(webgalStore.getState().GUI.titleBgm);
  return createNonePerform();
};
