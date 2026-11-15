const __WEBGAL_SDK__ = globalThis.__WEBGAL_UI_SDK__;
if (!__WEBGAL_SDK__) {
  throw new Error("WebGAL UI SDK is not initialized.");
}
const { jsx: _jsx } = __WEBGAL_SDK__.jsxRuntime;
const installGlobalUiSdk = () => __WEBGAL_SDK__;
function getUiSdk() {
    return (typeof window !== 'undefined' ? window.__WEBGAL_UI_SDK__ : undefined) ?? installGlobalUiSdk();
}
const CHOOSE_PARTS = [
    { id: 'main', name: '选项列表容器', selector: '.Choose_Main', allowLayoutEdit: true },
    { id: 'item', name: '选项按钮', selector: '.Choose_item', allowLayoutEdit: false },
];
const CHOOSE_DEFAULT_CSS = `
.Choose_Main {
  position: absolute;
  left: 0px;
  top: 0px;
  width: 2560px;
  height: 1440px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 13;
  background: rgba(0, 0, 0, 0.05);
}

.Choose_item {
  font-family: inherit;
  cursor: pointer;
  min-width: 1280px;
  padding: 16.96px 67.84px;
  margin: 16.96px 0px;
  font-size: 67.84px;
  color: #8e354a;
  text-align: center;
  border-radius: 4px;
  border: 3px solid rgba(0, 0, 0, 0);
  box-shadow: 0px 0px 25px rgba(0, 0, 0, 0.25);
  background: rgba(255, 255, 255, 0.65);
  transition: background-color 0.5s, border 0.5s, font-weight 0.5s, box-shadow 0.5s;
}

.Choose_item:hover {
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0px 0px 25px rgba(0, 0, 0, 0.35);
  border: 3px solid #8e354a;
}

.Choose_item:disabled,
.Choose_item.Choose_item_disabled {
  cursor: not-allowed;
  color: rgba(142, 53, 74, 0.5);
  background: rgba(255, 255, 255, 0.5);
  border: 3px solid rgba(0, 0, 0, 0);
  box-shadow: 0px 0px 25px rgba(0, 0, 0, 0.25);
}
`.trim();
export function ChooseScreen(props) {
    const sdk = getUiSdk();
    const { rootProps } = sdk.useScreenParts('choose', CHOOSE_PARTS, CHOOSE_DEFAULT_CSS);
    if (!props.visible)
        return null;
    return (_jsx("div", { ...rootProps, children: _jsx("div", { className: "Choose_Main", style: { fontFamily: props.fontFamily }, children: props.options.map((option) => (_jsx("button", { type: "button", disabled: option.disabled, className: `Choose_item${option.disabled ? ' Choose_item_disabled' : ''}`, onClick: () => {
                    if (option.disabled)
                        return;
                    props.playSe.click();
                    props.onSelect(option.id);
                }, onMouseEnter: option.disabled ? undefined : props.playSe.enter, children: option.text }, option.id))) }) }));
}
export const CHOOSE_DEFAULT_VARIANT = {
    screen: 'choose',
    variantId: 'default',
    name: '默认分支选择',
    component: ChooseScreen,
    parts: CHOOSE_PARTS,
    defaultCssText: CHOOSE_DEFAULT_CSS,
};

export { CHOOSE_PARTS as parts, CHOOSE_DEFAULT_CSS as defaultCssText, ChooseScreen as Screen };
export default ChooseScreen;
