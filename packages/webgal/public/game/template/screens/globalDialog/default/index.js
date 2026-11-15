const __WEBGAL_SDK__ = globalThis.__WEBGAL_UI_SDK__;
if (!__WEBGAL_SDK__) {
  throw new Error("WebGAL UI SDK is not initialized.");
}
const { jsx: _jsx, jsxs: _jsxs } = __WEBGAL_SDK__.jsxRuntime;
const installGlobalUiSdk = () => __WEBGAL_SDK__;
function getUiSdk() {
    return (typeof window !== 'undefined' ? window.__WEBGAL_UI_SDK__ : undefined) ?? installGlobalUiSdk();
}
const GLOBAL_DIALOG_PARTS = [
    { id: 'main', name: '弹窗遮罩容器', selector: '.GlobalDialog_main', allowLayoutEdit: true },
    { id: 'container', name: '弹窗内容条', selector: '.GlobalDialog_container', allowLayoutEdit: true },
    { id: 'title', name: '弹窗标题', selector: '.GlobalDialog_title', allowLayoutEdit: false },
    { id: 'button', name: '弹窗按钮', selector: '.GlobalDialog_button', allowLayoutEdit: false },
];
const GLOBAL_DIALOG_DEFAULT_CSS = `
.GlobalDialog_main {
  height: 1440px;
  width: 2560px;
  left: 0px;
  top: 0px;
  position: absolute;
  z-index: 20;
  background: rgba(15, 37, 64, 0.39);
  color: #ffffff;
  animation: showGlobalDialog 0.33s forwards;
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: "资源圆体", "WebgalUI", serif;
}

.GlobalDialog_container {
  height: 288px;
  width: 2560px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-flow: column;
  padding: 25.6px 128px 38.4px 128px;
  box-sizing: border-box;
  border-top: 4px solid;
  border-bottom: 4px solid;
  border-image: linear-gradient(
      to right,
      rgba(255, 255, 255, 0.05) 0%,
      rgba(255, 255, 255, 0.85) 33%,
      rgba(255, 255, 255, 1) 50%,
      rgba(255, 255, 255, 0.85) 66%,
      rgba(255, 255, 255, 0.05) 100%
    )
    1;
  background: linear-gradient(
    to right,
    rgba(0, 92, 175, 0) 0%,
    rgba(0, 92, 175, 0.5) 33%,
    rgba(0, 92, 175, 0.85) 50%,
    rgba(0, 92, 175, 0.5) 66%,
    rgba(0, 92, 175, 0) 100%
  );
}

.GlobalDialog_title {
  min-width: 120px;
  min-height: 1.5em;
  font-size: 76.8px;
  line-height: 1.5;
  text-align: center;
  color: #ffffff;
  paint-order: stroke fill;
  text-shadow: 0px 0px 10px rgba(255, 255, 255, 0.5);
}

.GlobalDialog_buttonList {
  display: flex;
  margin: auto 0px 0px 0px;
}

.GlobalDialog_button {
  font-size: 51.2px;
  padding: 7.68px 51.2px;
  margin: 10.24px 51.2px;
  cursor: pointer;
  transition: background-color 0.33s, color 0.33s, font-weight 0.33s, transform 0.33s;
  text-shadow: 0px 0px 10px rgba(255, 255, 255, 1);
  border-radius: 5px;
  border: 0px solid transparent;
  background: transparent;
  color: #ffffff;
  font-family: inherit;
}

.GlobalDialog_button:hover {
  font-weight: bold;
  color: #005caf;
  transform: scale(1.1, 1.1);
  text-shadow: 0px 0px 15px rgba(0, 0, 0, 0);
  background: rgba(255, 255, 255, 0.85);
}

@keyframes showGlobalDialog {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}
`.trim();
export function GlobalDialogScreen(props) {
    const sdk = getUiSdk();
    const { rootProps } = sdk.useScreenParts('globalDialog', GLOBAL_DIALOG_PARTS, GLOBAL_DIALOG_DEFAULT_CSS);
    if (!props.visible)
        return null;
    return (_jsx("div", { ...rootProps, children: _jsx("div", { className: "GlobalDialog_main", children: _jsxs("div", { className: "GlobalDialog_container", children: [_jsx("div", { className: "GlobalDialog_title", children: props.title }), _jsxs("div", { className: "GlobalDialog_buttonList", children: [_jsx("button", { type: "button", className: "GlobalDialog_button", onClick: () => {
                                    props.playSe.click();
                                    props.onConfirm();
                                }, onMouseEnter: props.playSe.enter, children: props.confirmText }), props.cancelText !== undefined && props.cancelText !== '' && props.onCancel && (_jsx("button", { type: "button", className: "GlobalDialog_button", onClick: () => {
                                    props.playSe.click();
                                    props.onCancel?.();
                                }, onMouseEnter: props.playSe.enter, children: props.cancelText }))] })] }) }) }));
}
export const GLOBAL_DIALOG_DEFAULT_VARIANT = {
    screen: 'globalDialog',
    variantId: 'default',
    name: '默认全局确认弹窗',
    component: GlobalDialogScreen,
    parts: GLOBAL_DIALOG_PARTS,
    defaultCssText: GLOBAL_DIALOG_DEFAULT_CSS,
};

export { GLOBAL_DIALOG_PARTS as parts, GLOBAL_DIALOG_DEFAULT_CSS as defaultCssText, GlobalDialogScreen as Screen };
export default GlobalDialogScreen;
