import styles from './textbox.module.scss';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { useFontFamily } from '@/hooks/useFontFamily';
import { useTextAnimationDuration, useTextDelay } from '@/hooks/useTextOptions';
import { getTextSize } from '@/Components/UI/getTextSize';

const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

export const TextBox = () => {
  const stageState = useSelector((state: RootState) => state.stage);
  const userDataState = useSelector((state: RootState) => state.userData);
  useEffect(() => {});
  const textDelay = useTextDelay(userDataState.optionData.textSpeed);
  const textDuration = useTextAnimationDuration(userDataState.optionData.textSpeed);
  let size = getTextSize(userDataState.optionData.textSize) + '%';
  const font = useFontFamily();
  const isText = stageState.showText !== '' || stageState.showName !== '';
  if (isText && stageState.showTextSize !== -1) {
    size = getTextSize(stageState.showTextSize) + '%';
  }
  // 拆字
  const textArray: Array<string> = splitChars(stageState.showText);
  const textElementList = textArray.map((e, index) => {
    if (e === '<br />') {
      return <br key={`br${index}`} />;
    }
    let delay = index * textDelay;
    let prevLength = stageState.currentConcatDialogPrev.length;
    if (stageState.currentConcatDialogPrev !== '' && index >= prevLength) {
      delay = delay - prevLength * textDelay;
    }
    if (index < prevLength) {
      return (
        <span
          data-text={e}
          id={`${delay}`}
          className={styles.TextBox_textElement_Settled}
          key={stageState.currentDialogKey + index}
          style={{ animationDelay: `${delay}ms`, animationDuration: `${textDuration}ms` }}
        >
          <span className={styles.zhanwei}>
            {e}
            <span className={styles.outer}>{e}</span>
            <span className={styles.inner}>{e}</span>
          </span>
        </span>
      );
    }
    return (
      <span
        data-text={e}
        id={`${delay}`}
        className={styles.TextBox_textElement_start}
        key={stageState.currentDialogKey + index}
        style={{ animationDelay: `${delay}ms`, position: 'relative' }}
      >
        <span className={styles.zhanwei}>
          {e}
          <span className={styles.outer}>{e}</span>
          <span className={styles.inner}>{e}</span>
        </span>
      </span>
    );
  });
  return (
    <>
      {isText && (
        <div
          id="textBoxMain"
          className={styles.TextBox_main}
          style={{ fontFamily: font, left: stageState.miniAvatar === '' ? 25 : undefined }}
        >
          {/* <div className={styles.nameContainer}>{stageState.showName !== ''}</div> */}
          <div id="miniAvatar" className={styles.miniAvatarContainer}>
            {stageState.miniAvatar !== '' && (
              <img className={styles.miniAvatarImg} alt="miniAvatar" src={stageState.miniAvatar} />
            )}
          </div>
          {stageState.showName !== '' && (
            <div key={stageState.showName} className={styles.TextBox_showName} style={{ fontSize: '200%' }}>
              {stageState.showName.split('').map((e, i) => {
                return (
                  <span key={e + i} style={{ position: 'relative' }}>
                    <span className={styles.zhanwei}>
                      {e}
                      <span className={styles.outerName}>{e}</span>
                      <span className={styles.innerName}>{e}</span>
                    </span>
                  </span>
                );
              })}
            </div>
          )}
          <div
            className={styles.text}
            style={{
              fontSize: size,
              wordBreak: isSafari ? 'break-word' : undefined,
              overflow: 'hidden',
              paddingLeft: '0.1em',
            }}
          >
            {textElementList}
          </div>
        </div>
      )}
    </>
  );
};

function isCJK(character: string) {
  if (character.match(/[\u4e00-\u9fa5]|[\u0800-\u4e00]|[\uac00-\ud7ff]/)) {
    return true;
  } else return false;
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
