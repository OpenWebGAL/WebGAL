import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { IPerform } from '@/Core/controller/perform/performInterface';
import { webgalStore } from '@/store/store';
import { setStageVar } from '@/store/stageReducer';
import { logger } from '@/Core/util/etc/logger';
import { compile } from 'angular-expressions';

/**
 * 设置变量
 * @param sentence
 */
export const setVar = (sentence: ISentence): IPerform => {
  // 先把表达式拆分为变量名和赋值语句
  if (sentence.content.match(/=/)) {
    const key = sentence.content.split(/=/)[0];
    const valExp = sentence.content.split(/=/)[1];
    // 如果包含加减乘除号，则运算
    if (valExp.match(/[+\-*\/()]/)) {
      // 先取出运算表达式中的变量
      const valExpArr = valExp.split(/([+\-*\/()])/g);
      // 将变量替换为变量的值，然后合成表达式字符串
      const valExp2 = valExpArr
        .map((e) => {
          if (e.match(/[a-zA-Z]/)) {
            return getValueFromState(e).toString();
          } else return e;
        })
        .reduce((pre, curr) => pre + curr, '');
      const exp = compile(valExp2);
      const result = exp();
      webgalStore.dispatch(setStageVar({ key, value: result }));
    } else if (valExp.match(/true|false/)) {
      if (valExp.match(/true/)) {
        webgalStore.dispatch(setStageVar({ key, value: true }));
      }
      if (valExp.match(/false/)) {
        webgalStore.dispatch(setStageVar({ key, value: false }));
      }
    } else {
      if (!isNaN(Number(valExp))) {
        webgalStore.dispatch(setStageVar({ key, value: Number(valExp) }));
      } else webgalStore.dispatch(setStageVar({ key, value: valExp }));
    }
    logger.debug('设置变量：', { key, value: webgalStore.getState().stage.GameVar[key] });
  }
  return {
    performName: 'none',
    duration: 0,
    isOver: false,
    isHoldOn: false,
    stopFunction: () => {},
    blockingNext: () => false,
    blockingAuto: () => true,
    stopTimeout: undefined, // 暂时不用，后面会交给自动清除
  };
};

export function getValueFromState(key: string) {
  let ret: number | string | boolean = 0;
  if (webgalStore.getState().stage.GameVar.hasOwnProperty(key)) {
    ret = webgalStore.getState().stage.GameVar[key];
  }
  return ret;
}
