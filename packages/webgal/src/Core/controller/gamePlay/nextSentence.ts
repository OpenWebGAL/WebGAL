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
 * 3. 存在可提前结束的非 hold 演出时，用户推进只负责结束演出并停下；
 *    内部继续推进会先结束演出，然后继续执行下一条语句。
 *
 * @param continueAfterSettling 是否在清理普通非 hold 演出后继续推进。
 * @returns true 表示可以继续调用 forward/commitForward。
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
    // 用户 next 不消费 goNextWhenOver；内部继续推进会自己接着 forward，避免重复触发下一步。
    WebGAL.gameplay.performController.settleNonHoldPerforms(!continueAfterSettling);
    return continueAfterSettling;
  }

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
