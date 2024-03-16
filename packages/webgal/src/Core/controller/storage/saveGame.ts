import { logger } from '../../util/logger';
import { ISaveData } from '@/store/userDataInterface';
import { dumpToStorageFast } from './storageController';
import { webgalStore } from '@/store/store';
import { setUserData } from '@/store/userDataReducer';
import cloneDeep from 'lodash/cloneDeep';

import { WebGAL } from '@/Core/WebGAL';
import { saveActions } from '@/store/savesReducer';
import { dumpSavesToStorage } from '@/Core/controller/storage/savesController';

/**
 * 保存游戏
 * @param index 游戏的档位
 */
export const saveGame = (index: number) => {
  const saveData: ISaveData = generateCurrentStageData(index);
  webgalStore.dispatch(saveActions.saveGame({ index, saveData }));
  dumpSavesToStorage(index, index);
};

/**
 * 生成现在游戏的数据快照
 * @param index 游戏的档位
 */
export function generateCurrentStageData(index: number, isSavePreviewImage = true) {
  const stageState = webgalStore.getState().stage;
  const saveBacklog = cloneDeep(WebGAL.backlogManager.getBacklog());

  /**
   * 生成缩略图
   */

  let urlToSave = '';
  if (isSavePreviewImage) {
    const canvas: HTMLCanvasElement = document.getElementById('pixiCanvas')! as HTMLCanvasElement;
    const canvas2 = document.createElement('canvas');
    const context = canvas2.getContext('2d');
    canvas2.width = 480;
    canvas2.height = 270;
    context!.drawImage(canvas, 0, 0, 480, 270);
    urlToSave = canvas2.toDataURL('image/webp', 0.5);
    canvas2.remove();
  }
  const saveData: ISaveData = {
    nowStageState: cloneDeep(stageState),
    backlog: saveBacklog, // 舞台数据
    index: index, // 存档的序号
    saveTime: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString('chinese', { hour12: false }), // 保存时间
    // 场景数据
    sceneData: {
      currentSentenceId: WebGAL.sceneManager.sceneData.currentSentenceId, // 当前语句ID
      sceneStack: cloneDeep(WebGAL.sceneManager.sceneData.sceneStack), // 场景栈
      sceneName: WebGAL.sceneManager.sceneData.currentScene.sceneName, // 场景名称
      sceneUrl: WebGAL.sceneManager.sceneData.currentScene.sceneUrl, // 场景url
    },
    previewImage: urlToSave,
  };
  return saveData;
}
