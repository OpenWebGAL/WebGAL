/**
 * Preprocessor for scene text.
 *
 * Use two-pass to generate a new scene text that concats multiline sequences
 * into a single line and add placeholder lines to preserve the original number
 * of lines.
 *
 * @param sceneText The original scene text
 * @returns The processed scene text
 */
export function sceneTextPreProcess(sceneText: string): string {
  let lines = sceneText.replaceAll('\r', '').split('\n');

  lines = sceneTextPreProcessPassOne(lines);
  lines = sceneTextPreProcessPassTwo(lines);

  return lines.join('\n');
}

/**
 * Pass one.
 *
 * Add escape character to all lines that should be multiline.
 *
 * @param lines The original lines
 * @returns The processed lines
 */
function sceneTextPreProcessPassOne(lines: string[]): string[] {
  const processedLines: string[] = [];
  let lastLineIsMultiline = false;
  let thisLineIsMultiline = false;

  for (const line of lines) {
    // 续行需要接到上一行，所以场景的第一行永远不会是续行。
    thisLineIsMultiline =
      processedLines.length > 0 &&
      canBeMultiline(line) &&
      !shouldNotBeMultiline(line, lastLineIsMultiline);

    if (thisLineIsMultiline) {
      processedLines[processedLines.length - 1] += '\\';
    }

    processedLines.push(line);

    lastLineIsMultiline = thisLineIsMultiline;
  }

  return processedLines;
}

function canBeMultiline(line: string): boolean {
  if (!line.startsWith(' ')) {
    return false;
  }

  const trimmedLine = line.trimStart();
  return trimmedLine.startsWith('|') || trimmedLine.startsWith('-');
}

/**
 * Logic to check if a line should not be multiline.
 *
 * @param line The line to check
 * @returns If the line should not be multiline
 */
function shouldNotBeMultiline(line: string, lastLineIsMultiline: boolean): boolean {
  if (!lastLineIsMultiline && isEmptyLine(line)) {
    return true;
  }

  // Custom logic: if the line contains -concat, it should not be multiline
  if (line.indexOf('-concat') !== -1) {
    return true;
  }

  return false;
}

function isEmptyLine(line: string): boolean {
  return line.trim() === '';
}


/**
 * Pass two.
 *
 * Traverse the lines to
 * - remove escape characters
 * - add placeholder lines to preserve the original number of lines.
 *
 * @param lines The lines in pass one
 * @returns The processed lines
 */
function sceneTextPreProcessPassTwo(lines: string[]): string[] {
  const processedLines: string[] = [];
  // null 表示当前不在多行序列里。这里不能用空串来判断：
  // 序列的首行本身可能就是空行（比如空行后面紧跟着一条续行），
  // 那样整条序列会被静默丢弃，破坏「预处理前后行数一致」这个前提。
  let currentMultilineContent: string | null = null;
  let placeHolderLines: string[] = [];

  function concat(line: string) {
    let trimmed = line.trim();
    if (trimmed.startsWith('-')) {
      trimmed = " " + trimmed;
    }
    currentMultilineContent = currentMultilineContent + trimmed;
    placeHolderLines.push(placeholderLine(line));
  }

  /** 把折叠好的整条语句连同补齐行数的占位行一起输出 */
  function flushMultiline() {
    processedLines.push(currentMultilineContent as string, ...placeHolderLines);
    placeHolderLines = [];
    currentMultilineContent = null;
  }

  for (const line of lines) {
    if (line.endsWith('\\')) {
      const trueLine = line.slice(0, -1);

      if (currentMultilineContent === null) {
        // first line
        currentMultilineContent = trueLine;
      } else {
        // middle line
        concat(trueLine);
      }
      continue;
    }

    if (currentMultilineContent !== null) {
      // end line
      concat(line);
      flushMultiline();
      continue;
    }

    processedLines.push(line);
  }

  // 场景末行仍以 \ 结尾时循环里没有机会收尾，在这里把累积的内容补出去。
  if (currentMultilineContent !== null) {
    flushMultiline();
  }

  return processedLines;
}

/**
 * 占位行的前缀。占位行本身是一条注释，引擎会空跑掉；
 * 它的作用是让预处理后的行数与原始场景一致，从而保持
 * 「解析后语句 index == 文件行号」这一不变量。
 */
export const WEBGAL_LINE_BREAK_MARK = ';_WEBGAL_LINE_BREAK_';

/**
 * 判断预处理后的某一行是否是占位行，即它是上一条多行语句折叠掉的续行。
 */
export function isLineBreakPlaceholder(processedLine: string): boolean {
  return processedLine.startsWith(WEBGAL_LINE_BREAK_MARK);
}

/**
 * Placeholder Line. Adding this line preserves the original number of lines
 * in the scene text, so that it can be compatible with the graphical editor.
 *
 * @param content The original content on this line
 * @returns The placeholder line
 */
function placeholderLine(content = "") {
  return WEBGAL_LINE_BREAK_MARK + content;
}
