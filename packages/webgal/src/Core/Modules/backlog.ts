/**
 * 当前的backlog
 */
import { IStageState } from '@/store/stageInterface';
import { ISaveScene } from '@/store/userDataInterface';

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
}
