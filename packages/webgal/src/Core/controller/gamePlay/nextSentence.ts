import { scriptExecutor, type ScriptExecutionOptions } from './scriptExecutor';
import { logger } from '../../util/logger';
import { webgalStore } from '@/store/store';

import { WebGAL } from '@/Core/WebGAL';
import { stageStateManager } from '@/Core/Modules/stage/stageStateManager';

/**
 * 执行一次推进前检查。
 *
 * 这里处理三种“不能直接进入下一条语句”的情况：
 * 1. 场景正在异步写入时，任何推进都必须停止。
 * 2. 存在 blockingNext 的演出时，用户推进和内部推进都必须等待。
 * 3. 存在可提前结束的非 hold 演出时，用户推进将所有可回收的非 hold 演出提前结束，
 *    这在 galgame 中很常见，用户并非想要推进到下一条语句，而是想要让当前对话的演出先推进到终态，
 *    比如立刻展示完整文字并将立绘动画结束并推到终态；
 *    内部继续推进会先结束演出（但是实际上在很多情况下，其他演出已经结束了），然后继续执行下一条语句。
 *
 * @param continueAfterSettling 是否在清理普通非 hold 演出后继续推进。
 * @returns true 表示可以继续调用 forward/commitForward，也就是推进到下一条语句。
 */
export const preForward = (continueAfterSettling = false) => {
  if (WebGAL.sceneManager.lockSceneWrite) {
    logger.warn('next 被场景切换阻塞！');
    return false;
  }

  if (WebGAL.gameplay.performController.hasBlockingNextPerform()) {
    logger.warn('next 被阻塞！');
    return false;
  }

  const hasUnsettledNonHoldPerform = WebGAL.gameplay.performController.hasUnsettledNonHoldPerform();
  if (hasUnsettledNonHoldPerform) {
    logger.debug('提前结束被触发，现在清除普通演出');
    // 对于用户推进，传入 true，
    // 这样执行 settleNonHoldPerforms 的时候，遇到明确要在结束后继续推进到下一条语句的演出时，
    // 就会触发内部推进，尝试推进到下一语句。比如 intro 演出请求了结束后继续，按语义应该继续。
    // ------
    // 而对于内部推进，传入 false，因为调用方已经打算在提前结算演出后继续，不需要再触发一次。
    // 例如，一个演出序列里有 2 个不同时长的演出都设置了 goNextWhenOver。
    // 但是目标都是一致的，那就是结束后转到下一句。快的那个触发了内部继续，在这里结束了慢的那个演出。
    // 慢的演出要求的内部继续已经可以被调用方满足，因此无需重复触发。
    WebGAL.gameplay.performController.settleNonHoldPerforms(!continueAfterSettling);
    // 用户推进时，返回 false，因为无论是遇到了提前结束当前句演出还是引发了内部推进，这里都不能让调用方继续语句推进流程了。
    // 内部推进时，返回 true，让调用方继续到下一步的语句推进流程。
    return continueAfterSettling;
  }

  // 没有阻塞，也没有需要提前结束的演出，允许调用方继续推进语句。
  return true;
};

/**
 * 执行一条语句或由 -next 连接的语句序列。
 *
 * forward 只推进 calculationStageState，并把命令返回的 perform 收集到 pending 列表；
 * 它不会提交视图状态，也不会启动 perform。调用方必须在合适时机调用 commitForward。
 */
export interface ForwardOptions {
  scriptExecution?: ScriptExecutionOptions;
}

export const forward = (options: ForwardOptions = {}) => {
  if (WebGAL.sceneManager.lockSceneWrite) {
    logger.warn('forward 被场景切换阻塞！');
    return false;
  }

  if (WebGAL.gameplay.performController.hasBlockingNextPerform()) {
    logger.warn('forward 被阻塞！');
    return false;
  }

  WebGAL.gameplay.performController.discardUncommittedNonHoldPerforms();
  WebGAL.gameplay.performController.clearNonHoldPerformsFromStageState();
  WebGAL.gameplay.performController.beginCollectingPerforms();
  try {
    scriptExecutor(0, options.scriptExecution);
  } finally {
    WebGAL.gameplay.performController.endCollectingPerforms();
  }
  return true;
};

/**
 * 将本轮 forward 的演算结果提交到视图，并启动 pending perform。
 *
 * 提交流程分三步：先提交 stage state，再启动 perform，最后应用 Pixi effects。
 * 这个顺序保证 startFunction 看到的是已提交的视图状态。
 */
export const commitForward = () => {
  stageStateManager.commit({ applyPixiEffects: false });
  WebGAL.gameplay.performController.commitPendingPerforms();
  stageStateManager.applyCommittedPixiEffects();
  WebGAL.flowchartManager.unlockPendingCurrentScene();
};

/**
 * 内部继续推进。
 *
 * 供场景切换完成、perform 自然结束、输入控件提交等内核流程调用。
 * 它不会触发 userInteractNext，因此不会把“内部自动继续”误判为用户点击。
 * 如果当前只剩可提前结束的非 hold 演出，会先结算它们并继续执行下一条语句。
 */
export const continueSentence = () => {
  const GUIState = webgalStore.getState().GUI;
  if (GUIState.showTitle) {
    return;
  }

  if (!preForward(true)) {
    return;
  }

  forward();
  commitForward();
};

/**
 * 用户操作步进。
 *
 * 供点击、键盘、自动播放和快进等“外部下一步”入口调用。
 * 它会触发 userInteractNext，让 intro 等演出先响应用户输入。
 * 如果当前存在可提前结束的普通演出，本次用户推进只结束演出，不再继续执行下一条语句。
 * 结算过程仍可能依据 goNextWhenOver 触发内部继续，那是演出要求的，需要满足。
 */
export const nextSentence = () => {
  WebGAL.events.userInteractNext.emit();

  const GUIState = webgalStore.getState().GUI;
  if (GUIState.showTitle) {
    return;
  }

  if (!preForward()) {
    return;
  }

  forward();
  commitForward();
};
