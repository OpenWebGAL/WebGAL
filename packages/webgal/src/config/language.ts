/**
 * You can config the languages display in this file.
 * If you want close someone, please add "//" forward that line.
 * If you want add language, please add the language English abbreviation name into language and languages,
 * also you need to code the name of it show.
 */

export enum language {
  zhCn,
  en,
  jp,
}

const languages: Record<string, string> = {
  zhCn: '中文',
  en: 'English',
  jp: '日本語',
};

export const defaultLanguage: language = language.zhCn;

export default languages;
