import { IBacklogItem, sceneEntry } from '../coreInterface/runtimeInterface'
import { IStageState } from './stageInterface'
import { playSpeed, textSize } from '../../store/userData'

/**
 * @interface IOptionData 用户设置数据接口
 */
export interface IOptionData {
    volumeMain: number // 主音量
    textSpeed: playSpeed // 文字速度
    autoSpeed: playSpeed // 自动播放速度
    textSize: textSize
    vocalVolume: number // 语音音量
    bgmVolume: number // 背景音乐音量
    slPage: number // 存读档界面所在页面
}

/**
 * 场景存档接口
 * @interface ISaveScene
 */
export interface ISaveScene {
    currentSentenceId: number // 当前语句ID
    sceneStack: Array<sceneEntry> // 场景栈
    sceneName: string // 场景名称
    sceneUrl: string // 场景url
}

/**
 * @interface ISaveData 存档文件接口
 */
export interface ISaveData {
    nowStageState: IStageState
    backlog: Array<IBacklogItem> // 舞台数据
    index: number // 存档的序号
    saveTime: string // 保存时间
    sceneData: ISaveScene // 场景数据
}

/**
 * @interface IUserData 用户数据接口
 */
export interface IUserData {
    saveData: Array<ISaveData> // 用户存档数据
    optionData: IOptionData // 用户设置选项数据
}
