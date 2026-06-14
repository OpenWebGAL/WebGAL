import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { createNonePerform, IPerform } from '@/Core/Modules/perform/performInterface';
import { webgalStore } from '@/store/store';
import { logger } from '@/Core/util/logger';
import { setScriptManagedGlobalVar } from '@/store/userDataReducer';
import { ISetGameVar } from '@/Core/Modules/stage/stageInterface';
import { dumpToStorageFast } from '@/Core/controller/storage/storageController';
import { getBooleanArgByKey } from '../util/getSentenceArg';
import { stageStateManager } from '@/Core/Modules/stage/stageStateManager';
import { evaluateStageExpressionWithoutDot } from '../util/evalSentenceFn';

interface ISetGameVarFromExpressionPayload {
  key: string;
  value: string;
  isGlobal?: boolean;
  persistGlobal?: boolean;
}

/**
 * 设置变量表达式。
 */
export const setGameVarFromExpression = ({
  key,
  value,
  isGlobal = false,
  persistGlobal = true,
}: ISetGameVarFromExpressionPayload) => {
  const setGameVar = (payload: ISetGameVar) => {
    if (isGlobal) {
      webgalStore.dispatch(setScriptManagedGlobalVar(payload));
    } else {
      stageStateManager.setStageVar(payload);
    }
  };

  const normalizedKey = key.trim();
  if (!normalizedKey) {
    return;
  }
  setGameVar({ key: normalizedKey, value: evaluateStageExpressionWithoutDot(value, { returnType: 'origin' }) });
  if (isGlobal) {
    logger.debug('设置全局变量：', {
      key: normalizedKey,
      value: webgalStore.getState().userData.globalGameVar[normalizedKey],
    });
    if (persistGlobal) {
      dumpToStorageFast();
    }
  } else {
    logger.debug('设置变量：', {
      key: normalizedKey,
      value: stageStateManager.getCalculationStageState().GameVar[normalizedKey],
    });
  }
};

/**
 * 设置变量
 * @param sentence
 */
export const setVar = (sentence: ISentence): IPerform => {
  const setGlobal = getBooleanArgByKey(sentence, 'global') ?? false;
  if (sentence.content.match(/\s*=\s*/)) {
    const key = sentence.content.split(/\s*=\s*/)[0];
    const valExp = sentence.content.split(/\s*=\s*/)[1];
    setGameVarFromExpression({ key, value: valExp, isGlobal: setGlobal });
  }
  return createNonePerform();
};
