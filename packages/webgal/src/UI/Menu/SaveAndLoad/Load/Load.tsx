import { CSSProperties, FC, useEffect } from 'react';
import { loadGame } from '@/Core/controller/storage/loadGame';
import styles from '@/UI/Menu/SaveAndLoad/SaveAndLoad.module.scss';
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
  const userDataState = useSelector((state: RootState) => state.userData);
  const saveDataState = useSelector((state: RootState) => state.saveData);
  const dispatch = useDispatch();
  const applyStyle = useApplyStyle('UI/Menu/SaveAndLoad/saveAndLoad.scss');

  // 换页时将存档滚动容器拉至顶部
  useEffect(() => {
    const saveLoadContent = document.getElementById('saveLoadContent');
    if (saveLoadContent) {
      saveLoadContent.scrollTop = 0;
    }
  }, [userDataState.optionData.slPage]);

  const page = [];
  for (let i = 1; i <= 20; i++) {
    let classNameOfElement =
      applyStyle('save_load_bar_button', styles.save_load_bar_button) +
      ' ' +
      applyStyle('load_bar_button', styles.load_bar_button);
    if (i === userDataState.optionData.slPage) {
      classNameOfElement =
        classNameOfElement +
        ' ' +
        applyStyle('save_load_bar_button_active', styles.save_load_bar_button_active) +
        ' ' +
        applyStyle('load_bar_button_active', styles.load_bar_button_active);
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
        <div className={applyStyle('save_load_top_button_text', styles.save_load_top_button_text)}>{i}</div>
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
          <div className={applyStyle('save_load_content_element_preview', styles.save_load_content_element_preview)}>
            <img
              className={applyStyle(
                'save_load_content_element_preview_image',
                styles.save_load_content_element_preview_image,
              )}
              alt="Save_img_preview"
              src={saveData.previewImage}
            />
          </div>
          <div className={applyStyle('save_load_content_element_info', styles.save_load_content_element_info)}>
            <div
              className={
                applyStyle('save_load_content_element_info_bar', styles.save_load_content_element_info_bar) +
                ' ' +
                applyStyle('load_content_element_info_bar', styles.load_content_element_info_bar)
              }
            >
              <div
                className={
                  applyStyle('save_load_content_element_index', styles.save_load_content_element_index) +
                  ' ' +
                  applyStyle('load_content_element_index', styles.load_content_element_index)
                }
              >
                {saveData.index}
              </div>
              <div
                className={
                  applyStyle('save_load_content_element_date', styles.save_load_content_element_date) +
                  ' ' +
                  applyStyle('load_content_element_date', styles.load_content_element_date)
                }
              >
                {saveData.saveTime}
              </div>
            </div>
            <div className={applyStyle('save_load_content_dialog', styles.save_load_content_dialog)}>
              <div
                className={
                  applyStyle('save_load_content_speaker', styles.save_load_content_speaker) +
                  ' ' +
                  applyStyle('load_content_speaker', styles.load_content_speaker)
                }
              >
                {speakerView}
              </div>
              <div className={applyStyle('save_load_content_text', styles.save_load_content_text)}>
                {easyCompile(saveData.nowStageState.showText)}
              </div>
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
        className={applyStyle('save_load_content_element', styles.save_load_content_element)}
        style={{
          ['--save-load-content-element-index' as any]: animationIndex,
        }}
      >
        {saveElementContent}
      </div>
    );
    showSaves.push(saveElement);
  }

  const t = useTrans('menu.');

  return (
    <div className={applyStyle('save_load_main', styles.save_load_main)}>
      <div className={applyStyle('save_load_bar', styles.save_load_bar)}>{page}</div>
      <div className={applyStyle('save_load_content', styles.save_load_content)} id="saveLoadContent">
        {showSaves}
      </div>
    </div>
  );
};
