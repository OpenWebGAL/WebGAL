import { scriptExecutor } from './scriptExecutor';
import { logger } from '../../util/logger';
import { webgalStore } from '@/store/store';

import { WebGAL } from '@/Core/WebGAL';
import { stageStateManager } from '@/Core/Modules/stage/stageStateManager';

/**
 * 步进前工作：检查阻塞，并在当前演出未完成时提前结束普通演出。
 */
export const preForward = () => {
  if (WebGAL.gameplay.performController.hasBlockingNextPerform()) {
    logger.warn('next 被阻塞！');
    return false;
  }

  const hasUnsettledNonHoldPerform = WebGAL.gameplay.performController.hasUnsettledNonHoldPerform();
  if (hasUnsettledNonHoldPerform) {
    logger.debug('提前结束被触发，现在清除普通演出');
    WebGAL.gameplay.performController.settleNonHoldPerforms();
    return false;
  }

  return true;
};

/**
 * 执行一条语句或由 -next 连接的语句序列，只修改演算状态并收集演出。
 */
export const forward = () => {
  WebGAL.gameplay.performController.discardUncommittedNonHoldPerforms();
  WebGAL.gameplay.performController.clearNonHoldPerformsFromStageState();
  WebGAL.gameplay.performController.beginCollectingPerforms();
  try {
    scriptExecutor();
  } finally {
    WebGAL.gameplay.performController.endCollectingPerforms();
  }
};

/**
 * 将演算状态提交到当前视图状态，并启动本序列收集到的演出。
 */
export const commitForward = () => {
  stageStateManager.commit();
  WebGAL.gameplay.performController.commitPendingPerforms();
};

/**
 * 用户操作步进。
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
