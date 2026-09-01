import { ISceneData } from '@/Core/controller/scene/sceneInterface';
import { IGameVar } from '@/Core/Modules/stage/stageInterface';
import cloneDeep from 'lodash/cloneDeep';

/**
 * 场景栈的深度上限，防止 callScene 无限递归
 */
export const MAX_SCENE_STACK_DEPTH = 64;

export interface ISceneEntry {
  sceneName: string; // 场景名称
  sceneUrl: string; // 场景url
  continueLine: number; // 继续原场景的行号
  locals?: IGameVar; // 该帧的局部变量
  writeReturnTo?: string; // 返回值写回该帧的哪个变量
}

/**
 * 初始化场景数据
 */
export const initSceneData = {
  currentSentenceId: 0, // 当前语句ID
  sceneStack: [],
  // 初始场景，没有数据
  currentScene: {
    sceneName: '', // 场景名称
    sceneUrl: '', // 场景url
    sentenceList: [], // 语句列表
    assetsList: [], // 资源列表
    subSceneList: [], // 子场景列表
  },
  currentLocals: {}, // 当前帧的局部变量
};

export class SceneManager {
  public settledScenes: Set<string> = new Set();
  public settledAssets: Set<string> = new Set();
  public sceneData: ISceneData = cloneDeep(initSceneData);
  public lockSceneWrite = false;
  public sceneWritePromise: Promise<void> | null = null;

  public resetScene() {
    this.sceneData.currentSentenceId = 0;
    this.sceneData.sceneStack = [];
    this.sceneData.currentScene = cloneDeep(initSceneData.currentScene);
    this.sceneData.currentLocals = {};
    this.sceneWritePromise = null;
    this.settledScenes.clear();
    this.settledAssets.clear();
  }

  /**
   * 压入一个调用帧。把当前帧（调用方）存进场景栈，并切换到被调用场景的局部变量。
   * 场景栈与 currentLocals 是同一个栈的两截，必须经由本方法与 popFrame 一起变更。
   * @param locals 被调用场景的局部变量
   * @param writeReturnTo 返回值写回当前帧的哪个变量
   */
  public pushFrame(locals: IGameVar, writeReturnTo?: string) {
    this.sceneData.sceneStack.push({
      sceneName: this.sceneData.currentScene.sceneName,
      sceneUrl: this.sceneData.currentScene.sceneUrl,
      continueLine: this.sceneData.currentSentenceId,
      locals: this.sceneData.currentLocals,
      writeReturnTo,
    });
    this.sceneData.currentLocals = locals;
  }

  /**
   * 弹出一个调用帧，并恢复调用方的局部变量。栈为空时返回 undefined。
   */
  public popFrame(): ISceneEntry | undefined {
    const entry = this.sceneData.sceneStack.pop();
    if (entry) {
      this.sceneData.currentLocals = entry.locals ?? {}; // 旧存档的栈条目没有 locals
    }
    return entry;
  }
}
