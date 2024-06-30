import { ReactNode, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { useFontFamily } from '@/hooks/useFontFamily';
import { useTextAnimationDuration, useTextDelay } from '@/hooks/useTextOptions';
import { getTextSize } from '@/UI/getTextSize';
import { match } from '@/Core/util/match';
import { textSize } from '@/store/userDataInterface';
import IMSSTextbox from '@/Stage/TextBox/IMSSTextbox';
import { SCREEN_CONSTANTS } from '@/Core/util/constants';

const userAgent = navigator.userAgent;
const isFirefox = /firefox/i.test(userAgent);
const isSafari = /^((?!chrome|android).)*safari/i.test(userAgent);

export interface EnhancedNode {
  reactNode: ReactNode;
  enhancedValue?: { key: string; value: string }[];
}

export const TextBox = () => {
  const [isShowStroke, setIsShowStroke] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      const targetHeight = SCREEN_CONSTANTS.height;
      const targetWidth = SCREEN_CONSTANTS.width;

      const h = window.innerHeight; // 窗口高度
      const w = window.innerWidth; // 窗口宽度
      const zoomH = h / targetHeight; // 以窗口高度为基准的变换比
      const zoomW = w / targetWidth; // 以窗口宽度为基准的变换比
      const zoomH2 = w / targetHeight; // 竖屏时以窗口高度为基础的变换比
      const zoomW2 = h / targetWidth; // 竖屏时以窗口宽度为基础的变换比
      [zoomH, zoomW, zoomH2, zoomW2].forEach((e) => {
        if (e <= 0.2) {
          setIsShowStroke(false);
        } else {
          setIsShowStroke(true);
        }
      });
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const stageState = useSelector((state: RootState) => state.stage);
  const userDataState = useSelector((state: RootState) => state.userData);
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
  const textboxOpacity = userDataState.optionData.textboxOpacity;
  const Textbox = IMSSTextbox;
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
      isUseStroke={isShowStroke}
      textboxOpacity={textboxOpacity}
    />
  );
};

function isCJK(character: string) {
  return !!character.match(/[\u4e00-\u9fa5]|[\u0800-\u4e00]|[\uac00-\ud7ff]/);
}

export function compileSentence(sentence: string, lineLimit: number, ignoreLineLimit?: boolean): EnhancedNode[][] {
  // 先拆行
  const lines = sentence.split('|');
  // 对每一行进行注音处理
  const rubyLines = lines.map((line) => parseString(line));
  const nodeLines = rubyLines.map((line) => {
    const ln: EnhancedNode[] = [];
    line.forEach((node, index) => {
      match(node.type)
        .with(SegmentType.String, () => {
          const chars = splitChars(node.value as string);
          // eslint-disable-next-line max-nested-callbacks
          ln.push(...chars.map((c) => ({ reactNode: c })));
        })
        .endsWith(SegmentType.Link, () => {
          const val = node.value as EnhancedValue;
          const enhancedNode = (
            <span className="__enhanced_text" key={val.text + `${index}`}>
              <ruby key={index + val.text}>
                {val.text}
                <rt>{val.ruby}</rt>
              </ruby>
            </span>
          );
          ln.push({ reactNode: enhancedNode, enhancedValue: val.values });
        });
    });
    return ln;
  });
  return nodeLines.slice(0, ignoreLineLimit ? undefined : lineLimit);
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
      words.push('\u00a0');
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

interface EnhancedValue {
  text: string;
  ruby: string;
  values: { key: string; value: string }[];
}

interface Segment {
  type: SegmentType;
  value?: string | EnhancedValue;
}

function parseString(input: string): Segment[] {
  const regex = /(\[(.*?)\]\((.*?)\))|([^\[\]]+)/g;
  const result: Segment[] = [];
  let match: RegExpExecArray | null;

  while ((match = regex.exec(input)) !== null) {
    if (match[1]) {
      // 链接部分
      const text = match[2];
      const enhance = match[3];
      let parsedEnhanced: KeyValuePair[] = [];
      let ruby = '';
      if (enhance.match(/style=|tips=|ruby=/)) {
        parsedEnhanced = parseEnhancedString(enhance);
      } else {
        ruby = enhance;
      }
      result.push({ type: SegmentType.Link, value: { text, ruby, values: parsedEnhanced } });
    } else {
      // 普通文本
      const text = match[0];
      result.push({ type: SegmentType.String, value: text });
    }
  }

  return result;
}

interface KeyValuePair {
  key: string;
  value: string;
}

function parseEnhancedString(enhanced: string): KeyValuePair[] {
  const result: KeyValuePair[] = [];
  const regex = /(\S+)=(.*?)(?=\s+\S+=|\s*$)/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(enhanced)) !== null) {
    result.push({
      key: match[1],
      value: match[2].trim(),
    });
  }

  return result;
}
