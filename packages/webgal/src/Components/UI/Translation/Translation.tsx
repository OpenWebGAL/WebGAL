import useLanguage from '@/hooks/useLanguage';
import { useEffect, useState } from 'react';
import s from './translation.module.scss';
import { language } from '@/config/language';

export default function Translation() {
  const setLanguage = useLanguage();

  const [isShowSelectLanguage, setIsShowSelectLanguage] = useState(false);

  useEffect(() => {
    const lang = window?.localStorage.getItem('lang');
    if (!lang) {
      setIsShowSelectLanguage(true);
    } else {
      setLanguage(Number(window?.localStorage.getItem('lang')));
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
              <div className={s.langSelectButton} onClick={() => setLang(language.zhCn)}>
                中文
              </div>
              <div className={s.langSelectButton} onClick={() => setLang(language.en)}>
                ENGLISH
              </div>
              <div className={s.langSelectButton} onClick={() => setLang(language.jp)}>
                日本語
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
