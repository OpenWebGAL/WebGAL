import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { IPerform } from '@/Core/Modules/perform/performInterface';
import { webgalStore } from '@/store/store';
import { stageActions } from '@/store/stageReducer';

/**
 * 通过 ISentence 修改 characters 某个角色的属性，返回新对象（不直接更改原数组）
 * 句子格式如：character.角色名.属性=10
 */
export const setCharacter = (sentence: ISentence): IPerform => {
  const characters = webgalStore.getState().stage.charactersData;
  const dispatch = webgalStore.dispatch;
  console.log('characters:', sentence);
  if (!sentence.content.match(/\s*=\s*/)) {
    return {
      performName: 'none',
      duration: 0,
      isHoldOn: false,
      stopFunction: () => {},
      blockingNext: () => false,
      blockingAuto: () => true,
      stopTimeout: undefined,
    };
  }
  const left = sentence.content.split(/\s*=\s*/)[0]; // character.角色名.属性
  const value = sentence.content.split(/\s*=\s*/)[1]; // 10

  let charName = '';
  let prop = '';
  const arr = left.split('.');
  if (arr.length === 3 && arr[0] === 'character') {
    charName = arr[1];
    prop = arr[2];
    dispatch(
      stageActions.updateCharactersData({ name: charName, [prop]: isNaN(Number(value)) ? value : Number(value) }),
    );
  } else {
    return {
      performName: 'none',
      duration: 0,
      isHoldOn: false,
      stopFunction: () => {},
      blockingNext: () => false,
      blockingAuto: () => true,
      stopTimeout: undefined,
    };
  }

  return {
    performName: 'none',
    duration: 0,
    isHoldOn: false,
    stopFunction: () => {},
    blockingNext: () => false,
    blockingAuto: () => true,
    stopTimeout: undefined,
  };
};
