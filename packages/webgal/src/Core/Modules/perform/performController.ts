import { IPerform } from '@/Core/Modules/perform/performInterface';
import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { webgalStore } from '@/store/store';
import cloneDeep from 'lodash/cloneDeep';
import { resetStageState, stageActions } from '@/store/stageReducer';
import { nextSentence } from '@/Core/controller/gamePlay/nextSentence';
import { IRunPerform } from '@/store/stageInterface';
import { WEBGAL_NONE } from '@/Core/constants';
import { getBooleanArgByKey } from '@/Core/util/getSentenceArg';

/**
 * 获取随机演出名称
 */
export const getRandomPerformName = (): string => {
  return Math.random().toString().substring(0, 10);
};

export class PerformController {
  public performList: Array<IPerform> = [];

  public arrangeNewPerform(perform: IPerform, script: ISentence, syncPerformState = true) {
    // 检查演出列表内是否有相同的演出，如果有，一定是出了什么问题
    const dupPerformIndex = this.performList.findIndex((p) => p.performName === perform.performName);
    if (dupPerformIndex > -1) {
      // 结束并删除全部重复演出
      for (let i = 0; i < this.performList.length; i++) {
        const e = this.performList[i];
        if (e.performName === perform.performName) {
          e.stopFunction();
          clearTimeout(e.stopTimeout as unknown as number);
          this.performList.splice(i, 1);
          i--;
        }
      }
    }

    // 语句不执行演出
    if (perform.performName === WEBGAL_NONE) {
      return;
    }
    // 同步演出状态
    if (syncPerformState) {
      const performToAdd = { id: perform.performName, isHoldOn: perform.isHoldOn, script: script };
      webgalStore.dispatch(stageActions.addPerform(performToAdd));
    }

    // 时间到后自动清理演出
    perform.stopTimeout = setTimeout(() => {
      // perform.stopFunction();
      // perform.isOver = true;
      if (!perform.isHoldOn) {
        // 如果不是保持演出，清除
        this.unmountPerform(perform.performName);
      }
    }, perform.duration);

    const hasContinue = getBooleanArgByKey(script, 'continue') ?? false;
    if (hasContinue) perform.goNextWhenOver = true;

    this.performList.push(perform);
  }

  public unmountPerform(name: string, force = false) {
    if (!force) {
      for (let i = 0; i < this.performList.length; i++) {
        const e = this.performList[i];
        if (!e.isHoldOn && e.performName === name) {
          e.stopFunction();
          clearTimeout(e.stopTimeout as unknown as number);
          /**
           * 在演出列表里删除演出对象的操作必须在调用 goNextWhenOver 之前
           * 因为 goNextWhenOver 会调用 nextSentence，而 nextSentence 会清除目前未结束的演出
           * 那么 nextSentence 函数就会删除这个演出，但是此时，在这个上下文，i 已经被确定了
           * 所以 goNextWhenOver 后的代码会多删东西，解决方法就是在调用 goNextWhenOver 前先删掉这个演出对象
           * 此问题对所有 goNextWhenOver 属性为真的演出都有影响，但只有 2 个演出有此问题
           */
          this.performList.splice(i, 1);
          i--;
          if (e.goNextWhenOver) {
            // nextSentence();
            this.goNextWhenOver();
          }
        }
      }
    } else {
      for (let i = 0; i < this.performList.length; i++) {
        const e = this.performList[i];
        if (e.performName === name) {
          e.stopFunction();
          clearTimeout(e.stopTimeout as unknown as number);
          if (e.goNextWhenOver) {
            // nextSentence();
            this.goNextWhenOver();
          }
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
    webgalStore.dispatch(stageActions.removePerformByName(name));
  }

  public removeAllPerform() {
    for (const e of this.performList) {
      clearTimeout(e.stopTimeout);
      e.stopFunction();
    }
    this.performList = [];
  }

  private goNextWhenOver() {
    let isBlockingAuto = false;
    this.performList?.forEach((e) => {
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
