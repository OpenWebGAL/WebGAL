import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { IPerform } from '@/Core/Modules/perform/performInterface';
import { changeScene } from '@/Core/controller/scene/changeScene';
import { jmp } from '@/Core/gameScripts/label/jmp';
import ReactDOM from 'react-dom';
import React from 'react';
import styles from './getUserInput.module.scss';
import { webgalStore } from '@/store/store';
import { PerformController } from '@/Core/Modules/perform/performController';
import { useSEByWebgalStore } from '@/hooks/useSoundEffect';
import { WebGAL } from '@/Core/WebGAL';
import { getStringArgByKey } from '@/Core/util/getSentenceArg';
import { nextSentence } from '@/Core/controller/gamePlay/nextSentence';
import { setStageVar } from '@/store/stageReducer';
import { getCurrentFontFamily } from '@/hooks/useFontFamily';

/**
 * 显示选择枝
 * @param sentence
 */
export const getUserInput = (sentence: ISentence): IPerform => {
  const varKey = sentence.content.toString().trim();

  let title = getStringArgByKey(sentence, 'title') ?? '';
  title = title === '' ? 'Please Input' : title;
  let buttonText = getStringArgByKey(sentence, 'buttonText') ?? '';
  buttonText = buttonText === '' ? 'OK' : buttonText;
  const defaultValue = getStringArgByKey(sentence, 'defaultValue');

  const font = getCurrentFontFamily();

  const { playSeEnter, playSeClick } = useSEByWebgalStore();
  const chooseElements = (
    <div style={{ fontFamily: font }} className={styles.glabalDialog_container}>
      <div className={styles.glabalDialog_container_inner}>
        <div className={styles.title}>{title}</div>
        <input id="user-input" className={styles.Choose_item} />
        <div
          onMouseEnter={playSeEnter}
          onClick={() => {
            const userInput: HTMLInputElement = document.getElementById('user-input') as HTMLInputElement;
            if (userInput) {
              webgalStore.dispatch(
                setStageVar({
                  key: varKey,
                  value: userInput?.value || defaultValue || ' ',
                }),
              );
            }
            playSeClick();
            WebGAL.gameplay.performController.unmountPerform('userInput');
            nextSentence();
          }}
          className={styles.button}
        >
          {buttonText}
        </div>
      </div>
    </div>
  );
  // eslint-disable-next-line react/no-deprecated
  ReactDOM.render(
    <div className={styles.Choose_Main}>{chooseElements}</div>,
    document.getElementById('chooseContainer'),
  );
  return {
    performName: 'userInput',
    duration: 1000 * 60 * 60 * 24,
    isHoldOn: false,
    stopFunction: () => {
      // eslint-disable-next-line react/no-deprecated
      ReactDOM.render(<div />, document.getElementById('chooseContainer'));
    },
    blockingNext: () => true,
    blockingAuto: () => true,
    stopTimeout: undefined, // 暂时不用，后面会交给自动清除
  };
};
