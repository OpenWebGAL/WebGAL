import { switchAuto } from '@/Core/controller/gamePlay/autoPlay';
import { backToTitle } from '@/Core/controller/gamePlay/backToTitle';
import { switchFast } from '@/Core/controller/gamePlay/fastSkip';
import { loadGame } from '@/Core/controller/storage/loadGame';
import { saveGame } from '@/Core/controller/storage/saveGame';
import { showGlobalDialog } from '@/UI/GlobalDialog/GlobalDialog';
import { easyCompile } from '@/UI/Menu/SaveAndLoad/Save/Save';
import useFullScreen from '@/hooks/useFullScreen';
import useSoundEffect from '@/hooks/useSoundEffect';
import useTrans from '@/hooks/useTrans';
import { setMenuPanelTag, setVisibility } from '@/store/GUIReducer';
import { componentsVisibility, MenuPanelTag } from '@/store/guiInterface';
import { RootState } from '@/store/store';
import {
  AlignTextLeftOne,
  DoubleDown,
  DoubleRight,
  DoubleUp,
  FolderOpen,
  FullScreen,
  Home,
  Lock,
  More,
  OffScreen,
  Pin,
  PlayOne,
  PreviewCloseOne,
  PreviewOpen,
  ReplayMusic,
  Save,
  SettingTwo,
  Unlock,
} from '@icon-park/react';
import { useDispatch, useSelector } from 'react-redux';
import styles from './controlPanel.module.scss';
import useApplyStyle from '@/hooks/useApplyStyle';
import { WebGAL } from '@/Core/WebGAL';
import { Icon } from '@icon-park/react/lib/runtime';
import { ISaveData, pinnedControlPanelButton } from '@/store/userDataInterface';
import { ReactElement, useEffect, useRef, useState } from 'react';
import { setOptionData } from '@/store/userDataReducer';
import { setStorage } from '@/Core/controller/storage/storageController';
import { useDelayedVisibility } from '@/hooks/useDelayedVisibility';

interface IControlPanelButtonProps {
  icon?: Icon;
  text?: string;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  active?: boolean;
  pinButton?: pinnedControlPanelButton;
  // eslint-disable-next-line no-undef
  children?: React.ReactNode;
}

