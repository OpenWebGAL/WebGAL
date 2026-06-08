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

  // 使用非贪婪匹配，尝试正确处理任意层次的嵌套
  const classRegex = /\.([^{\s]+)\s*{((?:[^{}]*|{[^}]*})*)}/g;
  const specialRegex = /(@[^{]+{\s*(?:[^{}]*{[^}]*}[^{}]*)+\s*})/g;

  while ((matches = classRegex.exec(css)) !== null) {
    const key = matches[1];
    const value = matches[2].trim().replace(/\s*;\s*/g, ';\n');
    result[key] = value;
  }

  while ((matches = specialRegex.exec(css)) !== null) {
    specialRules += matches[1].trim() + '\n';
  }

  return [result, specialRules.trim()];
}
