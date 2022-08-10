import { RUNTIME_CURRENT_BACKLOG } from '../../runtime/backlog';
import { logger } from '../../util/etc/logger';
import { ISaveData } from '@/interface/stateInterface/userDataInterface';
import { RUNTIME_SCENE_DATA } from '../../runtime/sceneData';
import { syncStorageFast } from './storageController';
import { webgalStore } from '@/store/store';
import { setUserData } from '@/store/userDataReducer';
import cloneDeep from 'lodash/cloneDeep';

/**
 * 保存游戏
 * @param index 游戏的档位
 */
export const saveGame = (index: number) => {
  const userDataState = webgalStore.getState().userData;
  const saveData: ISaveData = generateCurrentStageData(index);
  logger.debug('存档数据：', saveData);
  const newSaveData = cloneDeep(userDataState.saveData);
  logger.debug('newSaveData:', newSaveData);
  newSaveData[index] = saveData;
  webgalStore.dispatch(setUserData({ key: 'saveData', value: [...newSaveData] }));
  logger.debug('存档完成，存档结果：', newSaveData);
  syncStorageFast();
};

/**
 * 生成现在游戏的数据快照
 * @param index 游戏的档位
 */
export function generateCurrentStageData(index: number) {
  const stageState = webgalStore.getState().stage;
  const saveBacklog = cloneDeep(RUNTIME_CURRENT_BACKLOG);
  const saveData: ISaveData = {
    nowStageState: cloneDeep(stageState),
    backlog: saveBacklog, // 舞台数据
    index: index, // 存档的序号
    saveTime: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString('chinese', { hour12: false }), // 保存时间
    sceneData: {
      currentSentenceId: RUNTIME_SCENE_DATA.currentSentenceId, // 当前语句ID
      sceneStack: cloneDeep(RUNTIME_SCENE_DATA.sceneStack), // 场景栈
      sceneName: RUNTIME_SCENE_DATA.currentScene.sceneName, // 场景名称
      sceneUrl: RUNTIME_SCENE_DATA.currentScene.sceneUrl, // 场景url
    }, // 场景数据
  };
  return saveData;
}
