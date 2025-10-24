import useLanguage from '@/hooks/useLanguage';
import { useEffect, useState } from 'react';
import styles from './translation.module.scss';
import languages, { language } from '@/config/language';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import useApplyStyle from '@/hooks/useApplyStyle';
import { useDelayedVisibility } from '@/hooks/useDelayedVisibility';

export default function Translation() {
  const setLanguage = useLanguage();

  const [isShowSelectLanguage, setIsShowSelectLanguage] = useState(false);
  const delayedIsShowSelectLanguage = useDelayedVisibility(isShowSelectLanguage);
  const globalVar = useSelector((state: RootState) => state.userData.globalGameVar);
  const defaultLang = globalVar['Default_Language'] ?? '';

  const setLang = (langId: language) => {
    setIsShowSelectLanguage(false);
    setLanguage(langId);
  };

  const applyStyle = useApplyStyle('UI/Translation/translation.scss');

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
      {delayedIsShowSelectLanguage && (
        <div
          className={`${applyStyle('translation_main', styles.translation_main)} ${
            isShowSelectLanguage ? '' : applyStyle('translation_main_hide', styles.translation_main_hide)
          }`}
        >
          <div className={applyStyle('translation_button_list', styles.translation_button_list)}>
            {Object.keys(languages).map((key) => (
              <div
                key={key}
                className={applyStyle('translation_button', styles.translation_button)}
                onClick={() => setLang(language[key as unknown as language] as unknown as language)}
              >
                {languages[key]}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
