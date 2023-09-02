import useLanguage from '@/hooks/useLanguage';
import { useEffect, useState } from 'react';
import s from './translation.module.scss';
import languages, { language } from '@/config/language';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';

export default function Translation() {
  const setLanguage = useLanguage();
  const defaultLanguage = useSelector((state: RootState) => state.GUI.defaultLanguage);
  const [isShowSelectLanguage, setIsShowSelectLanguage] = useState(false);

  const setLang = (langId: language) => {
    setIsShowSelectLanguage(false);
    setLanguage(langId);
  };

  useEffect(() => {
    const lang = window?.localStorage.getItem('lang');
    if (lang || defaultLanguage !== null) {
      setLang(Number(lang || defaultLanguage));
    }
    else
      setIsShowSelectLanguage(true);
  }, [defaultLanguage]);

  return !isShowSelectLanguage ? null :
    <div className={s.trans}>
      <div className={s.langWrapper}>
        <div className={s.lang}>LANGUAGE SELECT</div>
        <div className={s.langSelect}>
          {
            Object.keys(languages).map(key =>
              <div className={s.langSelectButton}
                onClick={() => setLang(language[key as unknown as language] as unknown as language)}>
                {languages[key]}
              </div>
            )
          }
        </div>
      </div>
    </div>;
}
