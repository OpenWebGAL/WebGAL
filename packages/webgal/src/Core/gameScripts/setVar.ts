import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { IPerform } from '@/Core/Modules/perform/performInterface';
import { webgalStore } from '@/store/store';
import { setStageVar } from '@/store/stageReducer';
import { logger } from '@/Core/util/logger';
import { compile } from 'angular-expressions';
import { setGlobalVar } from '@/store/userDataReducer';
import { ActionCreatorWithPayload } from '@reduxjs/toolkit';
import { ISetGameVar } from '@/store/stageInterface';
import { dumpToStorageFast } from '@/Core/controller/storage/storageController';
import get from 'lodash/get';
/**
 * 设置变量
 * @param sentence
 */
export const setVar = (sentence: ISentence): IPerform => {
  let setGlobal = false;
  sentence.args.forEach((e) => {
    if (e.key === 'global') {
      setGlobal = true;
    }
  });
  let targetReducerFunction: ActionCreatorWithPayload<ISetGameVar, string>;
  if (setGlobal) {
    targetReducerFunction = setGlobalVar;
  } else {
    targetReducerFunction = setStageVar;
  }
  // 先把表达式拆分为变量名和赋值语句
  if (sentence.content.match(/\s*=\s*/)) {
    const key = sentence.content.split(/\s*=\s*/)[0];
    const valExp = sentence.content.split(/\s*=\s*/)[1];
    if (valExp === 'random()') {
      webgalStore.dispatch(targetReducerFunction({ key, value: Math.random() }));
    } else if (valExp.match(/\$[.a-zA-Z]/)) {
      webgalStore.dispatch(targetReducerFunction({ key, value: String(getValueFromState(valExp.trim())) }));
    } else if (valExp.match(/[+\-*\/()]/)) {
      // 如果包含加减乘除号，则运算
      // 先取出运算表达式中的变量
      const valExpArr = valExp.split(/([+\-*\/()])/g);
      // 将变量替换为变量的值，然后合成表达式字符串
      const valExp2 = valExpArr
        .map((e) => {
          if (e.match(/\$?[.a-zA-Z]/)) {
            return String(getValueFromState(e.trim()));
          } else return e;
        })
        .reduce((pre, curr) => pre + curr, '');
      const exp = compile(valExp2);
      const result = exp();
      webgalStore.dispatch(targetReducerFunction({ key, value: result }));
    } else if (valExp.match(/true|false/)) {
      if (valExp.match(/true/)) {
        webgalStore.dispatch(targetReducerFunction({ key, value: true }));
      }
      if (valExp.match(/false/)) {
        webgalStore.dispatch(targetReducerFunction({ key, value: false }));
      }
    } else {
      if (!isNaN(Number(valExp))) {
        webgalStore.dispatch(targetReducerFunction({ key, value: Number(valExp) }));
      } else {
        webgalStore.dispatch(targetReducerFunction({ key, value: valExp }));
      }
    }
    if (setGlobal) {
      logger.debug('设置全局变量：', { key, value: webgalStore.getState().userData.globalGameVar[key] });
      dumpToStorageFast();
    } else {
      logger.debug('设置变量：', { key, value: webgalStore.getState().stage.GameVar[key] });
    }
  }
  return {
    performName: 'none',
    duration: 0,
    isHoldOn: false,
    stopFunction: () => {},
    blockingNext: () => false,
    blockingAuto: () => true,
    stopTimeout: undefined, // 暂时不用，后面会交给自动清除
  };
};

type BaseVal = string | number | boolean;

export function getValueFromState(key: string) {
  let ret: any = 0;
  const stage = webgalStore.getState().stage;
  const userData = webgalStore.getState().userData;
  const _Merge = { ...stage, ...userData };
  const is_baseVal = (_obj: object, _val: any, no_get = false) =>
    ['string', 'number', 'boolean'].includes(typeof (no_get ? _val : Reflect.get(_obj, _val)));
  let _all: { [key: PropertyKey]: any } = {};
  // 排除GameVar、globalGameVar因为这几个本来就可以获取
  for (let propertyName in _Merge) {
    if (propertyName === 'GameVar') continue;
    if (propertyName === 'globalGameVar') continue;
    if (propertyName) {
      // @ts-ignore
      _all['$' + propertyName] = get(_Merge, propertyName) as BaseVal;
    }
  }
  if (stage.GameVar.hasOwnProperty(key)) {
    ret = stage.GameVar[key];
  } else if (userData.globalGameVar.hasOwnProperty(key)) {
    ret = userData.globalGameVar[key];
  } else if (key.startsWith('$') && is_baseVal(_all, compile(key)(_all), true)) {
    ret = compile(key)(_all) as BaseVal;
  }
  return ret;
}
