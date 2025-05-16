import { setStorage } from '@/Core/controller/storage/storageController';
import { logger } from '@/Core/util/logger';
import { language } from '@/config/language';
import { RootState } from '@/store/store';
import { setGlobalVar, setOptionData } from '@/store/userDataReducer';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useGenSyncRef } from './useGenSyncRef';

export function getLanguageName(lang: language): string {
  return language[lang];
}

export default function useLanguage() {
  const { i18n } = useTranslation();
  const userDataRef = useGenSyncRef((state: RootState) => state.userData);
  const dispatch = useDispatch();

  return (_lang?: language, isSyncStorage = true) => {
    const lang = _lang ?? userDataRef.current?.optionData.language ?? language.zhCn;

    const languageName = getLanguageName(lang);
    i18n.changeLanguage(languageName);

    dispatch(setOptionData({ key: 'language', value: lang }));
    dispatch(setGlobalVar({ key: 'Language', value: languageName }))
    logger.info('设置语言: ' + languageName);
    window?.localStorage.setItem('lang', lang.toString());
    if (isSyncStorage) {
      setStorage();
    }
  };
}
