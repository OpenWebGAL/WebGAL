/**
 * 子场景结束后回到父场景的入口
 * @interface sceneEntry
 */
import { IStageState } from '../stateInterface/stageInterface';
import { ISaveScene } from '../stateInterface/userDataInterface';
import { IPerform } from './performInterface';

export interface sceneEntry {
    sceneName: string // 场景名称
    sceneUrl: string // 场景url
    continueLine: number // 继续原场景的行号
}

export interface IBacklogItem {
    currentStageState: IStageState
    saveScene: ISaveScene
}

/**
 * 游戏运行时变量接口
 * @interface IGamePlay
 */
export interface IGamePlay {
    performList: Array<IPerform> // 当前演出序列
    timeoutList: Array<any> // 定时器（用于清除演出）列表
    isAuto: boolean
    isFast: boolean
    autoInterval: ReturnType<typeof setInterval> | null
    fastInterval: ReturnType<typeof setInterval> | null
    autoTimeout: ReturnType<typeof setTimeout> | null
}
