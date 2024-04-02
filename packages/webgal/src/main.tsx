import React from 'react';
import ReactDOM from 'react-dom';
import './index.scss';
import App from './App';
import './assets/style/animation.scss';
import 'modern-css-reset/dist/reset.min.css';

/**
 * i18n
 */
import i18n from 'i18next';
import { initReactI18next, Trans } from 'react-i18next';
import { defaultLanguage, i18nTranslationResources, language } from './config/language';
import { webgalStore } from './store/store';
import { Provider } from 'react-redux';

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    // the translations
    // (tip move them in a JSON file and import them,
    // or even better, manage them via a UI: https://react.i18next.com/guides/multiple-translation-files#manage-your-translations-with-a-management-gui)
    resources: i18nTranslationResources || {},
    lng: language[defaultLanguage] || 'zhCn', // if you're using a language detector, do not define the lng option
    fallbackLng: 'zhCn',

    interpolation: {
      escapeValue: false, // react already safes from xss => https://www.i18next.com/translation-function/interpolation#unescape
    },
  })
  .then(() => console.log('WebGAL i18n Ready!'));

// eslint-disable-next-line react/no-deprecated
ReactDOM.render(
  <React.StrictMode>
    <Trans>
      <Provider store={webgalStore}>
        <App />
      </Provider>
    </Trans>
  </React.StrictMode>,
  document.getElementById('root'),
);
