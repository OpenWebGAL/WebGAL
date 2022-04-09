/**
 * 所有会被Save和Backlog记录下的信息，构成当前的舞台状态（也包括游戏运行时变量）
 * 舞台状态是演出结束后的“终态”，在读档时不发生演出，只是将舞台状态替换为读取的状态。
 */

import { useState } from 'react'
import * as _ from 'lodash'
import { IStageState } from '../interface/stateInterface/stageInterface'

// 初始化舞台数据
export const initState: IStageState = {
    oldBgName: '',
    bgName: '', // 背景文件地址（相对或绝对）
    figName: '', // 立绘_中 文件地址（相对或绝对）
    figNameLeft: '', // 立绘_左 文件地址（相对或绝对）
    figNameRight: '', // 立绘_右 文件地址（相对或绝对）
    showText: '', // 文字
    showName: '', // 人物名
    command: '', // 语句指令
    choose: [], // 选项列表
    vocal: '', // 语音 文件地址（相对或绝对）
    bgm: '', // 背景音乐 文件地址（相对或绝对）
    miniAvatar: '', // 小头像 文件地址（相对或绝对）
    GameVar: {}, // 游戏内变量
    effects: [], // 应用的效果
    PerformList: [], // 要启动的演出列表
}

/**
 * 创建舞台的状态管理
 * @return {IStageState} 舞台状态
 * @return {function} 改变舞台状态
 */
export function stageStateStore() {
    const [stageState, setStageState] = useState(_.cloneDeep(initState))

    /**
     * 设置舞台状态，以后会改
     * @param key
     * @param value
     */
    const setStage = <K extends keyof IStageState>(key: K, value: any) => {
        stageState[key] = value
        setStageState((state) => ({ ...state, ...stageState }))
    }

    const getStageState = () => {
        return stageState
    }

    const restoreStage = (newState: IStageState) => {
        setStageState((state) => ({ ...state, ...newState }))
    }

    return {
        stageState,
        setStage,
        getStageState,
        restoreStage,
    }
}
