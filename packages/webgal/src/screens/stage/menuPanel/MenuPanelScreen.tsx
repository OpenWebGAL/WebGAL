import { FolderOpen, Home, Logout, Save, SettingTwo, TreeDiagram } from '@icon-park/react';
import type { BuiltInScreenVariant, MenuPanelScreenProps, ScreenPartDefinition } from '@/screens/contracts';
import { installGlobalUiSdk, type WebgalUiSdk } from '@/sdk/globalUiSdk';
import type { MenuPanelTag } from '@/store/guiInterface';

function getUiSdk(): WebgalUiSdk {
  return (typeof window !== 'undefined' ? window.__WEBGAL_UI_SDK__ : undefined) ?? installGlobalUiSdk();
}

const MENU_TAG_SAVE = 0 as MenuPanelTag;
const MENU_TAG_LOAD = 1 as MenuPanelTag;
const MENU_TAG_OPTION = 2 as MenuPanelTag;
const MENU_TAG_FLOWCHART = 3 as MenuPanelTag;

const MENU_PANEL_PARTS: ScreenPartDefinition[] = [
  { id: 'main', name: '菜单底栏容器', selector: '.MenuPanel_main', kind: 'container', allowLayoutEdit: true },
  { id: 'button', name: '菜单按钮', selector: '.MenuPanel_button', kind: 'container', allowLayoutEdit: false },
  {
    id: 'buttonText',
    name: '菜单按钮文字',
    selector: '.MenuPanel_button_text',
    kind: 'text',
    stateHostSelector: '.MenuPanel_button',
    allowLayoutEdit: false,
  },
];

const MENU_PANEL_DEFAULT_CSS = `
.MenuPanel_main {
  position: absolute;
  left: 0px;
  top: 1296px;
  width: 2560px;
  height: 144px;
  z-index: 16;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0px 55px;
  box-sizing: border-box;
}

.MenuPanel_button {
  display: flex;
  justify-content: center;
  min-width: 320px;
  padding: 12.8px 15px 0px 15px;
  margin-right: 15px;
  border: 0px solid transparent;
  border-radius: 6px;
  background: rgba(0, 0, 0, 0);
  color: rgba(123, 144, 169, 1);
  font-size: 51.2px;
  text-align: center;
  cursor: pointer;
  overflow: hidden;
  transition: text-shadow 0.7s, background-color 0.7s;
}

.MenuPanel_button:last-child {
  margin-right: 0px;
}

.MenuPanel_button:hover {
  background-color: rgba(245, 246, 247, 0.15);
}

.MenuPanel_button:disabled,
.MenuPanel_button.MenuPanel_button_disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

.MenuPanel_button.active:where(.MenuPanel_button_save) {
  color: rgba(74, 34, 93, 0.9);
}

.MenuPanel_button.active:where(.MenuPanel_button_load) {
  color: rgba(11, 52, 110, 0.9);
}

.MenuPanel_button.active:where(.MenuPanel_button_options) {
  color: rgba(81, 110, 65, 0.9);
}

.MenuPanel_button.active:where(.MenuPanel_button_flowchart) {
  color: #2b5f75;
}

.MenuPanel_button.active {
  background-color: rgba(245, 246, 247, 0.35);
}

.MenuPanel_button_icon {
  transform: translate(0px, 6.4px);
  padding: 0px 7.68px 0px 0px;
  margin: 0px 7.68px 0px 0px;
}

.MenuPanel_button_text {
  font-size: 51.2px;
}
`.trim();

export function MenuPanelScreen(props: MenuPanelScreenProps) {
  const sdk = getUiSdk();
  const { rootProps } = sdk.useScreenParts('menuPanel', MENU_PANEL_PARTS, MENU_PANEL_DEFAULT_CSS);

  if (!props.visible) return null;

  const isActive = (tag: MenuPanelTag) => props.activeTag === tag;

  const renderTagButton = (
    key: string,
    tag: MenuPanelTag,
    roleClass: string,
    label: string,
    icon: JSX.Element,
    disabled = false,
  ) => {
    const active = isActive(tag);
    return (
      <button
        key={key}
        type="button"
        disabled={disabled}
        className={`MenuPanel_button ${roleClass}${active ? ' active' : ''}${
          disabled ? ' MenuPanel_button_disabled' : ''
        }`}
        onClick={() => {
          props.playSe.pageChange();
          if (disabled) return;
          props.onSelectTag(tag);
        }}
        onMouseEnter={disabled ? undefined : props.playSe.enter}
      >
        <span className="MenuPanel_button_icon">{icon}</span>
        <span className="MenuPanel_button_text">{label}</span>
      </button>
    );
  };

  return (
    <div {...rootProps}>
      <div className="MenuPanel_main">
        {props.enableFlowchart &&
          renderTagButton(
            'flowchart',
            MENU_TAG_FLOWCHART,
            'MenuPanel_button_flowchart',
            props.t('menu.flowchart.title'),
            <TreeDiagram theme="outline" size="1.2em" fill="currentColor" strokeWidth={2} />,
          )}
        {renderTagButton(
          'save',
          MENU_TAG_SAVE,
          'MenuPanel_button_save',
          props.t('menu.saving.title'),
          <Save theme="outline" size="1.2em" fill="currentColor" strokeWidth={2} />,
          !props.canSave,
        )}
        {renderTagButton(
          'load',
          MENU_TAG_LOAD,
          'MenuPanel_button_load',
          props.t('menu.loadSaving.title'),
          <FolderOpen theme="outline" size="1.2em" fill="currentColor" strokeWidth={2} />,
        )}
        <button
          type="button"
          className="MenuPanel_button"
          onClick={() => {
            props.playSe.dialogOpen();
            props.onBackToTitle();
          }}
          onMouseEnter={props.playSe.enter}
        >
          <span className="MenuPanel_button_icon">
            <Home theme="outline" size="1.2em" fill="currentColor" strokeWidth={2} />
          </span>
          <span className="MenuPanel_button_text">{props.t('menu.title.title')}</span>
        </button>
        {renderTagButton(
          'options',
          MENU_TAG_OPTION,
          'MenuPanel_button_options',
          props.t('menu.options.title'),
          <SettingTwo theme="outline" size="1.2em" fill="currentColor" strokeWidth={2} />,
        )}
        <button
          type="button"
          className="MenuPanel_button"
          onClick={() => {
            props.playSe.click();
            props.onClose();
          }}
          onMouseEnter={props.playSe.enter}
        >
          <span className="MenuPanel_button_icon">
            <Logout theme="outline" size="1.2em" fill="currentColor" strokeWidth={2} />
          </span>
          <span className="MenuPanel_button_text">{props.t('menu.exit.title')}</span>
        </button>
      </div>
    </div>
  );
}

export const MENU_PANEL_DEFAULT_VARIANT: BuiltInScreenVariant<MenuPanelScreenProps> = {
  screen: 'menuPanel',
  variantId: 'default',
  name: '默认菜单底栏',
  component: MenuPanelScreen,
  parts: MENU_PANEL_PARTS,
  defaultCssText: MENU_PANEL_DEFAULT_CSS,
};
