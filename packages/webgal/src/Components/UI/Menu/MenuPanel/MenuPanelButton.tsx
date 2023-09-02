import styles from './menuPanel.module.scss';
import { MenuIconMap } from './MenuIconMap';
import { IMenuPanel } from '@/Components/UI/Menu/MenuPanel/menuPanelInterface';
import useSoundEffect from '@/hooks/useSoundEffect';

/**
 * 菜单标签页切换按钮
 * @param props
 * @constructor
 */
export const MenuPanelButton = (props: IMenuPanel) => {
  const { playSeEnterMenuPanelSelect } = useSoundEffect();
  let buttonClassName = styles.MenuPanel_button;
  if (props.hasOwnProperty('buttonOnClassName')) {
    buttonClassName = buttonClassName + props.buttonOnClassName;
  }
  return (
    <div
      className={buttonClassName}
      onClick={() => {
        props.clickFunc();
      }}
      onMouseEnter={playSeEnterMenuPanelSelect}
      style={{ color: props.tagColor }}
    >
      <div className={styles.MenuPanel_button_icon}>
        <MenuIconMap iconName={props.iconName} iconColor={props.iconColor} />
      </div>
      {props.tagName}
    </div>
  );
};
