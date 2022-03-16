/**
 * 所有会被Save和Backlog记录下的信息，构成当前的舞台状态（也包括游戏运行时变量）
 * 舞台状态是演出结束后的“终态”，在读档时不发生演出，只是将舞台状态替换为读取的状态。
 */

import {useState} from "react";

/**
 * @interface
 * 游戏内变量
 */
interface IGameVar {
    [propName: string]: string | boolean | number //游戏内变量可以是字符串、布尔值、数字
}

/**
 * @interface
 * 游戏舞台数据接口
 */
export interface IStageState {
    SceneName: string,//场景文件名
    SentenceID: number,//语句ID
    bg_Name: string,//背景文件地址（相对或绝对）
    fig_Name: string,//立绘_中 文件地址（相对或绝对）
    fig_Name_left: string,//立绘_左 文件地址（相对或绝对）
    fig_Name_right: string,//立绘_右 文件地址（相对或绝对）
    showText: string,//文字
    showName: string,//人物名
    command: string,//语句指令
    choose: Array<any>,//选项列表
    vocal: string,//语音 文件地址（相对或绝对）
    bgm: string,//背景音乐 文件地址（相对或绝对）
    miniAvatar: string,//小头像 文件地址（相对或绝对）
    GameVar: IGameVar, //游戏内变量
    bg_filter: string, //背景效果，是CSS语句
    bg_transform: string, //背景变换，是CSS语句
    pixiPerformList: Array<any> //作为背景的 pixi 演出
}

//初始化舞台数据
const initState:IStageState = {
    SceneName: '',//场景文件名
    SentenceID: 0,//语句ID
    bg_Name: '',//背景文件地址（相对或绝对）
    fig_Name: '',//立绘_中 文件地址（相对或绝对）
    fig_Name_left: '',//立绘_左 文件地址（相对或绝对）
    fig_Name_right: '',//立绘_右 文件地址（相对或绝对）
    showText: '',//文字
    showName: '',//人物名
    command: '',//语句指令
    choose: [],//选项列表
    vocal: '',//语音 文件地址（相对或绝对）
    bgm: '',//背景音乐 文件地址（相对或绝对）
    miniAvatar: '',//小头像 文件地址（相对或绝对）
    GameVar: {}, //游戏内变量
    bg_filter: '', //背景效果，是CSS语句
    bg_transform: '', //背景变换，是CSS语句
    pixiPerformList: [] //作为背景的 pixi 演出
}

/**
 * 创建舞台的状态管理
 * @return {IStageState} 舞台状态
 * @return {function} 改变舞台状态
 */
export function StageStateStore() {
    const [stageState, setStageState] = useState(initState);

    const setStage = <K extends keyof IStageState>(key: K, value: any) => {
        stageState[key] = value;
        setStageState({...stageState});
    }

    return {
        stageState,
        setStage,
    }
}