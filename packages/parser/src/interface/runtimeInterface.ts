/**
 * 子场景结束后回到父场景的入口
 * @interface sceneEntry
 */
export interface sceneEntry {
  sceneName: string; // 场景名称
  sceneUrl: string; // 场景url
  continueLine: number; // 继续原场景的行号
  locals?: Record<string, any>; // 该帧的局部变量
  writeReturnTo?: string; // 返回值写回该帧的哪个变量
}

/**
 * 场景栈条目接口 (兼容性别名)
 * @interface ISceneEntry
 */
export interface ISceneEntry extends sceneEntry {}
