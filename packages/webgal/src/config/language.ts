/**
 * You can config the languages display in this file.
 * If you want close someone, please add "//" forward that line.
 * If you want to add language, please add the language English abbreviation name into language and languages,
 * also you need to code the name of it show.
 */

import en from '@/translations/en';
import jp from '@/translations/jp';
import zhCn from '@/translations/zh-cn';
import fr from '@/translations/fr';
import de from '@/translations/de';
import zhTw from '@/translations/zh-tw';
/*
  Import your translation configs here;
  example:
  import myLang from '@/translations/filename of your config file';
*/

export enum language {
  zhCn,
  en,
  jp,
  fr,
  de,
  zhTw,
}

const languages: Record<string, string> = {
  zhCn: '中文',
  en: 'English',
  jp: '日本語',
  fr: 'Français',
  de: 'Deutsch',
  zhTw: '繁體中文',
};

export const i18nTranslationResources: Record<string, { translation: Record<string, any> }> = {
  en: { translation: en },
  zhCn: { translation: zhCn },
  jp: { translation: jp },
  fr: { translation: fr },
  de: { translation: de },
  zhTw: { translation: zhTw },
};

export const defaultLanguage: language = language.zhCn;

export default languages;
