/**
 * 当前的backlog
 */
import { IEffect, IStageState } from '@/store/stageInterface';
import { webgalStore } from '@/store/store';
import { ISaveScene } from '@/store/userDataInterface';
import cloneDeep from 'lodash/cloneDeep';

import { SYSTEM_CONFIG } from '@/Core/config/config';
import { SceneManager } from '@/Core/Modules/scene';

export interface IBacklogItem {
  currentStageState: IStageState;
  saveScene: ISaveScene;
}

export class BacklogManager {
  public isSaveBacklogNext = false;
  private backlog: Array<IBacklogItem> = [];

  private readonly sceneManager: SceneManager;

  public constructor(sceneManager: SceneManager) {
    this.sceneManager = sceneManager;
  }

  public getBacklog() {
    return this.backlog;
  }

  public editLastBacklogItemEffect(effects: IEffect[]) {
    this.backlog[this.backlog.length - 1].currentStageState.effects = effects;
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
        currentSentenceId: this.sceneManager.sceneData.currentSentenceId, // 当前语句ID
        sceneStack: cloneDeep(this.sceneManager.sceneData.sceneStack), // 场景栈
        sceneName: this.sceneManager.sceneData.currentScene.sceneName, // 场景名称
        sceneUrl: this.sceneManager.sceneData.currentScene.sceneUrl, // 场景url
      },
    };
    this.getBacklog().push(backlogElement);

    // 清除超出长度的部分
    while (this.getBacklog().length > SYSTEM_CONFIG.backlog_size) {
      this.getBacklog().shift();
    }
  }
}
