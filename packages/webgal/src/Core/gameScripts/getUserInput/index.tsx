import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { IPerform } from '@/Core/Modules/perform/performInterface';
import { changeScene } from '@/Core/controller/scene/changeScene';
import { jmp } from '@/Core/gameScripts/label/jmp';
import ReactDOM from 'react-dom';
import React, { useEffect, useState } from 'react';
import styles from './getUserInput.module.scss';
import { webgalStore } from '@/store/store';
import { textFont } from '@/store/userDataInterface';
import { PerformController } from '@/Core/Modules/perform/performController';
import { useSEByWebgalStore } from '@/hooks/useSoundEffect';
import { WebGAL } from '@/Core/WebGAL';
import { getStringArgByKey } from '@/Core/util/getSentenceArg';
import { nextSentence } from '@/Core/controller/gamePlay/nextSentence';
import { setStageVar } from '@/store/stageReducer';
import useApplyStyle from '@/hooks/useApplyStyle';
import { Provider } from 'react-redux';

// eslint-disable-next-line no-undef
let hideGetUserInputTimeout: NodeJS.Timeout | null = null;

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
  const defaultValueFromArgs = getStringArgByKey(sentence, 'defaultValue');

  const { playSeEnter, playSeClick } = useSEByWebgalStore();

  // 清除上一句的隐藏 getUserInput timeout
  if (hideGetUserInputTimeout) {
    clearTimeout(hideGetUserInputTimeout);
    hideGetUserInputTimeout = null;
  }

  function GetUserInput() {
    const applyStyle = useApplyStyle('Stage/GetUserInput/getUserInput.scss');
    const optionData = webgalStore.getState().userData.optionData;

    const [show, setShow] = useState(true);
    useEffect(() => {
      const handler = (event: Event) => {
        const customEvent = event as CustomEvent<boolean>;
        setShow(customEvent.detail);
      };
      window.addEventListener('show-get-user-input', handler);
      return () => window.removeEventListener('show-get-user-input', handler);
    }, []);

    return (
      <div
        className={`${applyStyle('get_user_input_main', styles.get_user_input_main)} ${
          show ? '' : applyStyle('get_user_input_main_hide', styles.get_user_input_main_hide)
        }`}
        style={{
          ['--ui-transition-duration' as any]: `${optionData.uiTransitionDuration}ms`,
        }}
        onWheel={(e) => {
          // 防止触发 useWheel
          e.stopPropagation();
        }}
      >
        <div className={applyStyle('get_user_input_popup', styles.get_user_input_popup)}>
          <div className={applyStyle('get_user_input_title', styles.get_user_input_title)}>{title}</div>
          <input id="user-input" className={applyStyle('get_user_input_field', styles.get_user_input_field)} />
          <div
            onMouseEnter={playSeEnter}
            onClick={() => {
              const userInput: HTMLInputElement = document.getElementById('user-input') as HTMLInputElement;
              if (userInput) {
                webgalStore.dispatch(
                  setStageVar({
                    key: varKey,
                    value: userInput?.value || defaultValueFromArgs || ' ',
                  }),
                );
              }
              playSeClick();
              WebGAL.gameplay.performController.unmountPerform('userInput');
              nextSentence();
            }}
            className={applyStyle('get_user_input_button', styles.get_user_input_button)}
          >
            {buttonText}
          </div>
        </div>
      </div>
    );
  }
  // eslint-disable-next-line react/no-deprecated
  ReactDOM.render(
    <Provider store={webgalStore}>
      <GetUserInput />
    </Provider>,
    document.getElementById('getUserInputContainer'),
  );

  window.dispatchEvent(new CustomEvent<boolean>('show-get-user-input', { detail: true }));

  return {
    performName: 'userInput',
    duration: 1000 * 60 * 60 * 24,
    isHoldOn: false,
    stopFunction: () => {
      window.dispatchEvent(new CustomEvent<boolean>('show-get-user-input', { detail: false }));
      const uiTransitionDuration = webgalStore.getState().userData.optionData.uiTransitionDuration;
      hideGetUserInputTimeout = setTimeout(() => {
        // eslint-disable-next-line react/no-deprecated
        ReactDOM.render(<div />, document.getElementById('getUserInputContainer'));
      }, uiTransitionDuration);
    },
    blockingNext: () => true,
    blockingAuto: () => true,
    stopTimeout: undefined, // 暂时不用，后面会交给自动清除
  };
};
