import useLanguage from '@/hooks/useLanguage';
import { useEffect, useState } from 'react';
import s from './translation.module.scss';
import languages, { language } from '@/config/language';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';

export default function Translation() {
  const setLanguage = useLanguage();

  const [isShowSelectLanguage, setIsShowSelectLanguage] = useState(false);
  const globalVar = useSelector((state: RootState) => state.userData.globalGameVar);
  const defaultLang = globalVar['Default_Language'] ?? '';

  const setLang = (langId: language) => {
    setIsShowSelectLanguage(false);
    setLanguage(langId);
  };

  useEffect(() => {
    const lang = window?.localStorage.getItem('lang');
    if (!lang) {
      setIsShowSelectLanguage(true);
      if (defaultLang) {
        switch (defaultLang) {
          case 'zh_CN':
            setLang(language.zhCn);
            break;
          case 'zh_TW':
            setLang(language.zhTw);
            break;
          case 'en':
            setLang(language.en);
            break;
          case 'ja':
            setLang(language.jp);
            break;
          case 'fr':
            setLang(language.fr);
            break;
          case 'de':
            setLang(language.de);
            break;
          default:
            setLang(language.zhCn);
            break;
        }
      }
    } else {
      setLanguage(Number(window?.localStorage.getItem('lang')), false);
    }
  }, [defaultLang]);

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
