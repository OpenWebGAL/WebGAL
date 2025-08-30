import styles from './menuPanel.module.scss';
import { MenuPanelTag } from '@/store/guiInterface';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { setMenuPanelTag, setVisibility } from '@/store/GUIReducer';
import { backToTitle } from '@/Core/controller/gamePlay/backToTitle';
import useTrans from '@/hooks/useTrans';
import useSoundEffect from '@/hooks/useSoundEffect';
import { showGlobalDialog } from '@/UI/GlobalDialog/GlobalDialog';
import useApplyStyle from '@/hooks/useApplyStyle';
import { Icon } from '@icon-park/react/lib/runtime';
import { FolderOpen, Home, Left, SdCard, SettingTwo } from '@icon-park/react';

interface IMenuPanelButtonProps {
  key?: string;
  text?: string;
  icon?: Icon;
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

/**
 * Menu页的底栏
 * @constructor
 */
export const MenuPanel = () => {
  // 国际化
  const t = useTrans('menu.');

  const { playSeClick, playSeDialogOpen, playSePageChange, playSeEnter } = useSoundEffect();
  const GUIState = useSelector((state: RootState) => state.GUI);
  const dispatch = useDispatch();

  const applyStyle = useApplyStyle('UI/Menu/MenuPanel/menuPanel.scss');

  const menuPanelButton = (props: IMenuPanelButtonProps) => {
    return (
      <div
        className={`${applyStyle('menu_panel_button', styles.menu_panel_button)} ${
          props.disabled ? applyStyle('menu_panel_button_disabled', styles.menu_panel_button_disabled) : ''
        } ${props.active ? applyStyle('menu_panel_button_active', styles.menu_panel_button_active) : ''}`}
        onClick={props.onClick}
        onMouseEnter={playSeEnter}
        key={props.key}
      >
        {props.icon && (
          <props.icon className={applyStyle('menu_panel_button_icon', styles.menu_panel_button_icon)} strokeWidth={4} />
        )}
        {props.text && (
          <div className={applyStyle('menu_panel_button_text', styles.menu_panel_button_text)}>{props.text}</div>
        )}
      </div>
    );
  };

  return (
    <div className={applyStyle('menu_panel_main', styles.menu_panel_main)}>
      {menuPanelButton({
        key: 'exitButton',
        icon: Left,
        text: t('exit.title'),
        onClick: () => {
          playSeClick();
          dispatch(setVisibility({ component: 'showMenuPanel', visibility: false }));
        },
      })}
      {menuPanelButton({
        key: 'titleButton',
        icon: Home,
        text: t('title.title'),
        onClick: () => {
          playSeDialogOpen();
          showGlobalDialog({
            title: t('$gaming.buttons.titleTips'),
            leftText: t('$common.cancel'),
            rightText: t('$common.confirm'),
            leftFunc: () => {},
            rightFunc: () => {
              backToTitle();
              dispatch(setVisibility({ component: 'showMenuPanel', visibility: false }));
            },
          });
        },
      })}
      {menuPanelButton({
        key: 'saveButton',
        icon: SdCard,
        text: t('saving.title'),
        active: GUIState.currentMenuTag === MenuPanelTag.Save,
        disabled: GUIState.showTitle,
        onClick: () => {
          playSePageChange();
          if (GUIState.showTitle) return;
          dispatch(setMenuPanelTag(MenuPanelTag.Save));
        },
      })}
      {menuPanelButton({
        key: 'loadButton',
        icon: FolderOpen,
        text: t('loadSaving.title'),
        active: GUIState.currentMenuTag === MenuPanelTag.Load,
        onClick: () => {
          playSePageChange();
          dispatch(setMenuPanelTag(MenuPanelTag.Load));
        },
      })}
      {menuPanelButton({
        key: 'optionButton',
        icon: SettingTwo,
        text: t('options.title'),
        active: GUIState.currentMenuTag === MenuPanelTag.Option,
        onClick: () => {
          playSePageChange();
          dispatch(setMenuPanelTag(MenuPanelTag.Option));
        },
      })}
    </div>
  );
};
