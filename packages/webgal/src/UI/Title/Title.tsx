import { FC } from 'react';
import styles from './title.module.scss';
import { playBgm } from '@/Core/controller/stage/playBgm';
import { continueGame, startGame } from '@/Core/controller/gamePlay/startContinueGame';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { setMenuPanelTag, setVisibility } from '@/store/GUIReducer';
import { MenuPanelTag } from '@/store/guiInterface';
import useTrans from '@/hooks/useTrans';
import useSoundEffect from '@/hooks/useSoundEffect';
import useApplyStyle from '@/hooks/useApplyStyle';
import { fullScreenOption } from '@/store/userDataInterface';
import { keyboard } from '@/hooks/useHotkey';
import useConfigData from '@/hooks/useConfigData';
import TitleButton from './TitleButton';
import { DoubleRight, FolderOpen, PlayOne, SettingTwo, Star } from '@icon-park/react';

/**
 * 标题页
 * @constructor
 */
const Title: FC = () => {
  const userDataState = useSelector((state: RootState) => state.userData);
  const GUIState = useSelector((state: RootState) => state.GUI);
  const dispatch = useDispatch();
  const fullScreen = userDataState.optionData.fullScreen;
  const background = GUIState.titleBg;
  const showBackground = background === '' ? 'rgba(0,0,0,1)' : `url("${background}")`;
  const t = useTrans('title.');
  const { playSeEnter, playSeClick } = useSoundEffect();

  const applyStyle = useApplyStyle('UI/Title/title.scss');
  useConfigData(); // 监听基础ConfigData变化

  const appreciationItems = useSelector((state: RootState) => state.userData.appreciationData);
  const hasAppreciationItems = appreciationItems.bgm.length > 0 || appreciationItems.cg.length > 0;

  return (
    <>
      {GUIState.showTitle && <div className={applyStyle('Title_backup_background', styles.Title_backup_background)} />}
      <div
        id="enter_game_target"
        onClick={() => {
          playBgm(GUIState.titleBgm);
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
            <TitleButton
              text={t('start.title')}
              onClick={() => {
                startGame();
              }}
              icon={<PlayOne size="42" fill="#fff" strokeWidth={4} />}
              subTitle="Start Game"
            />

            <TitleButton
              text={t('continue.title')}
              onClick={async () => {
                dispatch(setVisibility({ component: 'showTitle', visibility: false }));
                continueGame();
              }}
              icon={<DoubleRight size="42" fill="#fff" strokeWidth={4} />}
              subTitle="Continue Game"
            />

            <TitleButton
              text={t('options.title')}
              onClick={() => {
                dispatch(setVisibility({ component: 'showMenuPanel', visibility: true }));
                dispatch(setMenuPanelTag(MenuPanelTag.Option));
              }}
              icon={<SettingTwo size="36" fill="#fff" strokeWidth={4} />}
              subTitle="Options"
            />

            <TitleButton
              text={t('load.title')}
              onClick={() => {
                dispatch(setVisibility({ component: 'showMenuPanel', visibility: true }));
                dispatch(setMenuPanelTag(MenuPanelTag.Load));
              }}
              icon={<FolderOpen size="36" fill="#fff" strokeWidth={4} />}
              subTitle="Load Game"
            />

            {GUIState.enableAppreciationMode && (
              <TitleButton
                text={t('extra.title')}
                disabled={!hasAppreciationItems}
                onClick={() => {
                  dispatch(setVisibility({ component: 'showExtra', visibility: true }));
                }}
                icon={<Star theme="outline" size="42" fill="#fff" />}
                subTitle="Extra"
              />
            )}
            <div
              className={applyStyle('Title_button', styles.Title_button)}
              onClick={() => {
                playSeClick();
                window.close();
              }}
              onMouseEnter={playSeEnter}
            >
              <div className={applyStyle('Title_button_text', styles.Title_button_text)}>{t('exit.title')}</div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Title;
