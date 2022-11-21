import { RUNTIME_GAMEPLAY } from '../../runtime/gamePlay';

/**
 * 卸载演出
 * @param name 演出的名称
 */
export const unmountPerform = (name: string) => {
  for (let i = 0; i < RUNTIME_GAMEPLAY.performList.length; i++) {
    const e = RUNTIME_GAMEPLAY.performList[i];
    if (!e.isHoldOn && e.performName === name) {
      e.stopFunction();
      clearTimeout(e.stopTimeout);
      RUNTIME_GAMEPLAY.performList.splice(i, 1);
      i--;
    }
  }
};
