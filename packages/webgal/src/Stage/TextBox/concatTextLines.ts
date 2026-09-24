import type { EnhancedNode } from './TextBox';

/** 逐段连接分别编译的文本，最后一段之前的可见节点都是前缀。 */
export function concatTextLines(segments: EnhancedNode[][][], lineLimit: number) {
  let textArray: EnhancedNode[][] = [];
  let concatPrefixNodeCount = 0;
  for (const lines of segments) {
    concatPrefixNodeCount = textArray.slice(0, lineLimit).flat().length;
    if (textArray.length === 0) {
      textArray = lines;
      continue;
    }
    const [firstLine, ...remainingLines] = lines;
    // 每行有一个空占位；接到旧行时去掉新段的首个占位，避免多一次延迟。
    const joinedLine = [...textArray[textArray.length - 1], ...firstLine.slice(1)];
    textArray = [...textArray.slice(0, -1), joinedLine, ...remainingLines];
  }
  return { textArray: textArray.slice(0, lineLimit), concatPrefixNodeCount };
}
