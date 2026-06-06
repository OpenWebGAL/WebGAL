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
  WebGAL.events.load.emit(index);
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
  // 清空frames
  stageStateManager.resetIframe();

  // 恢复backlog
  const newBacklog = loadFile.backlog;
  WebGAL.backlogManager.getBacklog().splice(0, WebGAL.backlogManager.getBacklog().length); // 清空原backlog
  for (const e of newBacklog) {
    WebGAL.backlogManager.getBacklog().push(e);
  }

  // 恢复舞台状态
  const newStageState = cloneDeep(loadFile.nowStageState);
  // 保存iframes的持久化数据
  const iframePersistentData = new Map<string, Record<string, any>>();
  newStageState.iframes.forEach((iframe) => {
    if (iframe.persistentData) {
      iframePersistentData.set(iframe.id, iframe.persistentData);
    }
  });
  // iframes将被指令创建，我们不需要使用存档中的iframes
  newStageState.iframes = [];
  // 确保原先未读的文本在 load 时能正确显示为已读文本
  newStageState.isRead = true;
  const dispatch = webgalStore.dispatch;
  stageStateManager.replaceCalculationStageState(newStageState);
  // 将持久化数据存储到全局变量中，供后续创建iframe时使用
  (window as any).__iframePersistentData = iframePersistentData;

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
