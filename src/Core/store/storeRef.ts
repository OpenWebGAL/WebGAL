import {useRef} from "react";

/**
 * @interface
 * 全局存储的引用接口
 */
interface IStoreRef {
    GuiRef: ReturnType<typeof useRef> | null,
    stageRef: ReturnType<typeof useRef> | null,
    userDataRef: ReturnType<typeof useRef> | null
}


export const storeRef: IStoreRef = {
    GuiRef: null,
    stageRef: null,
    userDataRef: null
}