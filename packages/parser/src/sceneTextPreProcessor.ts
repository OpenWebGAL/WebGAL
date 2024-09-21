export function sceneTextPreProcess(sceneText: string): string {
  const lines = sceneText.split('\n');
  const processedLines:string[] = [];
  let lastNonMultiLineIndex = -1;
  let isInMultiLineSequence = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const leadingSpacesMatch = line.match(/^(\s*)/);
    const leadingSpaces = '';
    const trimmedLine = line;
    const restOfLine = line.slice(leadingSpaces.length);

    if (trimmedLine === '') {
      // 空行处理
      if (isInMultiLineSequence) {
        processedLines.push(leadingSpaces + ';_WEBGAL_LINE_BREAK_');
      } else {
        processedLines.push(line);
      }
    } else if (trimmedLine.startsWith('|') || line.match(/^\s* -/)) {
      // 跨行语句处理
      isInMultiLineSequence = true;

      if (lastNonMultiLineIndex >= 0) {
        if (trimmedLine.startsWith('|')) {
          // 无需添加空格
          processedLines[lastNonMultiLineIndex] += restOfLine;
        } else if (line.match(/^\s* -/)) {
          // 添加空格再拼接
          processedLines[lastNonMultiLineIndex] += '' + trimmedLine;
        }
      }

      // 添加特殊注释行
      const specialCommentLine = leadingSpaces + ';_WEBGAL_LINE_BREAK_' + restOfLine;
      processedLines.push(specialCommentLine);
    } else {
      // 非跨行语句处理
      isInMultiLineSequence = false;
      processedLines.push(line);
      lastNonMultiLineIndex = processedLines.length - 1;
    }
  }

  return processedLines.join('\n');
}
