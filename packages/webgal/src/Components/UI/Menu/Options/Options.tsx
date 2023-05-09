import { FC, useEffect } from 'react';
import styles from './options.module.scss';
import { getStorage } from '@/Core/controller/storage/storageController';
import { useValue } from '@/hooks/useValue';
import { System } from '@/Components/UI/Menu/Options/System/System';
import { Display } from '@/Components/UI/Menu/Options/Display/Display';
import { Sound } from '@/Components/UI/Menu/Options/Sound/Sound';
import useTrans from '@/hooks/useTrans';

enum optionPage {
  'System',
  'Display',
  'Sound',
}

export const Options: FC = () => {
  const currentOptionPage = useValue(optionPage.System);
  useEffect(getStorage, []);

  function getClassName(page: optionPage) {
    if (page === currentOptionPage.value) {
      return styles.Options_page_button + ' ' + styles.Options_page_button_active;
    } else return styles.Options_page_button;
  }

  const t = useTrans('menu.options.');

  return (
    <div className={styles.Options_main}>
      <div className={styles.Options_top}>
        <div className={styles.Options_title}>
          <div className={styles.Option_title_text}>{t('title')}</div>
        </div>
      </div>
      <div className={styles.Options_page_container}>
        <div className={styles.Options_button_list}>
          <div onClick={() => currentOptionPage.set(optionPage.System)} className={getClassName(optionPage.System)}>
            {t('pages.system.title')}
          </div>
          <div onClick={() => currentOptionPage.set(optionPage.Display)} className={getClassName(optionPage.Display)}>
            {t('pages.display.title')}
          </div>
          <div onClick={() => currentOptionPage.set(optionPage.Sound)} className={getClassName(optionPage.Sound)}>
            {t('pages.sound.title')}
          </div>
        </div>
        <div className={styles.Options_main_content}>
          {currentOptionPage.value === optionPage.Display && <Display />}
          {currentOptionPage.value === optionPage.System && <System />}
          {currentOptionPage.value === optionPage.Sound && <Sound />}
        </div>
      </div>
    </div>
  );
};
