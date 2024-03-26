export interface IWebGALStyleObj {
  classNameStyles: Record<string, string>;
  others: string;
}

export function scss2cssinjsParser(scssString: string): IWebGALStyleObj {
  const [classNameStyles, others] = parseCSS(scssString);
  return {
    classNameStyles,
    others,
  };
}

/**
 * GPT 4 写的，临时用，以后要重构！！！
 * TODO：用人类智能重构，要是用着一直没问题，也不是不可以 trust AI
 * @param css
 */
function parseCSS(css: string): [Record<string, string>, string] {
  const result: Record<string, string> = {};
  let specialRules = '';
  let matches;
  // 匹配类选择器和其内容，包括一层嵌套
  const classRegex = /\.([^{\s]+)\s*{([^}]*?(?:\{[^}]*?\}[^}]*?)?)}/g;
  // 更新特殊规则正则表达式以正确处理一层嵌套，并确保大括号成对出现
  const specialRegex = /(@[^{]+{\s*(?:[^{}]*{[^}]*}[^{}]*)+\s*})/g;

  // 提取类和样式
  while ((matches = classRegex.exec(css)) !== null) {
    result[matches[1]] = matches[2].trim().replace(/\s*;\s*/g, ';\n');
  }

  // 提取特殊规则，并确保包含所有的大括号
  while ((matches = specialRegex.exec(css)) !== null) {
    specialRules += matches[1].trim() + '\n';
  }

  return [result, specialRules.trim()];
}
