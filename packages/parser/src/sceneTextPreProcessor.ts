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
    thisLineIsMultiline = false;

    if (canBeMultiline(line)) {
      thisLineIsMultiline = true;
    }

    if (shouldNotBeMultiline(line, lastLineIsMultiline)) {
      thisLineIsMultiline = false;
    }

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
  let currentMultilineContent = "";
  let placeHolderLines: string[] = [];

  function concat(line: string) {
    let trimmed = line.trim();
    if (trimmed.startsWith('-')) {
      trimmed = " " + trimmed;
    }
    currentMultilineContent = currentMultilineContent + trimmed;
    placeHolderLines.push(placeholderLine(line));
  }

  for (const line of lines) {
    console.log(line);
    if (line.endsWith('\\')) {
      const trueLine = line.slice(0, -1);

      if (currentMultilineContent === "") {
        // first line
        currentMultilineContent = trueLine;
      } else {
        // middle line
        concat(trueLine);
      }
      continue;
    }

    if (currentMultilineContent !== "") {
      // end line
      concat(line);
      processedLines.push(currentMultilineContent);
      processedLines.push(...placeHolderLines);

      placeHolderLines = [];
      currentMultilineContent = "";
      continue;
    }

    processedLines.push(line);
  }

  return processedLines;
}

/**
 * Placeholder Line. Adding this line preserves the original number of lines
 * in the scene text, so that it can be compatible with the graphical editor.
 *
 * @param content The original content on this line
 * @returns The placeholder line
 */
function placeholderLine(content = "") {
  return ";_WEBGAL_LINE_BREAK_" + content;
}

// export function sceneTextPreProcess(sceneText: string): string {
//   const lines = sceneText.replaceAll('\r', '').split('\n');
//   const processedLines: string[] = [];
//   let lastNonMultilineIndex = -1;
//   let isInMultilineSequence = false;

//   function isMultiline(line: string): boolean {
//     if (!line.startsWith(' ')) return false;
//     const trimmedLine = line.trimStart();
//     return trimmedLine.startsWith('|') || trimmedLine.startsWith('-');
//   }

//   for (let i = 0; i < lines.length; i++) {
//     const line = lines[i];

//     if (line.trim() === '') {
//       // Empty line handling
//       if (isInMultilineSequence) {
//         // Check if the next line is a multiline line

//         let isStillInMulti = false;
//         for (let j = i + 1; j < lines.length; j++) {
//           const lookForwardLine = lines[j] || '';
//           // 遇到正常语句了，直接中断
//           if (lookForwardLine.trim() !== '' && !isMultiline(lookForwardLine)) {
//             isStillInMulti = false;
//             break;
//           }
//           // 必须找到后面接的是参数，并且中间没有遇到任何正常语句才行
//           if (lookForwardLine.trim() !== '' && isMultiline(lookForwardLine)) {
//             isStillInMulti = true;
//             break;
//           }
//         }
//         if (isStillInMulti) {
//           // Still within a multiline sequence
//           processedLines.push(';_WEBGAL_LINE_BREAK_');
//         } else {
//           // End of multiline sequence
//           isInMultilineSequence = false;
//           processedLines.push(line);
//         }
//       } else {
//         // Preserve empty lines outside of multiline sequences
//         processedLines.push(line);
//       }
//     } else if (isMultiline(line)) {
//       // Multiline statement handling
//       if (lastNonMultilineIndex >= 0) {
//         // Concatenate to the previous non-multiline statement
//         const trimedLine = line.trimStart();
//         const addBlank = trimedLine.startsWith('-') ? ' ' : '';
//         processedLines[lastNonMultilineIndex] += addBlank + trimedLine;
//       }

//       // Add the special comment line
//       processedLines.push(';_WEBGAL_LINE_BREAK_' + line);
//       isInMultilineSequence = true;
//     } else {
//       // Non-multiline statement handling
//       processedLines.push(line);
//       lastNonMultilineIndex = processedLines.length - 1;
//       isInMultilineSequence = false;
//     }
//   }

//   return processedLines.join('\n');
// }