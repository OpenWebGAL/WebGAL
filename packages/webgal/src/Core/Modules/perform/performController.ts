import { IPerform } from '@/Core/Modules/perform/performInterface';
import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { nextSentence } from '@/Core/controller/gamePlay/nextSentence';
import { WEBGAL_NONE } from '@/Core/constants';
import { getBooleanArgByKey } from '@/Core/util/getSentenceArg';
import { stageStateManager } from '@/Core/Modules/stage/stageStateManager';

/**
 * 获取随机演出名称
 */
export const getRandomPerformName = (): string => {
  return Math.random().toString().substring(0, 10);
};

interface IPendingPerform {
  perform: IPerform;
  script: ISentence;
  syncPerformState: boolean;
}

export class PerformController {
  public performList: Array<IPerform> = [];
  private pendingPerformList: Array<IPendingPerform> = [];
  private isCollectingPerforms = false;
  private stopTimeoutMap = new WeakMap<IPerform, ReturnType<typeof setTimeout>>();

  /**
   * 判断 perform 名称是否匹配（支持前缀匹配，用于清理并行演出）
   * 并行演出的 performName 格式为 "baseName#uuid"，匹配时需要同时命中精确匹配和前缀匹配
   */
  private matchPerformName(performName: string, name: string): boolean {
    return performName === name || performName.startsWith(name + '#');
  }

  public beginCollectingPerforms() {
    this.isCollectingPerforms = true;
  }

  public endCollectingPerforms() {
    this.isCollectingPerforms = false;
  }

  public arrangeNewPerform(perform: IPerform, script: ISentence, syncPerformState = true) {
    // 检查演出列表内是否有相同的演出，如果有，一定是出了什么问题
    // 并行演出的 performName 带有唯一后缀，因此不会命中去重
    const dupPerformIndex = this.performList.findIndex((p) => p.performName === perform.performName);
    if (dupPerformIndex > -1) {
      // 结束并删除全部重复演出
      for (let i = 0; i < this.performList.length; i++) {
        const e = this.performList[i];
        if (e.performName === perform.performName) {
          this.stopStartedPerform(e);
          this.clearPerformTimeout(e);
          this.performList.splice(i, 1);
          i--;
        }
      }
    }
    perform.isStarted = false;
    this.pendingPerformList = this.pendingPerformList.filter((p) => p.perform.performName !== perform.performName);

    // 语句不执行演出
    if (perform.performName === WEBGAL_NONE) {
      return;
    }

    // 同步演出状态
    if (syncPerformState) {
      const performToAdd = { id: perform.performName, isHoldOn: perform.isHoldOn, script: script };
      if (this.isCollectingPerforms) {
        stageStateManager.addPerform(performToAdd);
      } else {
        stageStateManager.addPerform(performToAdd);
        stageStateManager.commit({ applyPixiEffects: false });
      }
    }

    if (this.isCollectingPerforms) {
      this.pendingPerformList.push({ perform, script, syncPerformState });
      return;
    }

    this.startPerform(perform, script);
    if (!this.isCollectingPerforms) {
      stageStateManager.applyCommittedPixiEffects();
    }
  }

  public commitPendingPerforms() {
    const performsToStart = this.pendingPerformList;
    this.pendingPerformList = [];
    performsToStart.forEach(({ perform, script }) => {
      this.startPerform(perform, script);
    });
  }

  public discardUncommittedNonHoldPerforms() {
    this.pendingPerformList = this.pendingPerformList.filter(({ perform }) => perform.isHoldOn);
  }

  public hasPendingBlockingNextPerform() {
    return this.pendingPerformList.some(({ perform }) => perform.blockingNext());
  }

  public hasPendingBlockingStateCalculationPerform() {
    return this.pendingPerformList.some(({ perform }) =>
      perform.blockingStateCalculation ? perform.blockingStateCalculation() : perform.blockingNext(),
    );
  }

  public hasBlockingNextPerform() {
    return this.performList.some((e) => e.blockingNext());
  }

  public hasUnsettledNonHoldPerform() {
    return this.performList.some((e) => !e.isHoldOn && !e.skipNextCollect);
  }

  public settleNonHoldPerforms() {
    let isGoNext = false;
    for (let i = 0; i < this.performList.length; i++) {
      const e = this.performList[i];
      if (!e.isHoldOn) {
        if (e.goNextWhenOver) {
          isGoNext = true;
        }
        if (!e.skipNextCollect) {
          this.stopStartedPerform(e);
          this.clearPerformTimeout(e);
          this.performList.splice(i, 1);
          i--;
          this.erasePerformFromState(e.performName);
        }
      }
    }
    stageStateManager.commit();
    if (isGoNext) {
      nextSentence();
    }
  }

  public clearNonHoldPerformsFromStageState() {
    stageStateManager.clearUncommittedNonHoldPerforms();
  }

