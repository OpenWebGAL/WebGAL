export function sceneTextPreProcess(sceneText: string): string {
  const lines = sceneText.replaceAll('\r', '').split('\n');
  const processedLines: string[] = [];
  let lastNonMultilineIndex = -1;
  let isInMultilineSequence = false;

  function isMultiline(line: string): boolean {
    if (!line.startsWith(' ')) return false
    const trimmedLine = line.trimStart();
    return trimmedLine.startsWith('|') || trimmedLine.startsWith('-');
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.trim() === '') {
      // Empty line handling
      if (isInMultilineSequence) {
        // Check if the next line is a multiline line

        let isStillInMulti = false;
        for (let j = i + 1; j < lines.length; j++) {
          const lookForwardLine = lines[j] || ''
          // 遇到正常语句了，直接中断
          if (lookForwardLine.trim() !== '' && !isMultiline(lookForwardLine)) {
            isStillInMulti = false;
            break;
          }
          // 必须找到后面接的是参数，并且中间没有遇到任何正常语句才行
          if (lookForwardLine.trim() !== '' && isMultiline(lookForwardLine)) {
            isStillInMulti = true;
            break;
          }
        }
        if (isStillInMulti) {
          // Still within a multiline sequence
          processedLines.push(';_WEBGAL_LINE_BREAK_');
        } else {
          // End of multiline sequence
          isInMultilineSequence = false;
          processedLines.push(line);
        }
      } else {
        // Preserve empty lines outside of multiline sequences
        processedLines.push(line);
      }
    } else if (isMultiline(line)) {
      // Multiline statement handling
      if (lastNonMultilineIndex >= 0) {
        // Concatenate to the previous non-multiline statement
        const trimedLine = line.trimStart()
        const addBlank = trimedLine.startsWith('-') ? ' ' : '';
        processedLines[lastNonMultilineIndex] += addBlank + trimedLine;
      }

      // Add the special comment line
      processedLines.push(';_WEBGAL_LINE_BREAK_' + line);
      isInMultilineSequence = true;
    } else {
      // Non-multiline statement handling
      processedLines.push(line);
      lastNonMultilineIndex = processedLines.length - 1;
      isInMultilineSequence = false;
    }
  }

  return processedLines.join('\n');
}
