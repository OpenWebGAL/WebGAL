import { IStoreRef } from '../interface/stateInterface/storeRefInterface';

// 初始化全局存储引用
export const storeRef: IStoreRef = {
    GuiRef: null,
    stageRef: null,
    userDataRef: null,
};

/**
 * 获取一个状态存储的引用
 * @param refKey 需要引用的状态类型
 * @return {object} 对状态存储的引用
 */
export const getRef = <K extends keyof IStoreRef>(refKey: K): any => {
    return storeRef[refKey].current;
};
