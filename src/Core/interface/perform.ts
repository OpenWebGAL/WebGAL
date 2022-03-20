/**
 * 描述演出的接口，主要用于控制演出，而不是执行
 * @interface IPerform
 */
export interface IPerform {
    performName: string,// 演出名称
    duration: number, // 持续时间，单位为ms
    isHoldOn: boolean, //演出要不要进舞台状态，在读档或回跳时触发，这时这个演出会保持，只能被专门的清除语句清除。
    stopFunction: Function, // 结束演出的函数，在演出时间到或被fast跳过后会触发（setTimeout(stopFunction,duration)用来在演出结束后清除演出）
    interruptible: Function, //演出是否可以被打断（一个函数，返回 boolean类型的结果，判断能不能打断）
    blockNext: Function // 演出是否阻塞游戏流程继续（一个函数，返回 boolean类型的结果，判断要不要阻塞）
    blockAuto: Function //演出是否阻塞自动模式（一个函数，返回 boolean类型的结果，判断要不要阻塞）
}

//next之后，可以被打断的演出会被打断，不能被打断的演出会继续，阻塞next的演出会阻止next被响应。
//可以被打断的演出会被移出演出列表
//只有所有演出都完成，或者仅存在不阻塞auto的演出，才允许auto