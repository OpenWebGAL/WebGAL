import { FC, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { useFontFamily } from '@/hooks/useFontFamily';
import { useTextAnimationDuration, useTextDelay } from '@/hooks/useTextOptions';
import { getTextSize } from '@/Components/UI/getTextSize';
import StandardTextbox, { ITextboxProps } from '@/Components/Stage/TextBox/themes/standard/StandardTextbox';
import IMSSTextbox from '@/Components/Stage/TextBox/themes/imss/IMSSTextbox';
import { IWebGalTextBoxTheme } from '@/Components/themeInterface';
import { textSize } from '@/store/userDataInterface';

const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

function getTextboxByTheme(theme: IWebGalTextBoxTheme): FC<ITextboxProps> {
  switch (theme) {
    case 'standard':
      return StandardTextbox;
    case 'imss':
      return IMSSTextbox;
    default:
      return StandardTextbox;
  }
}

export const TextBox = () => {
  const stageState = useSelector((state: RootState) => state.stage);
  const userDataState = useSelector((state: RootState) => state.userData);
  useEffect(() => {});
  const textDelay = useTextDelay(userDataState.optionData.textSpeed);
  const textDuration = useTextAnimationDuration(userDataState.optionData.textSpeed);
  let size = getTextSize(userDataState.optionData.textSize) + '%';
  const font = useFontFamily();
  const isText = stageState.showText !== '' || stageState.showName !== '';
  let textSizeState = userDataState.optionData.textSize;
  if (isText && stageState.showTextSize !== -1) {
    size = getTextSize(stageState.showTextSize) + '%';
    textSizeState = stageState.showTextSize;
  }
  // 拆字
  const textArray: Array<string> = splitChars(stageState.showText);
  const showName = stageState.showName;
  const currentConcatDialogPrev = stageState.currentConcatDialogPrev;
  const currentDialogKey = stageState.currentDialogKey;
  const miniAvatar = stageState.miniAvatar;
  const theme = useSelector((state: RootState) => state.GUI.theme);
  const Textbox = getTextboxByTheme(theme.textbox);
  return (
    <Textbox
      textArray={textArray}
      isText={isText}
      textDelay={textDelay}
      showName={showName}
      currentConcatDialogPrev={currentConcatDialogPrev}
      fontSize={size}
      currentDialogKey={currentDialogKey}
      isSafari={isSafari}
      miniAvatar={miniAvatar}
      textDuration={textDuration}
      font={font}
      textSizeState={textSizeState}
    />
  );
};

function isCJK(character: string) {
  return !!character.match(/[\u4e00-\u9fa5]|[\u0800-\u4e00]|[\uac00-\ud7ff]/);
}

export function splitChars(sentence: string) {
  if (!sentence) return [];
  const words: string[] = [];
  let word = '';
  let cjkFlag = isCJK(sentence[0]);

  const isPunctuation = (ch: string): boolean => {
    const regex = /[!-\/:-@\[-`{-~\u2000-\u206F\u3000-\u303F\uff00-\uffef]/g;
    return regex.test(ch);
  };

  for (const character of sentence) {
    if (character === '|') {
      if (word) {
        words.push(word);
        word = '';
      }
      words.push('<br />');
      cjkFlag = false;
      continue;
    }
    if (character === ' ') {
      // Space
      if (word) {
        words.push(word);
        word = '';
      }
      words.push(' ');
      cjkFlag = false;
    } else if (isCJK(character) && !isPunctuation(character)) {
      if (!cjkFlag && word) {
        words.push(word);
        word = '';
      }
      words.push(character);
      cjkFlag = true;
    } else {
      if (isPunctuation(character)) {
        if (word) {
          // If it is a punctuation and there is a preceding word, add it to the word
          word += character;
          words.push(word);
          word = '';
        } else if (words.length > 0) {
          // If no preceding word in the current iteration, but there are already words in the array, append to the last word
          words[words.length - 1] += character;
        } else {
          // If no preceding word, still add the punctuation as a new word
          words.push(character);
        }
        continue;
      }

      if (cjkFlag && word) {
        words.push(word);
        word = '';
      }
      word += character;
      cjkFlag = false;
    }
  }

  if (word) {
    words.push(word);
  }

  return words;
}
