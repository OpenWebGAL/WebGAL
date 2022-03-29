/**
 * 子场景结束后回到父场景的入口
 * @interface sceneEntry
 */
import {ISaveSceneData, IStageState} from "../store/stage";
import { ISaveScene } from "../store/userData";

export interface sceneEntry {
    sceneName: string, //场景名称
    sceneUrl: string, //场景url
    continueLine: number //继续原场景的行号
}

export interface IBacklogItem {
    currentStageState: IStageState,
    saveScene: ISaveScene
}