import { FC, useEffect } from 'react';
import styles from '@/UI/Menu/SaveAndLoad/SaveAndLoad.module.scss';
import { saveGame } from '@/Core/controller/storage/saveGame';
import { setStorage } from '@/Core/controller/storage/storageController';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { setSlPage } from '@/store/userDataReducer';
import { showGlobalDialog } from '@/UI/GlobalDialog/GlobalDialog';
import useTrans from '@/hooks/useTrans';
import useSoundEffect from '@/hooks/useSoundEffect';
import { getSavesFromStorage } from '@/Core/controller/storage/savesController';
import { compileSentence } from '@/Stage/TextBox/TextBox';
import { mergeStringsAndKeepObjects } from '@/Stage/Backlog/Backlog';
import useApplyStyle from '@/hooks/useApplyStyle';

export const Save: FC = () => {
  const { playSePageChange, playSeEnter, playSeDialogOpen } = useSoundEffect();
  const userDataState = useSelector((state: RootState) => state.userData);
  const savesDataState = useSelector((state: RootState) => state.saveData);
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
    let classNameOfElement = applyStyle('save_load_bar_button', styles.save_load_bar_button);
    if (i === userDataState.optionData.slPage) {
      classNameOfElement =
        classNameOfElement + ' ' + applyStyle('save_load_bar_button_active', styles.save_load_bar_button_active);
    }
    const element = (
      <div
        onClick={() => {
          dispatch(setSlPage(i));
          setStorage();
          playSePageChange();
        }}
        onMouseEnter={playSeEnter}
        key={'Save_element_page' + i}
        className={classNameOfElement}
      >
        {i}
      </div>
    );
    page.push(element);
  }

  const tCommon = useTrans('common.');

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
    const saveData = savesDataState.saveData[i];
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
              className={applyStyle('save_load_content_element_info_bar', styles.save_load_content_element_info_bar)}
            >
              <div className={applyStyle('save_load_content_element_index', styles.save_load_content_element_index)}>
                {saveData.index}
              </div>
              <div className={applyStyle('save_load_content_element_date', styles.save_load_content_element_date)}>
                {saveData.saveTime}
              </div>
            </div>
            <div className={applyStyle('save_load_content_dialog', styles.save_load_content_dialog)}>
              <div className={applyStyle('save_load_content_speaker', styles.save_load_content_speaker)}>
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
          if (savesDataState.saveData[i]) {
            playSeDialogOpen();
            showGlobalDialog({
              title: t('saving.isOverwrite'),
              leftText: tCommon('cancel'),
              rightText: tCommon('confirm'),
              leftFunc: () => {},
              rightFunc: () => {
                saveGame(i);
                setStorage();
              },
            });
          } else {
            playSePageChange();
            saveGame(i);
          }
        }}
        onMouseEnter={playSeEnter}
        key={'saveElement_' + i}
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
      <div id="saveLoadBar" className={applyStyle('save_load_bar', styles.save_load_bar)}>
        {page}
      </div>
      <div className={applyStyle('save_load_content', styles.save_load_content)} id="saveLoadContent">
        {showSaves}
      </div>
    </div>
  );
};

export function easyCompile(sentence: string) {
  const compiledNodes = compileSentence(sentence);
  const rnodes = compiledNodes.map((line) => {
    return line.map((c) => {
      return c.reactNode;
    });
  });
  const showNameArrayReduced = mergeStringsAndKeepObjects(rnodes);
  return showNameArrayReduced.map((line, index) => {
    return (
      <div key={`backlog-line-${index}`}>
        {line.map((e, index) => {
          if (e === '<br />') {
            return <br key={`br${index}`} />;
          } else {
            return e;
          }
        })}
      </div>
    );
  });
}
