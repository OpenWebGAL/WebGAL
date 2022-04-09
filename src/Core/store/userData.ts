/**
 * 用于存储与本地存储交换的状态信息。
 * 这些状态会在指定的生命周期与本地存储发生交换，比如打开存档界面、存档、修改设置时。
 * 在引擎初始化时会将这些状态从本地存储加载到运行时状态。
 */
import {useState} from "react";
import {logger} from "../util/logger";
import {IOptionData, IUserData} from "../interface/stateInterface/userDataInterface";

/**
 * 播放速度的枚举类型
 */
export enum playSpeed {
    slow,//慢
    normal,//中
    fast//快
}

export enum textSize {
    small,
    medium,
    large
}


//初始化用户数据
const initState: IUserData = {
    saveData: [],
    optionData: {
        slPage: 1,
        volumeMain: 100,//主音量
        textSpeed: playSpeed.normal,//文字速度
        autoSpeed: playSpeed.normal,//自动播放速度
        textSize: textSize.medium,
        vocalVolume: 100,//语音音量
        bgmVolume: 50//背景音乐音量
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
        setUserDataState(state => {
            state[key] = value;
            return {...state};
        });
    }

    //替换用户数据（多用于与本地存储交互）
    const replaceUserData = (newUserData: IUserData) => {
        setUserDataState(state => ({...state, ...newUserData}));
    }

    const setOptionData = <K extends keyof IOptionData>(key: K, value: any) => {
        setUserDataState(state => {
            state.optionData[key] = value;
            return {...state};
        });
    }

    const setSlPage = (index: number) => {
        setUserDataState(state => {
            state.optionData.slPage = index;
            return {...state};
        });
    }

    return {
        userDataState,
        setUserData,
        replaceUserData,
        setOptionData,
        setSlPage
    }
}