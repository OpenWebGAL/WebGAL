import { RootState } from '@/store/store';
import { setOptionData } from '@/store/userDataReducer';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useGenSyncRef } from './useGenSyncRef';
import { logger } from '@/Core/util/logger';
import { setStorage } from '@/Core/controller/storage/storageController';
import { language } from '@/config/language';

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
    logger.info('设置语言: ' + languageName);
    window?.localStorage.setItem('lang', lang.toString());
    if (isSyncStorage) {
      setStorage();
    }
  };
}
