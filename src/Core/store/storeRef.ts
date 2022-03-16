/**
 * @interface
 * 全局存储的引用接口
 */
interface IStoreRef {
    GuiRef: any,
    stageRef: any,
    userDataRef: any
}


export const storeRef: IStoreRef = {
    GuiRef: null,
    stageRef: null,
    userDataRef: null
}