import { ISentence } from '../scene/sceneInterface';

/**
 * 描述演出的接口，主要用于控制演出，而不是执行（在演出开始时被调用演出的执行器返回）
 * @interface IPerform
 */
export interface IPerform {
  performName: string; // 演出名称，用于在后面手动清除演出，如果没有标识，则代表不是保持演出，给予一个随机字符串
  duration: number; // 持续时间，单位为ms，持续时间到后强制设置该演出为“已经结束”状态
  isOver: boolean; // 演出是否已经结束
  isHoldOn: boolean; // 演出是不是一个保持类型的演出
  stopFunction: Function; // 卸载演出的函数
  blockingNext: Function; // 演出是否阻塞游戏流程继续（一个函数，返回 boolean类型的结果，判断要不要阻塞）
  blockingAuto: Function; // 演出是否阻塞自动模式（一个函数，返回 boolean类型的结果，判断要不要阻塞）
  stopTimeout: any;
  // 演出结束后转到下一句
  goNextWhenOver?: boolean;
  // 对于延迟触发的演出，使用 Promise
  arrangePerformPromise?: Promise<IPerform>;
}

// next之后，可以被打断的演出会被打断，不能被打断的演出会继续，阻塞next的演出会阻止next被响应。
// 被打断或执行完毕的演出会移出演出列表
// 只有所有演出都完成，或者仅存在不阻塞auto的演出，才允许auto

/**
 * 启动演出接口
 * @interface IRunPerform
 */
export interface IRunPerform {
  id: string;
  isHoldOn: boolean; // 演出类型
  script: ISentence; // 演出脚本
}

/**
 * 初始化的演出
 */
export const initPerform: IPerform = {
  performName: '',
  duration: 100,
  isOver: false,
  isHoldOn: false,
  stopFunction: () => {},
  blockingNext: () => false,
  blockingAuto: () => true,
  stopTimeout: undefined,
};
