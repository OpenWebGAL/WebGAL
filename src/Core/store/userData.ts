/**
 * 用于存储与本地存储交换的状态信息。
 * 这些状态会在指定的生命周期与本地存储发生交换，比如打开存档界面、存档、修改设置时。
 * 在引擎初始化时会将这些状态从本地存储加载到运行时状态。
 */
import {IStageState} from "./stage";
import {useState} from "react";

/**
 * @enum
 * 播放速度的枚举类型
 */
export enum playSpeed{
    slow,//慢
    normal,//中
    fast//快
}

/**
 * @interface
 * 用户设置数据接口
 */
interface IOptionData{
    volumeMain:number,//主音量
    textSpeed:playSpeed,//文字速度
    autoSpeed:playSpeed,//自动播放速度
    vocalVolume:number,//语音音量
    bgmVolume:number//背景音乐音量
}

/**
 * @interface
 * 存档文件接口
 */
interface ISaveData{
    stageStage:IStageState, //舞台数据
    index:number,//存档的序号
    saveTime:string,//保存时间
}

/**
 * @interface
 * 用户数据接口
 */
export interface IUserData{
    saveData:Array<ISaveData>,//用户存档数据
    optionData:IOptionData//用户设置选项数据
}

//初始化用户数据
const initState:IUserData = {
    saveData:[],
    optionData:{
        volumeMain:100,//主音量
        textSpeed:playSpeed.normal,//文字速度
        autoSpeed:playSpeed.normal,//自动播放速度
        vocalVolume:100,//语音音量
        bgmVolume:50//背景音乐音量
    }
}

/**
 * 创建用户数据的状态管理
 * @return {IUserData} 用户数据
 * @return {function} 改变用户数据
 */
export function userDataStateStore() {
    const [userDataState, setUserDataState] = useState(initState);

    //设置用户数据
    const setUserData = <K extends keyof IUserData>(key: K, value: any) => {
        userDataState[key] = value;
        setUserDataState({...userDataState});
    }

    //替换用户数据（多用于与本地存储交互）
    const replaceUserData = (newUserData:IUserData)=>{
        setUserDataState({...newUserData});
    }

    return {
        userDataState,
        setUserData,
        replaceUserData
    }
}