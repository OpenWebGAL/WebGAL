import { FC, ReactNode, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { useFontFamily } from '@/hooks/useFontFamily';
import { useTextAnimationDuration, useTextDelay } from '@/hooks/useTextOptions';
import { getTextSize } from '@/UI/getTextSize';
import StandardTextbox, { ITextboxProps } from '@/Stage/TextBox/themes/standard/StandardTextbox';
import IMSSTextbox from '@/Stage/TextBox/themes/imss/IMSSTextbox';
import { IWebGalTextBoxTheme } from '@/Stage/themeInterface';
import { match } from '@/Core/util/match';
import { textSize } from '@/store/userDataInterface';

const userAgent = navigator.userAgent;
const isFirefox = /firefox/i.test(userAgent);
const isSafari = /^((?!chrome|android).)*safari/i.test(userAgent);

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
  const lineLimit = match(userDataState.optionData.textSize)
    .with(textSize.small, () => 3)
    .with(textSize.medium, () => 2)
    .with(textSize.large, () => 2)
    .default(() => 2);
  // 拆字
  const textArray = compileSentence(stageState.showText, lineLimit);
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
      isFirefox={isFirefox}
      miniAvatar={miniAvatar}
      textDuration={textDuration}
      font={font}
      textSizeState={textSizeState}
      lineLimit={lineLimit}
    />
  );
};

function isCJK(character: string) {
  return !!character.match(/[\u4e00-\u9fa5]|[\u0800-\u4e00]|[\uac00-\ud7ff]/);
}

export function compileSentence(sentence: string, lineLimit: number, ignoreLineLimit?: boolean): ReactNode[] {
  // 先拆行
  const lines = sentence.split('|');
  // 对每一行进行注音处理
  const rubyLines = lines.map((line) => parseString(line));
  const nodeLines = rubyLines.map((line) => {
    const ln: ReactNode[] = [];
    line.forEach((node, index) => {
      match(node.type)
        .with(SegmentType.String, () => {
          const chars = splitChars(node.value as string);
          ln.push(...chars);
        })
        .endsWith(SegmentType.Link, () => {
          const val = node.value as LinkValue;
          const rubyNode = (
            <ruby key={index + val.text}>
              {val.text}
              <rt>{val.link}</rt>
            </ruby>
          );
          ln.push(rubyNode);
        });
    });
    return ln;
  });
  const ret = nodeLines
    .slice(0, ignoreLineLimit ? undefined : lineLimit)
    .reduce((prev, curr, currentIndex) => [...prev, ...curr, <br key={`br-${currentIndex}`} />], []);
  ret.pop();
  return ret;
}

/**
 * @param sentence
 */
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
    // if (character === '|') {
    //   if (word) {
    //     words.push(word);
    //     word = '';
    //   }
    //   words.push('<br />');
    //   cjkFlag = false;
    //   continue;
    // }
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

enum SegmentType {
  String = 'SegmentType.String',
  Link = 'SegmentType.Link',
}

interface LinkValue {
  text: string;
  link: string;
}

interface Segment {
  type: SegmentType;
  value: string | LinkValue;
}

function parseString(input: string): Segment[] {
  const regex = /(\[(.*?)\]\((.*?)\))|([^\[\]]+)/g;
  const result: Segment[] = [];
  let match: RegExpExecArray | null;

  while ((match = regex.exec(input)) !== null) {
    if (match[1]) {
      // 链接部分
      const text = match[2];
      const link = match[3];
      result.push({ type: SegmentType.Link, value: { text, link } });
    } else {
      // 普通文本
      const text = match[0];
      result.push({ type: SegmentType.String, value: text });
    }
  }

  return result;
}