export const ControlPanel = () => {
  const t = useTrans('gaming.');
  const { playSeEnter, playSeClick, playSeDialogOpen } = useSoundEffect();
  const { isSupported: isFullscreenSupport, isFullScreen, toggle: toggleFullscreen } = useFullScreen();
  const GUIStore = useSelector((state: RootState) => state.GUI);
  const optionData = useSelector((state: RootState) => state.userData.optionData);
  const [showList, setShowList] = useState(false);
  const dispatch = useDispatch();
  const setComponentVisibility = (component: keyof componentsVisibility, visibility: boolean) => {
    dispatch(setVisibility({ component, visibility }));
  };
  const setMenuPanel = (menuPanel: MenuPanelTag) => {
    dispatch(setMenuPanelTag(menuPanel));
  };
  const applyStyle = useApplyStyle('UI/BottomControlPanel/bottomControlPanel.scss');

  const [isAuto, setIsAuto] = useState(WebGAL.gameplay.isAuto);
  const [isFast, setIsFast] = useState(WebGAL.gameplay.isFast);
  useEffect(() => {
    const handleIsAutoChange = (e: Event) => {
      setIsAuto(WebGAL.gameplay.isAuto);
    };
    const handleIsFastChange = (e: Event) => {
      setIsFast(WebGAL.gameplay.isFast);
    };
    WebGAL.gameplay.addEventListener('isAutoChange', handleIsAutoChange);
    WebGAL.gameplay.addEventListener('isFastChange', handleIsFastChange);
    return () => {
      WebGAL.gameplay.removeEventListener('isAutoChange', handleIsAutoChange);
      WebGAL.gameplay.removeEventListener('isFastChange', handleIsFastChange);
    };
  }, []);

  const mouseOnControlPanel = useRef(false);
  // eslint-disable-next-line no-undef
  const delayedHideTimeout = useRef<NodeJS.Timeout | null>(null);
  // 获取最近的 showList 状态
  const showListRef = useRef(showList);
  useEffect(() => {
    showListRef.current = showList;
  }, [showList]);

  function updateControlPanelVisibility(state: 'show' | 'hide' | 'delayedHide') {
    if (delayedHideTimeout.current) {
      clearTimeout(delayedHideTimeout.current);
      delayedHideTimeout.current = null;
    }
    switch (state) {
      case 'show':
        dispatch(setVisibility({ component: 'controlsVisibility', visibility: true }));
        break;
      case 'hide':
        dispatch(setVisibility({ component: 'controlsVisibility', visibility: false }));
        break;
      case 'delayedHide':
        // 一秒后隐藏
        delayedHideTimeout.current = setTimeout(() => {
          dispatch(setVisibility({ component: 'controlsVisibility', visibility: false }));
        }, 1000);
        break;
    }
  }

  // 持久化 GUIStore.showControls，确保事件回调拿到最新值
  const showControlsRef = useRef(GUIStore.showControls);
  // Use refs to store DOM elements and only query once on mount
  const fullScreenClickRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    showControlsRef.current = GUIStore.showControls;
  }, [GUIStore.showControls]);

  const mouseEnterPanelHandler = () => {
    mouseOnControlPanel.current = true;
    updateControlPanelVisibility('show');
  };
  const mouseLeavePanelHandler = () => {
    mouseOnControlPanel.current = false;
  };
  const mouseMoveHandler = () => {
    updateControlPanelVisibility('show');
    if (!mouseOnControlPanel.current && !showControlsRef.current && !showListRef.current) {
      updateControlPanelVisibility('delayedHide');
    }
  };

  useEffect(() => {
    fullScreenClickRef.current = document.getElementById('fullScreenClick');
    if (fullScreenClickRef.current) {
      fullScreenClickRef.current.addEventListener('mousemove', mouseMoveHandler);
    } else {
      console.error('Element with id "fullScreenClick" not found');
    }
    return () => {
      if (fullScreenClickRef.current) {
        fullScreenClickRef.current.removeEventListener('mousemove', mouseMoveHandler);
      }
    };
  }, []);

  const saveData = useSelector((state: RootState) => state.saveData.saveData);
  const [fastSaveData, setFastSaveData] = useState<ISaveData | null>(saveData[0] || null);
  useEffect(() => {
    setFastSaveData(saveData[0] || null);
  }, [saveData]);

  const [showFastSlPreview, setShowFastSlPreview] = useState(false);
  const delayedShowFastSlPreview = useDelayedVisibility(showFastSlPreview);

  let fastSlPreview = (
    <div style={{ height: '100%', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ fontSize: '125%' }}>{t('noSaving')}</div>
    </div>
  );
  if (saveData[0]) {
    const data = saveData[0];
    fastSlPreview = (
      <div className={applyStyle('bottom_control_panel_sl_preview_main', styles.bottom_control_panel_sl_preview_main)}>
        <div
          className={applyStyle(
            'bottom_control_panel_sl_preview_img_container',
            styles.bottom_control_panel_sl_preview_img_container,
          )}
        >
          <img style={{ height: '100%' }} alt="q-save-preview image" src={data.previewImage} />
        </div>
        <div
          className={applyStyle(
            'bottom_control_panel_sl_preview_text_container',
            styles.bottom_control_panel_sl_preview_text_container,
          )}
        >
          <div>{easyCompile(data.nowStageState.showName)}</div>
          <div style={{ fontSize: '75%', color: 'rgb(55,60,56)' }}>{easyCompile(data.nowStageState.showText)}</div>
        </div>
      </div>
    );
  }

  const controlPanelBarButton = (props: IControlPanelButtonProps) => {
    return (
      <div
        className={`${applyStyle('control_panel_bar_button', styles.control_panel_bar_button)} ${
          props.active ? applyStyle('control_panel_bar_button_active', styles.control_panel_bar_button_active) : ''
        }`}
        onClick={props.onClick}
        onMouseEnter={() => {
          playSeEnter();
          props.onMouseEnter?.();
        }}
        onMouseLeave={props.onMouseLeave}
      >
        {props.icon && (
          <props.icon
            className={applyStyle('control_panel_bar_button_icon', styles.control_panel_bar_button_icon)}
            strokeWidth={4}
          />
        )}
        {props.children}
      </div>
    );
  };

  const controlPanelListButton = (props: IControlPanelButtonProps) => {
    return (
      <div className={applyStyle('control_panel_list_item', styles.control_panel_list_item)}>
        <div
          className={`${applyStyle('control_panel_list_button', styles.control_panel_list_button)} ${
            props.pinButton !== undefined && (optionData.pinnedControlPanelButtons & props.pinButton) !== 0
              ? applyStyle('control_panel_list_button_active', styles.control_panel_list_button_active)
              : ''
          }`}
          onClick={() => {
            if (props.pinButton) {
              const newResult = optionData.pinnedControlPanelButtons ^ props.pinButton;
              dispatch(setOptionData({ key: 'pinnedControlPanelButtons', value: newResult }));
              setStorage();
              playSeClick();
            }
          }}
        >
          <Pin
            className={applyStyle('control_panel_list_button_icon', styles.control_panel_list_button_icon)}
            strokeWidth={4}
          />
        </div>
        <div
          className={`${applyStyle('control_panel_list_button', styles.control_panel_list_button)} ${
            props.active ? applyStyle('control_panel_list_button_active', styles.control_panel_list_button_active) : ''
          }`}
          onClick={props.onClick}
          onMouseEnter={() => {
            playSeEnter();
            props.onMouseEnter?.();
          }}
          onMouseLeave={props.onMouseLeave}
        >
          {props.icon && (
            <props.icon
              className={applyStyle('control_panel_list_button_icon', styles.control_panel_list_button_icon)}
              strokeWidth={4}
            />
          )}
          {props.text && (
            <div className={applyStyle('control_panel_list_button_text', styles.control_panel_list_button_text)}>
              {props.text}
            </div>
          )}
          {props.children}
        </div>
      </div>
    );
  };

  const rawButtonList: IControlPanelButtonProps[] = [
    // 自动播放
    {
      icon: PlayOne,
      text: t('buttons.auto'),
      onClick: () => {
        switchAuto();
        playSeClick();
      },
      active: isAuto,
      pinButton: pinnedControlPanelButton.autoPlay,
    },
    // 快进
    {
      icon: DoubleRight,
      text: t('buttons.forward'),
      onClick: () => {
        switchFast();
        playSeClick();
      },
      active: isFast,
      pinButton: pinnedControlPanelButton.fastForward,
    },
    // 快速存档
    {
      icon: DoubleDown,
      text: t('buttons.quicklySave'),
      onClick: () => {
        saveGame(0);
        playSeClick();
      },
      onMouseEnter: () => {
        setShowFastSlPreview(true);
      },
      onMouseLeave: () => {
        setShowFastSlPreview(false);
      },
      pinButton: pinnedControlPanelButton.quickSave,
    },
    // 快速读档
    {
      icon: DoubleUp,
      text: t('buttons.quicklyLoad'),
      onClick: () => {
        loadGame(0);
        playSeClick();
      },
      onMouseEnter: () => {
        setShowFastSlPreview(true);
      },
      onMouseLeave: () => {
        setShowFastSlPreview(false);
      },
      pinButton: pinnedControlPanelButton.quickLoad,
    },
    // 存档
    {
      icon: Save,
      text: t('buttons.save'),
      onClick: () => {
        setMenuPanel(MenuPanelTag.Save);
        setComponentVisibility('showMenuPanel', true);
        setShowList(false);
        playSeClick();
      },
      pinButton: pinnedControlPanelButton.save,
    },
    // 读档
    {
      icon: FolderOpen,
      text: t('buttons.load'),
      onClick: () => {
        setMenuPanel(MenuPanelTag.Load);
        setComponentVisibility('showMenuPanel', true);
        setShowList(false);
        playSeClick();
      },
      pinButton: pinnedControlPanelButton.load,
    },
    // 选项
    {
      icon: SettingTwo,
      text: t('buttons.options'),
      onClick: () => {
        setMenuPanel(MenuPanelTag.Option);
        setComponentVisibility('showMenuPanel', true);
        setShowList(false);
        playSeClick();
      },
      pinButton: pinnedControlPanelButton.options,
    },
    // 返回标题
    {
      icon: Home,
      text: t('buttons.title'),
      onClick: () => {
        playSeDialogOpen();
        showGlobalDialog({
          title: t('buttons.titleTips'),
          leftText: t('$common.cancel'),
          rightText: t('$common.confirm'),
          leftFunc: () => {},
          rightFunc: () => {
            setShowList(false);
            backToTitle();
          },
        });
      },
      pinButton: pinnedControlPanelButton.title,
    },
    // 回想
    {
      icon: AlignTextLeftOne,
      text: t('buttons.backlog'),
      onClick: () => {
        setComponentVisibility('showBacklog', true);
        setComponentVisibility('showTextBox', false);
        setShowList(false);
        playSeClick();
      },
      pinButton: pinnedControlPanelButton.backlog,
    },
    // 重播
    {
      icon: ReplayMusic,
      text: t('buttons.replay'),
      onClick: () => {
        let VocalControl: any = document.getElementById('currentVocal');
        if (VocalControl !== null) {
          VocalControl.currentTime = 0;
          VocalControl.pause();
          VocalControl?.play();
        }
        playSeClick();
      },
      pinButton: pinnedControlPanelButton.replay,
    },
    // 隐藏文本框
    {
      icon: GUIStore.showTextBox ? PreviewCloseOne : PreviewOpen,
      text: GUIStore.showTextBox ? t('buttons.hide') : t('buttons.show'),
      onClick: () => {
        setComponentVisibility('showTextBox', !GUIStore.showTextBox);
        playSeClick();
      },
      pinButton: pinnedControlPanelButton.hideTextbox,
    },
    // 全屏
    ...(isFullscreenSupport
      ? [
          {
            icon: isFullScreen ? OffScreen : FullScreen,
            text: t('buttons.fullscreen'),
            onClick: toggleFullscreen,
            pinButton: pinnedControlPanelButton.fullScreen,
          },
        ]
      : []),
    // 锁定显示
    {
      icon: GUIStore.showControls ? Lock : Unlock,
      text: t('buttons.lock'),
      onClick: () => {
        dispatch(setVisibility({ component: 'showControls', visibility: !GUIStore.showControls }));
      },
      pinButton: pinnedControlPanelButton.lock,
    },
  ];

  // 获取钉固的按钮列表
  const renderPinnedButtonList = (): ReactElement[] => {
    return rawButtonList
      .filter((button) => button.pinButton && (optionData.pinnedControlPanelButtons & button.pinButton) !== 0)
      .map(controlPanelBarButton);
  };

  // 获取排序后的按钮列表
  const renderSortedButtonList = (): ReactElement[] => {
    // 将钉固的按钮放在列表最后面
    const buttons: ReactElement[] = [];
    const pinnedButtons: ReactElement[] = [];
    // 遍历所有未排序的按钮
    rawButtonList.forEach((button) => {
      if (button.pinButton && (optionData.pinnedControlPanelButtons & button.pinButton) !== 0) {
        pinnedButtons.push(controlPanelListButton(button));
      } else {
        buttons.push(controlPanelListButton(button));
      }
    });
    return buttons.concat(pinnedButtons);
  };

  // 控制列表延迟退场
  const delayedControlsVisibility = useDelayedVisibility(GUIStore.controlsVisibility);

  // 按钮列表延迟退场
  const delayedShowList = useDelayedVisibility(showList);

  return (
    <>
      {delayedControlsVisibility && (
        <div
          className={`${applyStyle('control_panel_main', styles.control_panel_main)} ${
            GUIStore.controlsVisibility ? '' : applyStyle('control_panel_main_hide', styles.control_panel_main_hide)
          }`}
          style={{ ['--ui-transition-duration' as any]: `${optionData.uiTransitionDuration}ms` }}
        >
          <div
            className={applyStyle('control_panel_bar', styles.control_panel_bar)}
            onMouseEnter={mouseEnterPanelHandler}
            onMouseLeave={mouseLeavePanelHandler}
          >
            {renderPinnedButtonList()}
            {/* 详细列表 */}
            {controlPanelBarButton({
              icon: More,
              onClick: () => {
                setShowList(!showList);
              },
            })}
          </div>
          {delayedShowList && (
            <div
              className={`${applyStyle('control_panel_list', styles.control_panel_list)} ${
                !showList ? applyStyle('control_panel_list_hide', styles.control_panel_list_hide) : ''
              }`}
              onWheel={(event) => {
                // 阻止滚轮触发 backlog
                event.stopPropagation();
              }}
            >
              {renderSortedButtonList()}
            </div>
          )}
        </div>
      )}
      {delayedShowFastSlPreview && fastSaveData && (
        <div
          className={`${applyStyle('control_panel_fast_sl_preview', styles.control_panel_fast_sl_preview)} ${
            showFastSlPreview
              ? ''
              : applyStyle('control_panel_fast_sl_preview_hide', styles.control_panel_fast_sl_preview_hide)
          }`}
          style={{ ['--ui-transition-duration' as any]: `${optionData.uiTransitionDuration}ms` }}
        >
          <img
            src={fastSaveData.previewImage}
            alt="Fast Save Preview"
            className={applyStyle('control_panel_fast_sl_preview_image', styles.control_panel_fast_sl_preview_image)}
          />
          <div
            className={applyStyle(
              'control_panel_fast_sl_preview_dialog_container',
              styles.control_panel_fast_sl_preview_dialog_container,
            )}
          >
            <div
              className={applyStyle(
                'control_panel_fast_sl_preview_speaker',
                styles.control_panel_fast_sl_preview_speaker,
              )}
            >
              {easyCompile(fastSaveData.nowStageState.showName)}
            </div>
            <div
              className={applyStyle('control_panel_fast_sl_preview_text', styles.control_panel_fast_sl_preview_text)}
            >
              {easyCompile(fastSaveData.nowStageState.showText)}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
