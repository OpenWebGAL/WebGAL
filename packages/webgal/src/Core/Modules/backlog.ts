/**
 * 当前的backlog
 */
import { IStageState } from '@/store/stageInterface';
import { webgalStore } from '@/store/store';
import { ISaveScene } from '@/store/userDataInterface';
import cloneDeep from 'lodash/cloneDeep';
import { WebGAL } from '@/main';

import { SYSTEM_CONFIG } from '@/Core/config/config';

export interface IBacklogItem {
  currentStageState: IStageState;
  saveScene: ISaveScene;
}

export class BacklogManager {
  public isSaveBacklogNext = false;
  private backlog: Array<IBacklogItem> = [];

  public getBacklog() {
    return this.backlog;
  }
  public makeBacklogEmpty() {
    this.backlog.splice(0, this.backlog.length); // 清空backlog
  }
  public insertBacklogItem(item: IBacklogItem) {
    this.backlog.push(item);
  }
  public saveCurrentStateToBacklog() {
    // 存一下 Backlog
    const currentStageState = webgalStore.getState().stage;
    const stageStateToBacklog = cloneDeep(currentStageState);
    stageStateToBacklog.PerformList.forEach((ele) => {
      ele.script.args.forEach((argelement) => {
        if (argelement.key === 'concat') {
          argelement.value = false;
          ele.script.content = stageStateToBacklog.showText;
        }
      });
    });
    const backlogElement: IBacklogItem = {
      currentStageState: stageStateToBacklog,
      saveScene: {
        currentSentenceId: WebGAL.sceneManager.sceneData.currentSentenceId, // 当前语句ID
        sceneStack: cloneDeep(WebGAL.sceneManager.sceneData.sceneStack), // 场景栈
        sceneName: WebGAL.sceneManager.sceneData.currentScene.sceneName, // 场景名称
        sceneUrl: WebGAL.sceneManager.sceneData.currentScene.sceneUrl, // 场景url
      },
    };
    WebGAL.backlogManager.getBacklog().push(backlogElement);

    // 清除超出长度的部分
    while (WebGAL.backlogManager.getBacklog().length > SYSTEM_CONFIG.backlog_size) {
      WebGAL.backlogManager.getBacklog().shift();
    }
  }
}
