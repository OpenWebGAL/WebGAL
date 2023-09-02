import { IPerform, IRunPerform } from '@/Core/Modules/perform/performInterface';
import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { webgalStore } from '@/store/store';
import cloneDeep from 'lodash/cloneDeep';
import { resetStageState } from '@/store/stageReducer';
import { nextSentence } from '@/Core/controller/gamePlay/nextSentence';

/**
 * 获取随机演出名称
 */
export const getRandomPerformName = (): string => {
  return Math.random().toString().substring(0, 10);
};

export class PerformController {
  public performList: Array<IPerform> = [];
  public timeoutList: Array<ReturnType<typeof setTimeout>> = [];

  public arrangeNewPerform(perform: IPerform, script: ISentence, syncPerformState = true) {
    // 语句不执行演出
    if (perform.performName === 'none') {
      return;
    }
    // 同步演出状态
    if (syncPerformState) {
      const stageState = webgalStore.getState().stage;
      const newStageState = cloneDeep(stageState);
      newStageState.PerformList.push({ id: perform.performName, isHoldOn: perform.isHoldOn, script: script });
      webgalStore.dispatch(resetStageState(newStageState));
    }

    // 时间到后自动清理演出
    perform.stopTimeout = setTimeout(() => {
      // perform.stopFunction();
      // perform.isOver = true;
      if (!perform.isHoldOn) {
        // 如果不是保持演出，清除
        this.unmountPerform(perform.performName);
        if (perform.goNextWhenOver) {
          // nextSentence();
          this.goNextWhenOver();
        }
      }
    }, perform.duration);

    this.performList.push(perform);
  }

  public unmountPerform(name: string, force = false) {
    if (!force) {
      for (let i = 0; i < this.performList.length; i++) {
        const e = this.performList[i];
        if (!e.isHoldOn && e.performName === name) {
          e.stopFunction();
          clearTimeout(e.stopTimeout as unknown as number);
          this.performList.splice(i, 1);
          i--;
        }
      }
    } else {
      for (let i = 0; i < this.performList.length; i++) {
        const e = this.performList[i];
        if (e.performName === name) {
          e.stopFunction();
          clearTimeout(e.stopTimeout as unknown as number);
          this.performList.splice(i, 1);
          i--;
          /**
           * 从状态表里清除演出
           */
          this.erasePerformFromState(name);
        }
      }
    }
  }

  public erasePerformFromState(name: string) {
    const stageState = webgalStore.getState().stage;
    const newStageState = cloneDeep(stageState);
    for (let i = 0; i < newStageState.PerformList.length; i++) {
      const e2: IRunPerform = newStageState.PerformList[i];
      if (e2.id === name) {
        newStageState.PerformList.splice(i, 1);
        i--;
      }
    }
    webgalStore.dispatch(resetStageState(newStageState));
  }

  public removeAllPerform() {
    for (const e of this.performList) {
      e.stopFunction();
    }
    this.performList = [];
    for (const e of this.timeoutList) {
      clearTimeout(e);
    }
  }

  private goNextWhenOver() {
    let isBlockingAuto = false;
    this.performList.forEach((e) => {
      if (e.blockingAuto())
        // 阻塞且没有结束的演出
        isBlockingAuto = true;
    });
    if (isBlockingAuto) {
      // 有阻塞，提前结束
      setTimeout(this.goNextWhenOver, 100);
    } else {
      nextSentence();
    }
  }
}
