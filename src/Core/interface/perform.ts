/**
 * 描述演出的接口，主要用于控制演出，而不是执行
 * @interface IPerform
 */
export interface IPerform {
    performName: string,// 演出名称
    duration: number, // 持续时间，单位为ms
    stopFunction: Function, // 结束演出的函数
    interruptable: boolean, //演出是否可以被打断
    blockNext: Function // 演出是否阻塞游戏流程继续（一个函数，返回 boolean类型的结果，判断要不要阻塞）
}