import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { IPerform } from '@/Core/Modules/perform/performInterface';
import { playBgm } from '@/Core/controller/stage/playBgm';
import { getNumberArgByKey } from '@/Core/util/getSentenceArg';
import { webgalStore } from '@/store/store';
import { unlockBgmInUserData } from '@/store/userDataReducer';

/**
 * 播放一段bgm
 * @param sentence
 */
export const bgm = (sentence: ISentence): IPerform => {
  let url: string = sentence.content; // 获取bgm的url
  let name = '';
  let series = 'default';
  sentence.args.forEach((e) => {
    if (e.key === 'unlockname') {
      name = e.value.toString();
    }
    if (e.key === 'series') {
      series = e.value.toString();
    }
  });
  const enter = getNumberArgByKey(sentence, 'enter') ?? 0; // 获取bgm的淡入时间
  const volume = getNumberArgByKey(sentence, 'volume') ?? 0; // 获取bgm的音量比
  if (name !== '') webgalStore.dispatch(unlockBgmInUserData({ name, url, series }));
  playBgm(
    url,
    Math.max(enter, 0), // 已正确设置淡入时间时，进行淡入
    Math.min(Math.max(volume, 0), 100), // 已正确设置音量比时，进行音量调整
  );
  return {
    performName: 'none',
    duration: 0,
    isHoldOn: true,
    stopFunction: () => {},
    blockingNext: () => false,
    blockingAuto: () => true,
    stopTimeout: undefined, // 暂时不用，后面会交给自动清除
  };
};
