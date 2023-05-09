import styles from '@/Components/UI/Menu/Options/options.module.scss';
import useTrans from '@/hooks/useTrans';

import { RootState } from '@/store/store';
import { useDispatch, useSelector } from 'react-redux';
import { NormalOption } from '../NormalOption';
import { NormalButton } from '../NormalButton';
import { language } from '@/store/userDataInterface';
import { setStorage } from '@/Core/controller/storage/storageController';
import { setOptionData } from '@/store/userDataReducer';
import { useTranslation } from 'react-i18next';

export default function Language() {
  const userDataState = useSelector((state: RootState) => state.userData);
  const dispatch = useDispatch();
  const { i18n } = useTranslation();
  const t = useTrans('menu.options.pages.language.options.');

  return (
    <div className={styles.Options_main_content_half}>
      <NormalOption key="option7" title={t('language.title')}>
        <NormalButton
          currentChecked={userDataState.optionData.language}
          textList={t('language.options.zhCn', 'language.options.en', 'language.options.jp')}
          functionList={[
            () => {
              dispatch(setOptionData({ key: 'language', value: language.zhCn }));
              setStorage();
              i18n.changeLanguage('zhCn');
            },
            () => {
              dispatch(setOptionData({ key: 'language', value: language.en }));
              setStorage();
              i18n.changeLanguage('en');
            },
            () => {
              dispatch(setOptionData({ key: 'language', value: language.jp }));
              setStorage();
              i18n.changeLanguage('jp');
            },
          ]}
        />
      </NormalOption>
    </div>
  );
}
