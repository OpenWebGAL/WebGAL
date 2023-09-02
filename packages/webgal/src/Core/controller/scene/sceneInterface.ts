/**
 * 语句类型
 */
import { fileType } from '@/Core/util/gameAssetsAccess/assetSetter';
import { ISceneEntry } from '@/Core/Modules/scene';

export enum commandType {
  say, // 对话
  changeBg, // 更改背景
  changeFigure, // 更改立绘
  bgm, // 更改背景音乐
  video, // 播放视频
  pixi, // pixi演出
  pixiInit, // pixi初始化
  intro, // 黑屏文字演示
  miniAvatar, // 小头像
  changeScene, // 切换场景
  choose, // 分支选择
  end, // 结束游戏
  setComplexAnimation, // 动画演出
  setFilter, // 设置效果
  label, // 标签
  jumpLabel, // 跳转标签
  chooseLabel, // 选择标签
  setVar, // 设置变量
  if, // 条件跳转
  callScene, // 调用场景
  showVars,
  unlockCg,
  unlockBgm,
  filmMode,
  setTextbox,
  setAnimation,
  playEffect,
  setTempAnimation,
  comment,
  setTransform,
  setTransition,
}

/**
 * 单个参数接口
 * @interface arg
 */
export interface arg {
  key: string; // 参数键
  value: string | boolean | number; // 参数值
}

/**
 * 资源接口
 * @interface IAsset
 */
export interface IAsset {
  name: string; // 资源名称
  type: fileType; // 资源类型
  url: string; // 资源url
  lineNumber: number; // 触发资源语句的行号
}

/**
 * 单条语句接口
 * @interface ISentence
 */
export interface ISentence {
  command: commandType; // 语句类型
  commandRaw: string; // 命令的原始内容，方便调试
  content: string; // 语句内容
  args: Array<arg>; // 参数列表
  sentenceAssets: Array<IAsset>; // 语句携带的资源列表
  subScene: Array<string>; // 语句包含子场景列表
}

/**
 * 场景接口
 * @interface IScene
 */
export interface IScene {
  sceneName: string; // 场景名称
  sceneUrl: string; // 场景url
  sentenceList: Array<ISentence>; // 语句列表
  assetsList: Array<IAsset>; // 资源列表
  subSceneList: Array<string>; // 子场景的url列表
}

/**
 * 当前的场景数据
 * @interface ISceneData
 */
export interface ISceneData {
  currentSentenceId: number; // 当前语句ID
  sceneStack: Array<ISceneEntry>; // 场景栈
  currentScene: IScene; // 当前场景数据
}

/**
 * 处理后的命令接口
 * @interface parsedCommand
 */
export interface parsedCommand {
  type: commandType;
  additionalArgs: Array<arg>;
}
