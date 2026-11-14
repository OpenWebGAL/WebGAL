import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { IPerform } from '@/Core/Modules/perform/performInterface';
import { getBooleanArgByKey } from '@/Core/util/getSentenceArg';

/**
 * 等待 n 毫秒
 * @param sentence
 */
export const wait = (sentence: ISentence): IPerform => {
  const duration = Number(sentence.content);
  const performName = `wait${Math.random().toString()}`;
  const nobreak = getBooleanArgByKey(sentence, 'nobreak') ?? false;

  return {
    performName,
    duration: duration,
    goNextWhenOver: true,
    isHoldOn: false,
    stopFunction: () => {
      // 无需状态清理
    },
    blockingNext: () => nobreak,
    // nobreak 只限制用户点击；自动播放无论如何都要等待结束，否则等待会被自动播放截短。
    blockingAuto: () => true,
  };
};
