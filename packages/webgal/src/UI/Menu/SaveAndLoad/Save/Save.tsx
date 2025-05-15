import { FC, useEffect } from 'react';
import styles from '../SaveAndLoad.module.scss';
import { saveGame } from '@/Core/controller/storage/saveGame';
import { setStorage } from '@/Core/controller/storage/storageController';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { setSlPage } from '@/store/userDataReducer';
import { showGlogalDialog } from '@/UI/GlobalDialog/GlobalDialog';
import useTrans from '@/hooks/useTrans';
import useSoundEffect from '@/hooks/useSoundEffect';
import { getSavesFromStorage } from '@/Core/controller/storage/savesController';
import { compileSentence } from '@/Stage/TextBox/TextBox';
import { mergeStringsAndKeepObjects } from '@/UI/Backlog/Backlog';
import { DoubleLeft, ViewList } from '@icon-park/react';
import itemBorderSvg from '../itemBorder.svg';
import { setVisibility } from '@/store/GUIReducer';

// 每页显示的存档数
const SAVES_PER_PAGE = 10; // 修改为8个，每行4个，共2行

/**
 * 页码按钮组件
 */
interface PageButtonProps {
  pageNumber: number;
  isActive: boolean;
  onClick: () => void;
}

interface SaveItemProps {
  index: number;
  data: any;
  animationDelay: number;
  onSave: () => void;
}

const PageButton: FC<PageButtonProps> = ({ pageNumber, isActive, onClick }) => {
  const { playSeEnter } = useSoundEffect();

  const className = `${styles.Save_Load_top_button} ${
    isActive ? `${styles.Save_Load_top_button_on} ${styles.Save_top_button_on}` : ''
  }`;

  return (
    <div onClick={onClick} onMouseEnter={playSeEnter} className={className}>
      <div className={styles.Save_Load_top_button_text}>{pageNumber}</div>
    </div>
  );
};

const SaveItem: FC<SaveItemProps> = ({ index, data, animationDelay, onSave }) => {
  const { playSeEnter } = useSoundEffect();
  const formattedIndex = String(index).padStart(2, '0');

  if (!data) {
    return (
      <div
        key={`saveElement_${index}`}
        className={styles.Save_Load_content_element}
        style={{ animationDelay: `${animationDelay}ms` }}
        onMouseEnter={playSeEnter}
        onClick={onSave}
      >
        <img src={itemBorderSvg} className={styles.Save_Load_content_element_svg} alt="border" />
        <div className={styles.Save_Load_content_element_number}>#{formattedIndex}</div>
        <div className={styles.Save_Load_content_element_inner}>
          <div className={styles.Save_Load_content_element_empty}>
            <p>No Data</p>
          </div>
        </div>
      </div>
    );
  }

  // 处理角色名称和文本
  const speaker = data.nowStageState.showName === '' ? '\u00A0' : `${data.nowStageState.showName}`;

  // 提取标题 - 使用文本数据作为标题
  const textString = data.nowStageState.showText || '';
  const title =
    textString.length > 0 ? (textString.length > 10 ? textString.substring(0, 10) + '...' : textString) : '未知场景';
  const showText = `${speaker}:${data.nowStageState.showText}`;
  const sceneData = `${data.sceneData?.sceneName || ''}-${data.sceneData?.currentSentenceId || ''}`;

  return (
    <div
      key={`saveElement_${index}`}
      className={styles.Save_Load_content_element}
      style={{ animationDelay: `${animationDelay}ms` }}
      onMouseEnter={playSeEnter}
      onClick={onSave}
    >
      <img src={itemBorderSvg} className={styles.Save_Load_content_element_svg} alt="border" />
      <div className={styles.Save_Load_content_element_number}>#{formattedIndex}</div>
      <div className={styles.Save_Load_content_element_inner}>
        <img className={styles.Save_Load_content_element_image} alt="Save_img_preview" src={data.previewImage} />
        <div className={styles.Save_Load_content_element_header}>
          <div className={styles.Save_Load_content_element_title}>{title}</div>
        </div>
        <div className={styles.Save_Load_content_element_text}>
          <div className={`${styles.Save_Load_content_element_speaker}`}>{showText}</div>
          <div className={styles.Save_Load_content_element_scene_container}>
            <div className={styles.Save_Load_content_element_scene_container_left}>
              <ViewList theme="outline" size="24" />
              <div className={styles.Save_Load_content_element_scene}>{sceneData}</div>
            </div>
            <div className={styles.Save_Load_content_element_time}>{data.saveTime}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const Save: FC = () => {
  const { playSePageChange, playSeEnter, playSeDialogOpen } = useSoundEffect();
  const userDataState = useSelector((state: RootState) => state.userData);
  const savesDataState = useSelector((state: RootState) => state.saveData);
  const dispatch = useDispatch();
  const t = useTrans('menu.');
  const tCommon = useTrans('common.');
  const currentPage = userDataState.optionData.slPage;

  const startIndex = (currentPage - 1) * SAVES_PER_PAGE + 1;
  const endIndex = startIndex + SAVES_PER_PAGE - 1;

  const handlePageChange = (page: number) => {
    dispatch(setSlPage(page));
    setStorage();
    playSePageChange();
  };

  const handleSaveGame = (index: number) => {
    if (savesDataState.saveData[index]) {
      playSeDialogOpen();
      showGlogalDialog({
        title: t('saving.isOverwrite'),
        leftText: tCommon('yes'),
        rightText: tCommon('no'),
        leftFunc: () => {
          saveGame(index);
          setStorage();
        },
        rightFunc: () => {},
      });
    } else {
      playSePageChange();
      saveGame(index);
    }
  };

  useEffect(() => {
    getSavesFromStorage(startIndex, endIndex);
  }, [startIndex, endIndex]);

  const renderPageButtons = () => {
    const buttons = [];
    const TOTAL_PAGES = 20; // 总页数

    for (let i = 1; i <= TOTAL_PAGES; i++) {
      buttons.push(
        <PageButton
          key={`Save_element_page${i}`}
          pageNumber={i}
          isActive={i === currentPage}
          onClick={() => handlePageChange(i)}
        />,
      );
    }

    return buttons;
  };

  // 渲染存档项
  const renderSaveItems = () => {
    const items = [];

    for (let i = startIndex; i <= endIndex; i++) {
      const animationDelay = (i - startIndex + 1) * 30;
      const saveData = savesDataState.saveData[i];

      items.push(
        <SaveItem
          key={`saveElement_${i}`}
          index={i}
          data={saveData}
          animationDelay={animationDelay}
          onSave={() => handleSaveGame(i)}
        />,
      );
    }

    return items;
  };

  return (
    <div className={styles.Save_Load_main}>
      <div className={styles.Save_Load_top}>
        <div className={styles.Save_Load_top_back}>
          <div
            className={styles.Save_Load_top_back_button}
            onClick={() => dispatch(setVisibility({ component: 'showMenuPanel', visibility: false }))}
          >
            <DoubleLeft size="72" strokeWidth={3} />
          </div>
          <div className={styles.Save_Load_top_back_button_text}>
            保存存档
            <span className={styles.Save_Load_top_back_button_text_sub}>Save</span>
          </div>
        </div>
        <div className={styles.Save_Load_top_buttonList}>{renderPageButtons()}</div>
      </div>
      <div className={styles.Save_Load_content} id={`Save_content_page_${currentPage}`}>
        {renderSaveItems()}
      </div>
    </div>
  );
};

export function easyCompile(sentence: string) {
  const compiledNodes = compileSentence(sentence, 3, true);
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