  private startPerform(perform: IPerform, script: ISentence) {
    perform.isStarted = true;
    perform.startFunction?.();

    // 时间到后自动清理演出
    const stopTimeout = setTimeout(() => {
      // perform.stopFunction();
      // perform.isOver = true;
      if (!perform.isHoldOn) {
        // 如果不是保持演出，清除
        this.softUnmountPerformObject(perform);
      }
    }, perform.duration);
    this.stopTimeoutMap.set(perform, stopTimeout);

    const hasContinue = getBooleanArgByKey(script, 'continue') ?? false;
    if (hasContinue) perform.goNextWhenOver = true;

    this.performList.push(perform);
  }

  public unmountPerform(name: string, force = false) {
    let isPendingRemoved = false;
    this.pendingPerformList = this.pendingPerformList.filter(({ perform }) => {
      const matched = this.matchPerformName(perform.performName, name);
      if ((force && matched) || (matched && !perform.isHoldOn)) {
        isPendingRemoved = true;
      }
      return force ? !matched : !(matched && !perform.isHoldOn);
    });
    if (isPendingRemoved) {
      this.erasePerformFromState(name);
    }
    if (!force) {
      for (let i = 0; i < this.performList.length; i++) {
        const e = this.performList[i];
        if (!e.isHoldOn && this.matchPerformName(e.performName, name)) {
          this.stopStartedPerform(e);
          this.clearPerformTimeout(e);
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
          this.erasePerformFromState(name);
        }
      }
    } else {
      for (let i = 0; i < this.performList.length; i++) {
        const e = this.performList[i];
        if (this.matchPerformName(e.performName, name)) {
          this.stopStartedPerform(e);
          this.clearPerformTimeout(e);
          /**
           * 在演出列表里删除演出对象的操作必须在调用 goNextWhenOver 之前（同上）
           */
          this.performList.splice(i, 1);
          i--;
          if (e.goNextWhenOver) {
            // nextSentence();
            this.goNextWhenOver();
          }
          /**
           * 从状态表里清除演出
           */
          this.erasePerformFromState(name);
        }
      }
    }
  }

  public unmountPerformByPrefix(prefix: string, force = false) {
    let isPendingRemoved = false;
    this.pendingPerformList = this.pendingPerformList.filter(({ perform }) => {
      const matched = perform.performName.startsWith(prefix);
      if ((force && matched) || (matched && !perform.isHoldOn)) {
        isPendingRemoved = true;
      }
      return force ? !matched : !(matched && !perform.isHoldOn);
    });
    if (isPendingRemoved) {
      stageStateManager.removePerformByPrefix(prefix);
    }

    for (let i = 0; i < this.performList.length; i++) {
      const e = this.performList[i];
      if (e.performName.startsWith(prefix) && (force || !e.isHoldOn)) {
        this.stopStartedPerform(e);
        this.clearPerformTimeout(e);
        this.performList.splice(i, 1);
        i--;
        if (e.goNextWhenOver) {
          this.goNextWhenOver();
        }
        this.erasePerformFromState(e.performName);
      }
    }
  }

  public softUnmountPerformObject(perform: IPerform) {
    const idx = this.performList.indexOf(perform);
    if (idx < 0) return;
    this.stopStartedPerform(perform);
    this.clearPerformTimeout(perform);
    /**
     * 在演出列表里删除演出对象的操作必须在调用 goNextWhenOver 之前
     * 因为 goNextWhenOver 会调用 nextSentence，而 nextSentence 会清除目前未结束的演出
     * 那么 nextSentence 函数就会删除这个演出，但是此时，在这个上下文，i 已经被确定了
     * 所以 goNextWhenOver 后的代码会多删东西，解决方法就是在调用 goNextWhenOver 前先删掉这个演出对象
     * 此问题对所有 goNextWhenOver 属性为真的演出都有影响，但只有 2 个演出有此问题
     */
    this.performList.splice(idx, 1);
    this.erasePerformFromState(perform.performName);
    stageStateManager.commit();
    if (perform.goNextWhenOver) {
      // nextSentence();
      this.goNextWhenOver();
    }
  }

  public erasePerformFromState(name: string) {
    stageStateManager.removePerformByName(name);
  }

  public removeAllPerform() {
    this.pendingPerformList = [];
    for (const e of this.performList) {
      this.clearPerformTimeout(e);
      this.stopStartedPerform(e);
    }
    this.performList = [];
  }

  private clearPerformTimeout(perform: IPerform) {
    const stopTimeout = this.stopTimeoutMap.get(perform);
    if (stopTimeout) {
      clearTimeout(stopTimeout);
      this.stopTimeoutMap.delete(perform);
    }
  }

  private stopStartedPerform(perform: IPerform) {
    if (!perform.isStarted) return;
    perform.stopFunction();
    perform.isStarted = false;
  }

  private goNextWhenOver = () => {
    let isBlockingNext = false;
    this.performList?.forEach((e) => {
      if (e.blockingNext())
        // 阻塞且没有结束的演出
        isBlockingNext = true;
    });
    if (isBlockingNext) {
      // 有阻塞，提前结束
      setTimeout(this.goNextWhenOver, 100);
    } else {
      nextSentence();
    }
  };
}
