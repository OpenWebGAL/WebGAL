import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { fullScreenOption } from '@/store/userDataInterface';
import { setMenuPanelTag, setVisibility } from '@/store/GUIReducer';
import { MenuPanelTag } from '@/store/guiInterface';
import useTrans from '@/hooks/useTrans';
import useSoundEffect from '@/hooks/useSoundEffect';
import useApplyStyle from '@/hooks/useApplyStyle';
import { keyboard } from '@/hooks/useHotkey';
import useConfigData from '@/hooks/useConfigData';
import { continueGame, startGame } from '@/Core/controller/gamePlay/startContinueGame';
import { showGlogalDialog } from '../GlobalDialog/GlobalDialog';
import styles from './title.module.scss';
import bgmManager from '@/Core/Modules/audio/bgmManager';

/** 标题页 */
export default function Title() {
  const stageStore = useSelector((webgalStore: RootState) => webgalStore.stage);
  const userDataState = useSelector((state: RootState) => state.userData);
  const GUIState = useSelector((state: RootState) => state.GUI);
  const dispatch = useDispatch();
  const fullScreen = userDataState.optionData.fullScreen;
  const background = GUIState.titleBg;
  const showBackground = background === '' ? 'rgba(0,0,0,1)' : `url("${background}")`;
  const t = useTrans('title.');
  const tCommon = useTrans('common.');
  const { playSeEnter, playSeClick } = useSoundEffect();

  const applyStyle = useApplyStyle('title');
  useConfigData(); // 监听基础ConfigData变化

  const appreciationItems = useSelector((state: RootState) => state.userData.appreciationData);
  const hasAppreciationItems = appreciationItems.bgm.length > 0 || appreciationItems.cg.length > 0;
  const renderButtonText = (text: string) => (
    <div className={applyStyle('Title_button_text', styles.Title_button_text)}>
      {text}
      <span className={applyStyle('Title_button_text_outer', styles.Title_button_text_outer)}>{text}</span>
      <span className={applyStyle('Title_button_text_inner', styles.Title_button_text_inner)}>{text}</span>
    </div>
  );

  return (
    <>
      {GUIState.showTitle && <div className={applyStyle('Title_backup_background', styles.Title_backup_background)} />}
      <div
        className="title__enter-game-target"
        onClick={() => {
          bgmManager.play({ src: GUIState.titleBgm, volume: 100, enter: 2000 });
          dispatch(setVisibility({ component: 'isEnterGame', visibility: true }));
          if (fullScreen === fullScreenOption.on) {
            document.documentElement.requestFullscreen();
            if (keyboard) keyboard.lock(['Escape', 'F11']);
          }
        }}
        onMouseEnter={playSeEnter}
      />
      {GUIState.showTitle && (
        <div
          className={applyStyle('Title_main', styles.Title_main)}
          style={{
            backgroundImage: showBackground,
            backgroundSize: 'cover',
          }}
        >
          <div className={applyStyle('Title_buttonList', styles.Title_buttonList)}>
            <div
              className={applyStyle('Title_button', styles.Title_button)}
              onClick={() => {
                startGame();
                playSeClick();
              }}
              onMouseEnter={playSeEnter}
            >
              {renderButtonText(t('start.title'))}
            </div>
            <div
              className={applyStyle('Title_button', styles.Title_button)}
              onClick={async () => {
                playSeClick();
                dispatch(setVisibility({ component: 'showTitle', visibility: false }));
                continueGame();
              }}
              onMouseEnter={playSeEnter}
            >
              {renderButtonText(t('continue.title'))}
            </div>
            <div
              className={applyStyle('Title_button', styles.Title_button)}
              onClick={() => {
                playSeClick();
                dispatch(setVisibility({ component: 'showMenuPanel', visibility: true }));
                dispatch(setMenuPanelTag(MenuPanelTag.Option));
              }}
              onMouseEnter={playSeEnter}
            >
              {renderButtonText(t('options.title'))}
            </div>
            <div
              className={applyStyle('Title_button', styles.Title_button)}
              onClick={() => {
                playSeClick();
                dispatch(setVisibility({ component: 'showMenuPanel', visibility: true }));
                dispatch(setMenuPanelTag(MenuPanelTag.Load));
              }}
              onMouseEnter={playSeEnter}
            >
              {renderButtonText(t('load.title'))}
            </div>
            {GUIState.enableAppreciationMode && (
              <div
                className={`${applyStyle('Title_button', styles.Title_button)} ${
                  !hasAppreciationItems ? applyStyle('Title_button_disabled', styles.Title_button_disabled) : ''
                }`}
                onClick={() => {
                  if (hasAppreciationItems) {
                    playSeClick();
                    dispatch(setVisibility({ component: 'showExtra', visibility: true }));
                  }
                }}
                onMouseEnter={playSeEnter}
              >
                {renderButtonText(t('extra.title'))}
              </div>
            )}
            <div
              className={applyStyle('Title_button', styles.Title_button)}
              onClick={() => {
                playSeClick();
                showGlogalDialog({
                  title: t('exit.tips'),
                  leftText: tCommon('yes'),
                  rightText: tCommon('no'),
                  leftFunc: () => {
                    window.close();
                  },
                  rightFunc: () => { },
                });
              }}
              onMouseEnter={playSeEnter}
            >
              {renderButtonText(t('exit.title'))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
