import {IRunPerform} from "../coreInterface/performInterface";

/**
 * 游戏内变量
 * @interface IGameVar
 */
export interface IGameVar {
    [propName: string]: string | boolean | number //游戏内变量可以是字符串、布尔值、数字
}

/**
 * 单个选项
 * @interface IChooseItem
 */
export interface IChooseItem {
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


/**
 * @interface IStageState 游戏舞台数据接口
 */
export interface IStageState {
    oldBgName: string,//旧背景的文件路径
    bgName: string,//背景文件地址（相对或绝对）
    figName: string,//立绘_中 文件地址（相对或绝对）
    figNameLeft: string,//立绘_左 文件地址（相对或绝对）
    figNameRight: string,//立绘_右 文件地址（相对或绝对）
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