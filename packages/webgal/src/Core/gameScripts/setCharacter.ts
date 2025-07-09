import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { IPerform } from '@/Core/Modules/perform/performInterface';
import { characters } from '@/character';

/**
 * 通过 ISentence 修改 characters 某个角色的属性，返回新对象（不直接更改原数组）
 * 句子格式如：character.角色名.属性=10
 */
export const setCharacter = (sentence: ISentence): IPerform => {
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

  // find 角色
  const found = characters.find((c) => c.name === charName);
  if (found) {
    // 这里你可以根据需要做后续处理，比如触发副作用等
    // 返回IPerform对象，不直接返回新对象
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
