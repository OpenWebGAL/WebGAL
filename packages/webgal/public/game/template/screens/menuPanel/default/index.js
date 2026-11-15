const __WEBGAL_SDK__ = globalThis.__WEBGAL_UI_SDK__;
if (!__WEBGAL_SDK__) {
  throw new Error("WebGAL UI SDK is not initialized.");
}
const { jsx: _jsx, jsxs: _jsxs } = __WEBGAL_SDK__.jsxRuntime;
const { FolderOpen, Home, Logout, Save, SettingTwo, TreeDiagram } = __WEBGAL_SDK__.icons;
const installGlobalUiSdk = () => __WEBGAL_SDK__;
function getUiSdk() {
    return (typeof window !== 'undefined' ? window.__WEBGAL_UI_SDK__ : undefined) ?? installGlobalUiSdk();
}
const MENU_TAG_SAVE = 0;
const MENU_TAG_LOAD = 1;
const MENU_TAG_OPTION = 2;
const MENU_TAG_FLOWCHART = 3;
const MENU_PANEL_PARTS = [
    { id: 'main', name: '菜单底栏容器', selector: '.MenuPanel_main', allowLayoutEdit: true },
    { id: 'button', name: '菜单按钮', selector: '.MenuPanel_button', allowLayoutEdit: false },
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

.MenuPanel_button.MenuPanel_button_active {
  background-color: rgba(245, 246, 247, 0.35);
}

.MenuPanel_button.MenuPanel_button_save.MenuPanel_button_active {
  color: rgba(74, 34, 93, 0.9);
}

.MenuPanel_button.MenuPanel_button_load.MenuPanel_button_active {
  color: rgba(11, 52, 110, 0.9);
}

.MenuPanel_button.MenuPanel_button_options.MenuPanel_button_active {
  color: rgba(81, 110, 65, 0.9);
}

.MenuPanel_button.MenuPanel_button_flowchart.MenuPanel_button_active {
  color: #2b5f75;
}

.MenuPanel_button_icon {
  transform: translate(0px, 6.4px);
  padding: 0px 7.68px 0px 0px;
  margin: 0px 7.68px 0px 0px;
}
`.trim();
export function MenuPanelScreen(props) {
    const sdk = getUiSdk();
    const { rootProps } = sdk.useScreenParts('menuPanel', MENU_PANEL_PARTS, MENU_PANEL_DEFAULT_CSS);
    if (!props.visible)
        return null;
    const isActive = (tag) => props.activeTag === tag;
    const renderTagButton = (key, tag, roleClass, label, activeColor, iconRender, disabled = false) => {
        const active = isActive(tag);
        const color = active ? activeColor : 'rgba(123, 144, 169, 1)';
        return (_jsxs("button", { type: "button", disabled: disabled, className: `MenuPanel_button ${roleClass}${active ? ' MenuPanel_button_active' : ''}${disabled ? ' MenuPanel_button_disabled' : ''}`, onClick: () => {
                props.playSe.pageChange();
                if (disabled)
                    return;
                props.onSelectTag(tag);
            }, onMouseEnter: disabled ? undefined : props.playSe.enter, children: [_jsx("span", { className: "MenuPanel_button_icon", children: iconRender(color) }), _jsx("span", { children: label })] }, key));
    };
    return (_jsx("div", { ...rootProps, children: _jsxs("div", { className: "MenuPanel_main", children: [props.enableFlowchart &&
                    renderTagButton('flowchart', MENU_TAG_FLOWCHART, 'MenuPanel_button_flowchart', props.t('menu.flowchart.title'), '#2B5F75', (color) => _jsx(TreeDiagram, { theme: "outline", size: "1.2em", fill: color, strokeWidth: 2 })), renderTagButton('save', MENU_TAG_SAVE, 'MenuPanel_button_save', props.t('menu.saving.title'), 'rgba(74, 34, 93, 0.9)', (color) => (_jsx(Save, { theme: "outline", size: "1.2em", fill: color, strokeWidth: 2 })), !props.canSave), renderTagButton('load', MENU_TAG_LOAD, 'MenuPanel_button_load', props.t('menu.loadSaving.title'), 'rgba(11, 52, 110, 0.9)', (color) => (_jsx(FolderOpen, { theme: "outline", size: "1.2em", fill: color, strokeWidth: 2 }))), _jsxs("button", { type: "button", className: "MenuPanel_button", onClick: () => {
                        props.playSe.dialogOpen();
                        props.onBackToTitle();
                    }, onMouseEnter: props.playSe.enter, children: [_jsx("span", { className: "MenuPanel_button_icon", children: _jsx(Home, { theme: "outline", size: "1.2em", fill: "rgba(123, 144, 169, 1)", strokeWidth: 2 }) }), _jsx("span", { children: props.t('menu.title.title') })] }), renderTagButton('options', MENU_TAG_OPTION, 'MenuPanel_button_options', props.t('menu.options.title'), 'rgba(81, 110, 65, 0.9)', (color) => (_jsx(SettingTwo, { theme: "outline", size: "1.2em", fill: color, strokeWidth: 2 }))), _jsxs("button", { type: "button", className: "MenuPanel_button", onClick: () => {
                        props.playSe.click();
                        props.onClose();
                    }, onMouseEnter: props.playSe.enter, children: [_jsx("span", { className: "MenuPanel_button_icon", children: _jsx(Logout, { theme: "outline", size: "1.2em", fill: "rgba(123, 144, 169, 1)", strokeWidth: 2 }) }), _jsx("span", { children: props.t('menu.exit.title') })] })] }) }));
}
export const MENU_PANEL_DEFAULT_VARIANT = {
    screen: 'menuPanel',
    variantId: 'default',
    name: '默认菜单底栏',
    component: MenuPanelScreen,
    parts: MENU_PANEL_PARTS,
    defaultCssText: MENU_PANEL_DEFAULT_CSS,
};

export { MENU_PANEL_PARTS as parts, MENU_PANEL_DEFAULT_CSS as defaultCssText, MenuPanelScreen as Screen };
export default MenuPanelScreen;
