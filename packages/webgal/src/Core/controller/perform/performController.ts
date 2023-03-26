import { IPerform } from '@/Core/controller/perform/performInterface';
import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { webgalStore } from '@/store/store';
import cloneDeep from 'lodash/cloneDeep';
import { resetStageState } from '@/store/stageReducer';
import { unmountPerform } from '@/Core/controller/perform/unmountPerform';
import { RUNTIME_GAMEPLAY } from '@/Core/runtime/gamePlay';
import { nextSentence } from '@/Core/controller/gamePlay/nextSentence';

export class PerformController {
  public static arrangeNewPerform(perform: IPerform, script: ISentence, syncPerformState = true) {
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
      perform.isOver = true;
      if (!perform.isHoldOn) {
        // 如果不是保持演出，清除
        unmountPerform(perform.performName);
        if (perform.goNextWhenOver) {
          // nextSentence();
          this.goNextWhenOver();
        }
      }
    }, perform.duration);

    RUNTIME_GAMEPLAY.performList.push(perform);
  }

  private static goNextWhenOver() {
    let isBlockingAuto = false;
    RUNTIME_GAMEPLAY.performList.forEach((e) => {
      if (e.blockingAuto() && !e.isOver)
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
