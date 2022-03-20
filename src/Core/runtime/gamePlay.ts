import {IPerform} from "../interface/perform";

interface IGamePlay {
    performList: Array<IPerform>, //当前演出序列
    timeoutList: Array<any>,// 定时器（用于清除演出）列表
}

/**
 * 游戏运行时变量
 */
export const runtime_gamePlay: IGamePlay = {
    performList: [],
    timeoutList: []
}
