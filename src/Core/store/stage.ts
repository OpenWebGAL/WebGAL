/**
 * 所有会被Save和Backlog记录下的信息，构成当前的舞台状态（也包括游戏运行时变量）
 * 舞台状态是演出结束后的“终态”，在读档时不发生演出，只是将舞台状态替换为读取的状态。
 */

import {useState} from "react";
import {IRunPerform} from "../interface/perform";
import {initSceneData, ISceneData } from "../runtime/sceneData";

/**
 * 游戏内变量
 * @interface IGameVar
 */
interface IGameVar {
    [propName: string]: string | boolean | number //游戏内变量可以是字符串、布尔值、数字
}

/**
 * 单个选项
 * @interface IChooseItem
 */
interface IChooseItem {
    key: string, //选项名称
    targetScene: string, // 选项target
    isSubScene: boolean, // 是否是子场景调用
}

/**
 * 基本效果接口
 * @interface IEffect
 */
export interface IEffect {
    target: string, //作用目标
    transform: string,//变换
    filter: string,//效果
}

export interface ISaveSceneData {
    name:string,
    url:string,
    currentSentence:number
}

const initSaveSceneData:ISaveSceneData = {
    name:'',
    url:'',
    currentSentence:0
}

/**
 * @interface IStageState 游戏舞台数据接口
 */
export interface IStageState {
    sceneData:ISaveSceneData,
    bg_Name: string,//背景文件地址（相对或绝对）
    fig_Name: string,//立绘_中 文件地址（相对或绝对）
    fig_Name_left: string,//立绘_左 文件地址（相对或绝对）
    fig_Name_right: string,//立绘_右 文件地址（相对或绝对）
    showText: string,//文字
    showName: string,//人物名
    command: string,//语句指令
    choose: Array<IChooseItem>,//选项列表
    vocal: string,//语音 文件地址（相对或绝对）
    bgm: string,//背景音乐 文件地址（相对或绝对）
    miniAvatar: string,//小头像 文件地址（相对或绝对）
    GameVar: IGameVar, //游戏内变量
    effects: Array<IEffect>,//应用的变换
    PerformList: Array<IRunPerform> //要启动的演出列表
}

//初始化舞台数据
const initState: IStageState = {
    sceneData: initSaveSceneData,
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
    effects: [], //应用的效果
    PerformList: [] //要启动的演出列表
}

/**
 * 创建舞台的状态管理
 * @return {IStageState} 舞台状态
 * @return {function} 改变舞台状态
 */
export function stageStateStore() {
    const [stageState, setStageState] = useState(initState);

    /**
     * 设置舞台状态，以后会改
     * @param key
     * @param value
     */
    const setStage = <K extends keyof IStageState>(key: K, value: any) => {
        stageState[key] = value;
        setStageState({...stageState});
    }

    const getStageState = () => {
        return stageState;
    }

    return {
        stageState,
        setStage,
        getStageState
    }
}