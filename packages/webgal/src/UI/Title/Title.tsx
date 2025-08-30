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
import { playBgm } from '@/Core/controller/stage/playBgm';
import { continueGame, startGame } from '@/Core/controller/gamePlay/startContinueGame';
import { showGlobalDialog } from '../GlobalDialog/GlobalDialog';
import styles from './title.module.scss';

import { Icon } from '@icon-park/react/lib/runtime';
import { FolderOpen, GoOn, PlayOne, Power, SettingTwo, Star } from '@icon-park/react';
import { useDelayedVisibility } from '@/hooks/useDelayedVisibility';

interface ITitleButtonProps {
  text?: string;
  icon?: Icon;
  disabled?: boolean;
  onClick?: () => void;
}

/** 标题页 */
export default function Title() {
  const userDataState = useSelector((state: RootState) => state.userData);
  const GUIState = useSelector((state: RootState) => state.GUI);
  const dispatch = useDispatch();
  const fullScreen = userDataState.optionData.fullScreen;
  const background = GUIState.titleBg;
  const showBackground = background === '' ? 'rgba(0,0,0,1)' : `url("${background}")`;
  const t = useTrans('title.');
  const tCommon = useTrans('common.');
  const { playSeEnter, playSeClick } = useSoundEffect();

  const applyStyle = useApplyStyle('UI/Title/title.scss');
  useConfigData(); // 监听基础ConfigData变化

  const appreciationItems = useSelector((state: RootState) => state.userData.appreciationData);
  const hasAppreciationItems = appreciationItems.bgm.length > 0 || appreciationItems.cg.length > 0;

  const titleButton = (props: ITitleButtonProps) => {
    return (
      <div
        className={`${applyStyle('title_button', styles.title_button)} ${
          props.disabled ? applyStyle('title_button_disabled', styles.title_button_disabled) : ''
        }`}
        onClick={props.onClick}
        onMouseEnter={playSeEnter}
      >
        {props.icon && (
          <props.icon className={applyStyle('title_button_icon', styles.title_button_icon)} strokeWidth={4} />
        )}
        {props.text && <div className={applyStyle('title_button_text', styles.title_button_text)}>{props.text}</div>}
      </div>
    );
  };

  const delayedShowTitle = useDelayedVisibility(GUIState.showTitle);
  const optionData = useSelector((state: RootState) => state.userData.optionData);

  return (
    <>
      {GUIState.showTitle && <div className={applyStyle('title_backup_background', styles.title_backup_background)} />}
      <div
        id="enter_game_target"
        onClick={() => {
          playBgm(GUIState.titleBgm);
          dispatch(setVisibility({ component: 'isEnterGame', visibility: true }));
          if (fullScreen === fullScreenOption.on) {
            document.documentElement.requestFullscreen();
            if (keyboard) keyboard.lock(['Escape', 'F11']);
          }
          const launchScreen = document.getElementById('launchScreen');
          if (launchScreen) {
            launchScreen.classList.add('launch_screen_off');
          }
        }}
        onMouseEnter={playSeEnter}
      />
      {delayedShowTitle && (
        <div
          className={`${applyStyle('title_main', styles.title_main)} ${
            GUIState.showTitle ? '' : applyStyle('title_main_hide', styles.title_main_hide)
          }`}
          style={{
            ['--ui-transition-duration' as any]: `${optionData.uiTransitionDuration}ms`,
          }}
        >
          <div
            className={applyStyle('title_background', styles.title_background)}
            style={{
              backgroundImage: showBackground,
            }}
          />
          <div className={applyStyle('title_button_list', styles.title_button_list)}>
            {titleButton({
              text: t('start.title'),
              icon: PlayOne,
              onClick: () => {
                startGame();
                playSeClick();
              },
            })}
            {titleButton({
              text: t('continue.title'),
              icon: GoOn,
              onClick: () => {
                playSeClick();
                dispatch(setVisibility({ component: 'showTitle', visibility: false }));
                continueGame();
              },
            })}
            {titleButton({
              text: t('load.title'),
              icon: FolderOpen,
              onClick: () => {
                playSeClick();
                dispatch(setVisibility({ component: 'showMenuPanel', visibility: true }));
                dispatch(setMenuPanelTag(MenuPanelTag.Load));
              },
            })}
            {titleButton({
              text: t('options.title'),
              icon: SettingTwo,
              onClick: () => {
                playSeClick();
                dispatch(setVisibility({ component: 'showMenuPanel', visibility: true }));
                dispatch(setMenuPanelTag(MenuPanelTag.Option));
              },
            })}
            {GUIState.enableAppreciationMode &&
              titleButton({
                text: t('extra.title'),
                icon: Star,
                disabled: !hasAppreciationItems,
                onClick: () => {
                  if (hasAppreciationItems) {
                    playSeClick();
                    dispatch(setVisibility({ component: 'showExtra', visibility: true }));
                  }
                },
              })}
            {titleButton({
              text: t('exit.title'),
              icon: Power,
              onClick: () => {
                playSeClick();
                showGlobalDialog({
                  title: t('exit.tips'),
                  leftText: tCommon('cancel'),
                  rightText: tCommon('confirm'),
                  leftFunc: () => {},
                  rightFunc: () => {
                    window.close();
                  },
                });
              },
            })}
          </div>
        </div>
      )}
    </>
  );
}
