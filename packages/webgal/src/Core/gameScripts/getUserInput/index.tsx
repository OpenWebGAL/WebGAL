import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { IPerform } from '@/Core/Modules/perform/performInterface';
import { changeScene } from '@/Core/controller/scene/changeScene';
import { jmp } from '@/Core/gameScripts/label/jmp';
import ReactDOM from 'react-dom';
import React from 'react';
import styles from './getUserInput.module.scss';
import { useSEByWebgalStore } from '@/hooks/useSoundEffect';
import { WebGAL } from '@/Core/WebGAL';
import { getStringArgByKey } from '@/Core/util/getSentenceArg';
import { nextSentence } from '@/Core/controller/gamePlay/nextSentence';
import { getCurrentFontFamily } from '@/hooks/useFontFamily';
import { logger } from '@/Core/util/logger';
import { tryToRegex } from '@/Core/util/global';
import { showGlogalDialog } from '@/UI/GlobalDialog/GlobalDialog';
import { stageStateManager } from '@/Core/Modules/stage/stageStateManager';
import { WEBGAL_NONE } from '@/Core/constants';

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
  const rule = getStringArgByKey(sentence, 'rule');
  const ruleFlag = getStringArgByKey(sentence, 'ruleFlag');
  const ruleText = getStringArgByKey(sentence, 'ruleText');
  const ruleButtonText = getStringArgByKey(sentence, 'ruleButtonText') ?? 'OK';

  // Only realtime preview may synthesize input; ordinary fast-forward must still wait for the user.
  if (WebGAL.gameplay.isFastPreview) {
    stageStateManager.setStageVar({
      key: varKey,
      value: defaultValue ?? '',
    });
    return createNonePerform();
  }

  const font = getCurrentFontFamily();

  const { playSeEnter, playSeClick } = useSEByWebgalStore();
  const chooseElements = (
    <div style={{ fontFamily: font }} className={styles.glabalDialog_container}>
      <div className={styles.glabalDialog_container_inner}>
        <div className={styles.title}>{title}</div>
        <input id="user-input" className={styles.Choose_item} defaultValue={defaultValue ?? ''} />
        <div
          onMouseEnter={playSeEnter}
          onClick={() => {
            const userInput: HTMLInputElement = document.getElementById('user-input') as HTMLInputElement;
            if (rule) {
              const reg = tryToRegex(rule, ruleFlag);
              if (reg && !reg.test(userInput.value)) {
                if (ruleText)
                  showGlogalDialog({
                    title: ruleText.replaceAll(/\$0/g, userInput.value),
                    leftText: ruleButtonText,
                  });
                return;
              }
              if (!reg) {
                logger.warn(`getUserInput: rule ${rule} is not a valid regex`);
              }
            }
            if (userInput) {
              stageStateManager.setStageVarAndCommit({
                key: varKey,
                value: userInput?.value || defaultValue || ' ',
              });
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
  return {
    performName: 'userInput',
    duration: 1000 * 60 * 60 * 24,
    isHoldOn: false,
    startFunction: () => {
      // eslint-disable-next-line react/no-deprecated
      ReactDOM.render(
        <div className={styles.Choose_Main}>{chooseElements}</div>,
        document.getElementById('chooseContainer'),
      );
    },
    stopFunction: () => {
      // eslint-disable-next-line react/no-deprecated
      ReactDOM.render(<div />, document.getElementById('chooseContainer'));
    },
    blockingNext: () => true,
    blockingAuto: () => true,
    blockingStateCalculation: () => true,
  };
};

function createNonePerform(): IPerform {
  return {
    performName: WEBGAL_NONE,
    duration: 0,
    isHoldOn: false,
    stopFunction: () => {},
    blockingNext: () => false,
    blockingAuto: () => false,
  };
}
