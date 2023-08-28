import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { IPerform } from '@/Core/Modules/perform/performInterface';
import { playBgm } from '@/Core/controller/stage/playBgm';
import { getSentenceArgByKey } from '@/Core/util/getSentenceArg';
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
  const enter = getSentenceArgByKey(sentence, 'enter'); // 获取bgm的淡入时间
  const volume = getSentenceArgByKey(sentence, 'volume'); // 获取bgm的音量比
  if (name !== '') webgalStore.dispatch(unlockBgmInUserData({ name, url, series }));
  playBgm(
    url,
    typeof enter === 'number' && enter >= 0 ? enter : 0, // 已正确设置淡入时间时，进行淡入
    typeof volume === 'number' && volume >= 0 && volume <= 100 ? volume : 100, // 已正确设置音量比时，进行音量调整
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
