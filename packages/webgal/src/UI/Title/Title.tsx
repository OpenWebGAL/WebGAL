import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { setMenuPanelTag, setVisibility } from '@/store/GUIReducer';
import { MenuPanelTag } from '@/store/guiInterface';
import useTrans from '@/hooks/useTrans';
import useSoundEffect from '@/hooks/useSoundEffect';
import useApplyStyle from '@/hooks/useApplyStyle';
import { continueGame, startGame } from '@/Core/controller/gamePlay/startContinueGame';
import { ScreenSlotRenderer } from '@/screens/ScreenSlotRenderer';
import { useIsCustomUiTemplate, useUiCommonProps } from '@/screens/stage/shared';
import { useUiMockDataEnabled } from '@/sdk/mockData';
import { showGlogalDialog } from '../GlobalDialog/GlobalDialog';
import styles from './title.module.scss';

/** 标题页 */
export default function Title() {
  const userDataState = useSelector((state: RootState) => state.userData);
  const userSaveData = useSelector((state: RootState) => state.saveData);
  const GUIState = useSelector((state: RootState) => state.GUI);
  const dispatch = useDispatch();
  const isCustomUi = useIsCustomUiTemplate();
  const mockDataEnabled = useUiMockDataEnabled();
  const uiCommon = useUiCommonProps();
  const background = GUIState.titleBg;
  const showBackground = background === '' ? 'rgba(0,0,0,1)' : `url("${background}")`;
  const t = useTrans('title.');
  const tCommon = useTrans('common.');
  const { playSeEnter, playSeClick } = useSoundEffect();
  const fastSaveData = userSaveData.quickSaveData;
  const enableContinue = userDataState.globalGameVar.Enable_Continue !== false;

  const applyStyle = useApplyStyle('title');

  const appreciationItems = useSelector((state: RootState) => state.userData.appreciationData);
  const hasAppreciationItems = appreciationItems.bgm.length > 0 || appreciationItems.cg.length > 0;

  if (isCustomUi) {
    return (
      <ScreenSlotRenderer
        screen="title"
        screenProps={{
          visible: GUIState.showTitle,
          backgroundUrl: background,
          canContinue: mockDataEnabled ? true : Boolean(fastSaveData),
          enableContinue,
          enableExtra: mockDataEnabled ? true : GUIState.enableAppreciationMode,
          hasAppreciationItems: mockDataEnabled ? true : hasAppreciationItems,
          onStart: () => {
            startGame();
          },
          onContinue: () => {
            if (fastSaveData) {
              continueGame();
            }
          },
          onOpenLoad: () => {
            dispatch(setVisibility({ component: 'showMenuPanel', visibility: true }));
            dispatch(setMenuPanelTag(MenuPanelTag.Load));
          },
          onOpenOptions: () => {
            dispatch(setVisibility({ component: 'showMenuPanel', visibility: true }));
            dispatch(setMenuPanelTag(MenuPanelTag.Option));
          },
          onOpenExtra: () => {
            if (hasAppreciationItems || mockDataEnabled) {
              dispatch(setVisibility({ component: 'showExtra', visibility: true }));
            }
          },
          onExit: () => {
            showGlogalDialog({
              title: t('exit.tips'),
              leftText: tCommon('yes'),
              rightText: tCommon('no'),
              leftFunc: () => {
                window.close();
              },
              rightFunc: () => {},
            });
          },
          ...uiCommon,
        }}
      />
    );
  }

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
            {enableContinue && (
              <div
                className={`${applyStyle('Title_button', styles.Title_button)} ${
                  !fastSaveData ? applyStyle('Title_button_disabled', styles.Title_button_disabled) : ''
                }`}
                onClick={() => {
                  if (fastSaveData) {
                    playSeClick();
                    continueGame();
                  }
                }}
                onMouseEnter={fastSaveData ? playSeEnter : undefined}
              >
                {renderButtonText(t('continue.title'))}
              </div>
            )}
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
                  rightFunc: () => {},
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
