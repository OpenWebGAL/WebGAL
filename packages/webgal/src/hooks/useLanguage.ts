import { RootState } from '@/store/store';
import { language } from '@/store/userDataInterface';
import { setOptionData } from '@/store/userDataReducer';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useGenSyncRef } from './useGenSyncRef';
import { setStorage } from '@/Core/controller/storage/storageController';

export default function useLanguage() {
  const { i18n } = useTranslation();
  const userDataRef = useGenSyncRef((state: RootState) => state.userData);
  const dispatch = useDispatch();

  return (_lang?: language) => {
    const lang = _lang ?? userDataRef.current?.optionData.language ?? language.zhCn;

    switch (lang) {
      case language.zhCn:
        i18n.changeLanguage('zhCn');
        break;
      case language.en:
        i18n.changeLanguage('en');
        break;
      case language.jp:
        i18n.changeLanguage('jp');
        break;
    }

    dispatch(setOptionData({ key: 'language', value: lang }));
    setStorage();
  };
}
