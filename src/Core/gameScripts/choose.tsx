import { ISentence } from '@/interface/coreInterface/sceneInterface';
import { IPerform } from '@/interface/coreInterface/performInterface';
import { changeScene } from '@/Core/controller/scene/changeScene';
import { jmp } from '@/Core/gameScripts/function/jmp';
import ReactDOM from 'react-dom';
import React from 'react';
import { unmountPerform } from '@/Core/controller/perform/unmountPerform';
import styles from './performStyles/choose.module.scss';

/**
 * 显示选择枝
 * @param sentence
 */
export const choose = (sentence: ISentence): IPerform => {
  let chooseList = sentence.content.split('|');
  const chooseListFull = chooseList.map((e) => e.split(':'));
  const chooseElements = chooseListFull.map((e, i) => {
    return (
      <div
        className={styles.Choose_item}
        key={e[0] + i}
        onClick={() => {
          if (e[1].match(/\./)) {
            changeScene(e[1], e[0]);
          } else {
            jmp(e[1]);
          }
          unmountPerform('choose');
        }}
      >
        {e[0]}
      </div>
    );
  });
  ReactDOM.render(
    <div className={styles.Choose_Main}>{chooseElements}</div>,
    document.getElementById('chooseContainer'),
  );
  return {
    performName: 'choose',
    duration: 1000 * 60 * 60 * 24,
    isOver: false,
    isHoldOn: false,
    stopFunction: () => {
      ReactDOM.render(<div />, document.getElementById('chooseContainer'));
    },
    blockingNext: () => true,
    blockingAuto: () => true,
    stopTimeout: undefined, // 暂时不用，后面会交给自动清除
  };
};
