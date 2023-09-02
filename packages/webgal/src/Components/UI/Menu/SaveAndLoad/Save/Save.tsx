import { CSSProperties, FC } from 'react';
import styles from '../SaveAndLoad.module.scss';
import { saveGame } from '@/Core/controller/storage/saveGame';
import { setStorage } from '@/Core/controller/storage/storageController';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { setSlPage } from '@/store/userDataReducer';
import { showGlogalDialog } from '@/Components/UI/GlobalDialog/GlobalDialog';
import useTrans from '@/hooks/useTrans';
import { useTranslation } from 'react-i18next';
import useSoundEffect from '@/hooks/useSoundEffect';

export const Save: FC = () => {
  const { playSeClickSavePanelSelect, playSeClickSaveElement, playSeEnter, playSeEnterSavePanelSelect } =
    useSoundEffect();
  const userDataState = useSelector((state: RootState) => state.userData);
  const dispatch = useDispatch();
  const page = [];
  for (let i = 1; i <= 20; i++) {
    let classNameOfElement = styles.Save_Load_top_button;
    if (i === userDataState.optionData.slPage) {
      classNameOfElement = classNameOfElement + ' ' + styles.Save_Load_top_button_on;
    }
    const element = (
      <div
        onClick={() => {
          dispatch(setSlPage(i));
          setStorage();
          playSeClickSavePanelSelect();
        }}
        onMouseEnter={playSeEnterSavePanelSelect}
        key={'Save_element_page' + i}
        className={classNameOfElement}
      >
        <div className={styles.Save_Load_top_button_text}>{i}</div>
      </div>
    );
    page.push(element);
  }

  const { i18n } = useTranslation();
  const lang = i18n.language;
  const isFr = lang === 'fr';
  const frStyl: CSSProperties = {
    fontSize: '150%',
    padding: '0 0.2em 0 0.2em',
    margin: '0 0 0 0.8em',
    letterSpacing: '0.05em',
  };

  const tCommon = useTrans('common.');

  const showSaves = [];
  // 现在尝试设置10个存档每页
  const start = (userDataState.optionData.slPage - 1) * 10 + 1;
  const end = start + 9;
  let animationIndex = 0;
  for (let i = start; i <= end; i++) {
    animationIndex++;
    const saveData = userDataState.saveData[i];
    let saveElementContent = <div />;
    if (saveData) {
      const speaker = saveData.nowStageState.showName === '' ? '\u00A0' : `${saveData.nowStageState.showName}`;
      saveElementContent = (
        <>
          <div className={styles.Save_Load_content_element_top}>
            <div className={styles.Save_Load_content_element_top_index}>{saveData.index}</div>
            <div className={styles.Save_Load_content_element_top_date}>{saveData.saveTime}</div>
          </div>
          <div className={styles.Save_Load_content_miniRen}>
            <img className={styles.Save_Load_content_miniRen_bg} alt="Save_img_preview" src={saveData.previewImage} />
          </div>
          <div className={styles.Save_Load_content_text}>
            <div className={styles.Save_Load_content_speaker}>{speaker}</div>
            <div className={styles.Save_Load_content_text_padding}>{saveData.nowStageState.showText}</div>
          </div>
        </>
      );
    }
    // else {

    // }
    const saveElement = (
      <div
        onClick={() => {
          playSeClickSaveElement();
          if (userDataState.saveData[i]) {
            showGlogalDialog({
              title: t('saving.isOverwrite'),
              leftText: tCommon('yes'),
              rightText: tCommon('no'),
              leftFunc: () => {
                saveGame(i);
                setStorage();
              },
              rightFunc: () => {},
            });
          } else {
            saveGame(i);
          }
        }}
        onMouseEnter={playSeEnter}
        key={'saveElement_' + i}
        className={styles.Save_Load_content_element}
        style={{ animationDelay: `${animationIndex * 30}ms` }}
      >
        {saveElementContent}
      </div>
    );
    showSaves.push(saveElement);
  }

  const t = useTrans('menu.');

  return (
    <div className={styles.Save_Load_main}>
      <div className={styles.Save_Load_top}>
        <div className={styles.Save_Load_title} style={isFr ? frStyl : undefined}>
          <div className={styles.Save_title_text}>{t('saving.title')}</div>
        </div>
        <div className={styles.Save_Load_top_buttonList}>{page}</div>
      </div>
      <div className={styles.Save_Load_content} id={'Save_content_page_' + userDataState.optionData.slPage}>
        {showSaves}
      </div>
    </div>
  );
};
