import { scriptExecutor } from './scriptExecutor';
import { logger } from '../../util/logger';
import { webgalStore } from '@/store/store';
import { resetStageState } from '@/store/stageReducer';
import cloneDeep from 'lodash/cloneDeep';
import { IBacklogItem } from '@/Core/Modules/backlog';

import { SYSTEM_CONFIG } from '@/config';
import { WebGAL } from '@/Core/WebGAL';
import { IRunPerform } from '@/store/stageInterface';

/**
 * 进行下一句
 */
export const nextSentence = () => {
  /**
   * 发送 “发生点击下一句” 事件。
   */
  WebGAL.events.userInteractNext.emit();

  // 如果当前显示标题，那么不进行下一句
  const GUIState = webgalStore.getState().GUI;
  if (GUIState.showTitle) {
    return;
  }

  // 第一步，检查是否存在 blockNext 的演出
  let isBlockingNext = false;
  WebGAL.gameplay.performController.performList.forEach((e) => {
    if (e.blockingNext())
      // 阻塞且没有结束的演出
      isBlockingNext = true;
  });
  if (isBlockingNext) {
    // 有阻塞，提前结束
    logger.warn('next 被阻塞！');
    return;
  }

  // 检查是否处于演出完成状态，不是则结束所有普通演出（保持演出不算做普通演出）
  let allSettled = true;
  WebGAL.gameplay.performController.performList.forEach((e) => {
    if (!e.isHoldOn && !e.skipNextCollect) allSettled = false;
  });
  if (allSettled) {
    // 所有普通演出已经结束
    // if (WebGAL.backlogManager.isSaveBacklogNext) {
    //   WebGAL.backlogManager.isSaveBacklogNext = false;
    // }
    // 清除状态表的演出序列（因为这时候已经准备进行下一句了）
    const stageState = webgalStore.getState().stage;
    const newStageState = cloneDeep(stageState);
    for (let i = 0; i < newStageState.PerformList.length; i++) {
      const e: IRunPerform = newStageState.PerformList[i];
      if (!e.isHoldOn) {
        newStageState.PerformList.splice(i, 1);
        i--;
      }
    }
    webgalStore.dispatch(resetStageState(newStageState));
    scriptExecutor();
    return;
  }

  // 不处于 allSettled 状态，清除所有普通演出，强制进入settled。
  logger.debug('提前结束被触发，现在清除普通演出');
  let isGoNext = false;
  for (let i = 0; i < WebGAL.gameplay.performController.performList.length; i++) {
    const e = WebGAL.gameplay.performController.performList[i];
    if (!e.isHoldOn) {
      if (e.goNextWhenOver) {
        isGoNext = true;
      } // 先检查是不是要跳过收集
      if (!e.skipNextCollect) {
        // 由于提前结束使用的不是 unmountPerform 标准 API，所以不会触发两次 nextSentence
        e.stopFunction();
        clearTimeout(e.stopTimeout as unknown as number);
        WebGAL.gameplay.performController.performList.splice(i, 1);
        i--;
      }
    }
  }
  if (isGoNext) {
    // 由于不使用 unmountPerform 标准 API，这里需要手动收集一下 isGoNext
    nextSentence();
  }
};
