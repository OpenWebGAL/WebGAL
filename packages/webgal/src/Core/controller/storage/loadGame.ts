import { ISaveData } from '@/store/userDataInterface';
import { logger } from '../../util/logger';
import { sceneFetcher } from '../scene/sceneFetcher';
import { sceneParser } from '../../parser/sceneParser';
import { webgalStore } from '@/store/store';
import { setVisibility } from '@/store/GUIReducer';
import { restorePerform } from './jumpFromBacklog';
import { stopAllPerform } from '@/Core/controller/gamePlay/stopAllPerform';
import cloneDeep from 'lodash/cloneDeep';
import { setEbg } from '@/Core/gameScripts/changeBg/setEbg';

import { WebGAL } from '@/Core/WebGAL';
import { stageStateManager } from '@/Core/Modules/stage/stageStateManager';

/**
 * 读取游戏存档
 * @param index 要读取的存档的档位
 */
export const loadGame = (index: number) => {
  const userDataState = webgalStore.getState().saveData;
  // 获得存档文件
  const loadFile: ISaveData = userDataState.saveData[index];
  logger.debug('读取的存档数据', loadFile);
  // 加载存档
  loadGameFromStageData(loadFile);
};

export function loadGameFromStageData(stageData: ISaveData) {
  if (!stageData) {
    logger.info('暂无存档');
    return;
  }
  const loadFile = stageData;
  // 重新获取并同步场景状态
  sceneFetcher(loadFile.sceneData.sceneUrl).then((rawScene) => {
    WebGAL.sceneManager.sceneData.currentScene = sceneParser(
      rawScene,
      loadFile.sceneData.sceneName,
      loadFile.sceneData.sceneUrl,
    );
    WebGAL.sceneManager.settledScenes.add(WebGAL.sceneManager.sceneData.currentScene.sceneUrl); // 放入已加载场景列表，避免递归加载相同场景
  });
  WebGAL.sceneManager.sceneData.currentSentenceId = loadFile.sceneData.currentSentenceId;
  WebGAL.sceneManager.sceneData.sceneStack = cloneDeep(loadFile.sceneData.sceneStack);

  // 强制停止所有演出
  stopAllPerform();

  // 恢复backlog
  const newBacklog = loadFile.backlog;
  WebGAL.backlogManager.getBacklog().splice(0, WebGAL.backlogManager.getBacklog().length); // 清空原backlog
  for (const e of newBacklog) {
    WebGAL.backlogManager.getBacklog().push(e);
  }

  // 恢复舞台状态
  const newStageState = cloneDeep(loadFile.nowStageState);
  // 确保原先未读的文本在 load 时能正确显示为已读文本
  newStageState.isRead = true;
  const dispatch = webgalStore.dispatch;
  stageStateManager.replaceCalculationStageState(newStageState);

  // 恢复演出
  setTimeout(restorePerform, 0);
  // restorePerform();

  dispatch(setVisibility({ component: 'showTitle', visibility: false }));
  dispatch(setVisibility({ component: 'showMenuPanel', visibility: false }));
  /**
   * 恢复模糊背景
   */
  setEbg(newStageState.bgName);
}
