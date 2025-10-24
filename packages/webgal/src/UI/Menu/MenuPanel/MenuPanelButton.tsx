import styles from './menuPanel.module.scss';
import { MenuIconMap } from './MenuIconMap';
import { IMenuPanel } from '@/UI/Menu/MenuPanel/menuPanelInterface';
import useSoundEffect from '@/hooks/useSoundEffect';
import useApplyStyle from '@/hooks/useApplyStyle';

/**
 * 菜单标签页切换按钮
 * @param props
 * @constructor
 */
export const MenuPanelButton = (props: IMenuPanel) => {
  const { playSePageChange, playSeEnter } = useSoundEffect();
  const applyStyle = useApplyStyle('UI/Menu/MenuPanel/menuPanel.scss');
  let buttonClassName = applyStyle('menu_panel_button', styles.menu_panel_button);
  if (props.hasOwnProperty('buttonOnClassName')) {
    buttonClassName = buttonClassName + props.buttonOnClassName;
  }
  return (
    <div
      className={buttonClassName}
      onClick={() => {
        props.clickFunc();
        // playSePageChange();
      }}
      onMouseEnter={playSeEnter}
      style={{ ...props.style, color: props.tagColor }}
    >
      <div className={applyStyle('menu_panel_button_icon', styles.menu_panel_button_icon)}>
        <MenuIconMap iconName={props.iconName} iconColor={props.iconColor} />
      </div>
      {props.tagName}
    </div>
  );
};
