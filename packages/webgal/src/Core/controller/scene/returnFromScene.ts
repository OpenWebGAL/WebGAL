import { restoreScene } from './restoreScene';
import { setGameVar } from '@/Core/gameScripts/setVar';

import { WebGAL } from '@/Core/WebGAL';

/**
 * 从被调用的场景返回：弹出调用帧，把返回值写回调用方，再恢复调用方场景。
 * 场景栈为空（顶层场景）或场景正在写入时不做任何事。
 * @param returnValue 返回值，没有 return 语句而自然结束时为空值
 */
export const returnFromScene = (returnValue: string | boolean | number = '') => {
  // 必须在弹栈之前判定，否则 restoreScene 提前返回会丢掉这一帧
  if (WebGAL.sceneManager.lockSceneWrite) {
    return;
  }
  const entry = WebGAL.sceneManager.popFrame();
  if (!entry) {
    return;
  }
  if (entry.writeReturnTo) {
    setGameVar({ key: entry.writeReturnTo, value: returnValue });
  }
  restoreScene(entry);
};
