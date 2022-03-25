import {useRef} from "react";

/**
 * @interface IStoreRef 全局存储的引用接口
 */
interface IStoreRef {
    GuiRef: any,
    stageRef: any,
    userDataRef: any
}

//初始化全局存储引用
export const storeRef: IStoreRef = {
    GuiRef: null,
    stageRef: null,
    userDataRef: null
}

export const getRef = <K extends keyof IStoreRef>(refKey: K): any => {
    return storeRef[refKey].current;
}