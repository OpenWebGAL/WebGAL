import useLanguage from '@/hooks/useLanguage';
import { useEffect, useState } from 'react';
import s from './translation.module.scss';
import languages, { language } from '@/config/language';

export default function Translation() {
  const setLanguage = useLanguage();

  const [isShowSelectLanguage, setIsShowSelectLanguage] = useState(false);

  useEffect(() => {
    const lang = window?.localStorage.getItem('lang');
    if (!lang) {
      setIsShowSelectLanguage(true);
    } else {
      setLanguage(Number(window?.localStorage.getItem('lang')), false);
    }
  }, []);

  const setLang = (langId: language) => {
    setIsShowSelectLanguage(false);
    setLanguage(langId);
  };

  return (
    <>
      {isShowSelectLanguage && (
        <div className={s.trans}>
          <div className={s.langWrapper}>
            <div className={s.lang}>LANGUAGE SELECT</div>
            <div className={s.langSelect}>
              {Object.keys(languages).map((key) => (
                <div
                  key={key}
                  className={s.langSelectButton}
                  onClick={() => setLang(language[key as unknown as language] as unknown as language)}
                >
                  {languages[key]}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
