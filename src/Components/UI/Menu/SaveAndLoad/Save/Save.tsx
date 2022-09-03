import { FC } from 'react';
import styles from '../SaveAndLoad.module.scss';
import { saveGame } from '@/Core/controller/storage/saveGame';
import { setStorage } from '@/Core/controller/storage/storageController';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { setSlPage } from '@/store/userDataReducer';
import { showGlogalDialog } from '@/Components/UI/GlobalDialog/GlobalDialog';

export const Save: FC = () => {
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
        }}
        key={'Save_element_page' + i}
        className={classNameOfElement}
      >
        <div className={styles.Save_Load_top_button_text}>{i}</div>
      </div>
    );
    page.push(element);
  }

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
            {saveData.nowStageState.bgName !== '' && (
              <img
                className={styles.Save_Load_content_miniRen_bg}
                alt="Save_img_preview"
                src={saveData.nowStageState.bgName}
              />
            )}
            {saveData.nowStageState.bgName === '' && (
              <div style={{ background: 'rgba(0,0,0,0.6)', width: '100%', height: '100%' }} />
            )}
            {saveData.nowStageState.figNameLeft !== '' && (
              <img
                className={styles.Save_Load_content_miniRen_figure + ' ' + styles.Save_Load_content_miniRen_figLeft}
                alt="Save_img_previewLeft"
                src={saveData.nowStageState.figNameLeft}
              />
            )}
            {saveData.nowStageState.figNameRight !== '' && (
              <img
                className={styles.Save_Load_content_miniRen_figure + ' ' + styles.Save_Load_content_miniRen_figRight}
                alt="Save_img_preview"
                src={saveData.nowStageState.figNameRight}
              />
            )}
            {saveData.nowStageState.figName !== '' && (
              <div
                style={{
                  display: 'flex',
                  width: '100%',
                  height: '100%',
                  position: 'absolute',
                  bottom: '0',
                  justifyContent: 'center',
                }}
              >
                <img
                  className={styles.Save_Load_content_miniRen_figure}
                  alt="Save_img_preview"
                  src={saveData.nowStageState.figName}
                />
              </div>
            )}
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
          if (userDataState.saveData[i]) {
            showGlogalDialog({
              title: '是否覆盖存档？',
              leftText: '是',
              rightText: '否',
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
        key={'saveElement_' + i}
        className={styles.Save_Load_content_element}
        style={{ animationDelay: `${animationIndex * 30}ms` }}
      >
        {saveElementContent}
      </div>
    );
    showSaves.push(saveElement);
  }

  return (
    <div className={styles.Save_Load_main}>
      <div className={styles.Save_Load_top}>
        <div className={styles.Save_Load_title}>
          <div className={styles.Save_title_text}>存档</div>
        </div>
        <div className={styles.Save_Load_top_buttonList}>{page}</div>
      </div>
      <div className={styles.Save_Load_content} id={'Save_content_page_' + userDataState.optionData.slPage}>
        {showSaves}
      </div>
    </div>
  );
};
