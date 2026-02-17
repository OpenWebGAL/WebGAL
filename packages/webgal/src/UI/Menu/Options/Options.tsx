import { FC, useEffect } from 'react';
import styles from './options.module.scss';
import { getStorage } from '@/Core/controller/storage/storageController';
import { useValue } from '@/hooks/useValue';
import { System } from '@/UI/Menu/Options/System/System';
import { Display } from '@/UI/Menu/Options/Display/Display';
import { Sound } from '@/UI/Menu/Options/Sound/Sound';
import useTrans from '@/hooks/useTrans';
import useSoundEffect from '@/hooks/useSoundEffect';
import useApplyStyle from '@/hooks/useApplyStyle';

enum optionPage {
  'System',
  'Display',
  'Sound',
}

export const Options: FC = () => {
  const { playSeEnter, playSeSwitch } = useSoundEffect();
  const applyStyle = useApplyStyle('menuOptions');
  const currentOptionPage = useValue(optionPage.System);
  useEffect(getStorage, []);

  function getClassName(page: optionPage) {
    const baseClass = applyStyle('Options_page_button', styles.Options_page_button);
    if (page === currentOptionPage.value) {
      return `${baseClass} ${applyStyle('Options_page_button_active', styles.Options_page_button_active)}`;
    }
    return baseClass;
  }

  const t = useTrans('menu.options.');

  return (
    <div className={applyStyle('Options_main', styles.Options_main)}>
      <div className={applyStyle('Options_top', styles.Options_top)}>
        <div className={applyStyle('Options_title', styles.Options_title)}>
          <div className={applyStyle('Option_title_text', styles.Option_title_text)}>{t('title')}</div>
        </div>
      </div>
      <div className={applyStyle('Options_page_container', styles.Options_page_container)}>
        <div className={applyStyle('Options_button_list', styles.Options_button_list)}>
          <div
            onClick={() => {
              currentOptionPage.set(optionPage.System);
              playSeSwitch();
            }}
            className={getClassName(optionPage.System)}
            onMouseEnter={playSeEnter}
          >
            {t('pages.system.title')}
          </div>
          <div
            onClick={() => {
              currentOptionPage.set(optionPage.Display);
              playSeSwitch();
            }}
            className={getClassName(optionPage.Display)}
            onMouseEnter={playSeEnter}
          >
            {t('pages.display.title')}
          </div>
          <div
            onClick={() => {
              currentOptionPage.set(optionPage.Sound);
              playSeSwitch();
            }}
            className={getClassName(optionPage.Sound)}
            onMouseEnter={playSeEnter}
          >
            {t('pages.sound.title')}
          </div>
        </div>
        <div className={applyStyle('Options_main_content', styles.Options_main_content)}>
          {currentOptionPage.value === optionPage.Display && <Display />}
          {currentOptionPage.value === optionPage.System && <System />}
          {currentOptionPage.value === optionPage.Sound && <Sound />}
        </div>
      </div>
    </div>
  );
};
