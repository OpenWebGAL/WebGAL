import { CSSProperties, FC, useEffect } from 'react';
import { loadGame } from '@/Core/controller/storage/loadGame';
import styles from '../SaveAndLoad.module.scss';
// import {saveGame} from '@/Core/controller/storage/saveGame';
import { setStorage } from '@/Core/controller/storage/storageController';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { setSlPage } from '@/store/userDataReducer';
import useTrans from '@/hooks/useTrans';
import { useTranslation } from 'react-i18next';
import useSoundEffect from '@/hooks/useSoundEffect';
import { getSavesFromStorage } from '@/Core/controller/storage/savesController';
import { easyCompile } from '@/UI/Menu/SaveAndLoad/Save/Save';
import useApplyStyle from '@/hooks/useApplyStyle';

export const Load: FC = () => {
  const { playSeClick, playSeEnter, playSePageChange } = useSoundEffect();
  const applyStyle = useApplyStyle('menuSaveAndLoad');
  const userDataState = useSelector((state: RootState) => state.userData);
  const saveDataState = useSelector((state: RootState) => state.saveData);
  const dispatch = useDispatch();
  const page = [];
  for (let i = 1; i <= 20; i++) {
    let classNameOfElement = `${applyStyle('Save_Load_top_button', styles.Save_Load_top_button)} ${applyStyle('Load_top_button', styles.Load_top_button)}`;
    if (i === userDataState.optionData.slPage) {
      classNameOfElement =
        classNameOfElement +
        ' ' +
        applyStyle('Save_Load_top_button_on', styles.Save_Load_top_button_on) +
        ' ' +
        applyStyle('Load_top_button_on', styles.Load_top_button_on);
    }
    const element = (
      <div
        onClick={() => {
          dispatch(setSlPage(i));
          setStorage();
          playSePageChange();
        }}
        onMouseEnter={playSeEnter}
        key={'Load_element_page' + i}
        className={classNameOfElement}
      >
        <div className={applyStyle('Save_Load_top_button_text', styles.Save_Load_top_button_text)}>{i}</div>
      </div>
    );
    page.push(element);
  }

  const showSaves = [];
  // 现在尝试设置10个存档每页
  const start = (userDataState.optionData.slPage - 1) * 10 + 1;
  const end = start + 9;

  useEffect(() => {
    getSavesFromStorage(start, end);
  }, [start, end]);

  let animationIndex = 0;
  for (let i = start; i <= end; i++) {
    animationIndex++;
    const saveData = saveDataState.saveData[i];
    let saveElementContent = <div />;
    if (saveData) {
      const speaker = saveData.nowStageState.showName === '' ? '\u00A0' : `${saveData.nowStageState.showName}`;
      const speakerView = easyCompile(speaker);
      saveElementContent = (
        <>
          <div className={applyStyle('Save_Load_content_element_top', styles.Save_Load_content_element_top)}>
            <div
              className={`${applyStyle('Save_Load_content_element_top_index', styles.Save_Load_content_element_top_index)} ${applyStyle('Load_content_elememt_top_index', styles.Load_content_elememt_top_index)}`}
            >
              {saveData.index}
            </div>
            <div
              className={`${applyStyle('Save_Load_content_element_top_date', styles.Save_Load_content_element_top_date)} ${applyStyle('Load_content_element_top_date', styles.Load_content_element_top_date)}`}
            >
              {saveData.saveTime}
            </div>
          </div>
          <div className={applyStyle('Save_Load_content_miniRen', styles.Save_Load_content_miniRen)}>
            <img
              className={applyStyle('Save_Load_content_miniRen_bg', styles.Save_Load_content_miniRen_bg)}
              alt="Save_img_preview"
              src={saveData.previewImage}
            />
          </div>
          <div className={applyStyle('Save_Load_content_text', styles.Save_Load_content_text)}>
            <div
              className={`${applyStyle('Save_Load_content_speaker', styles.Save_Load_content_speaker)} ${applyStyle('Load_content_speaker', styles.Load_content_speaker)}`}
            >
              {speakerView}
            </div>
            <div className={applyStyle('Save_Load_content_text_padding', styles.Save_Load_content_text_padding)}>
              {easyCompile(saveData.nowStageState.showText)}
            </div>
          </div>
        </>
      );
    }
    // else {

    // }
    const saveElement = (
      <div
        onClick={() => {
          loadGame(i);
          playSeClick();
        }}
        onMouseEnter={playSeEnter}
        key={'loadElement_' + i}
        className={applyStyle('Save_Load_content_element', styles.Save_Load_content_element)}
        style={{ animationDelay: `${animationIndex * 30}ms` }}
      >
        {saveElementContent}
      </div>
    );
    showSaves.push(saveElement);
  }

  const t = useTrans('menu.');

  return (
    <div className={applyStyle('Save_Load_main', styles.Save_Load_main)}>
      <div className={applyStyle('Save_Load_top', styles.Save_Load_top)}>
        <div className={applyStyle('Save_Load_title', styles.Save_Load_title)}>
          <div className={applyStyle('Load_title_text', styles.Load_title_text)}>{t('loadSaving.title')}</div>
        </div>
        <div className={applyStyle('Save_Load_top_buttonList', styles.Save_Load_top_buttonList)}>{page}</div>
      </div>
      <div
        className={applyStyle('Save_Load_content', styles.Save_Load_content)}
        id={'Load_content_page_' + userDataState.optionData.slPage}
      >
        {showSaves}
      </div>
    </div>
  );
};
