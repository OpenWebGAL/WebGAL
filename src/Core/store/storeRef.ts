import {useRef} from "react";

/**
 * @interface IStoreRef 全局存储的引用接口
 */
interface IStoreRef {
    GuiRef: ReturnType<typeof useRef> | null,
    stageRef: ReturnType<typeof useRef> | null,
    userDataRef: ReturnType<typeof useRef> | null
}

//初始化全局存储引用
export const storeRef: IStoreRef = {
    GuiRef: null,
    stageRef: null,
    userDataRef: null
}