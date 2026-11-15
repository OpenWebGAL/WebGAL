const __WEBGAL_SDK__ = globalThis.__WEBGAL_UI_SDK__;
if (!__WEBGAL_SDK__) {
  throw new Error("WebGAL UI SDK is not initialized.");
}
const { jsx: _jsx, jsxs: _jsxs } = __WEBGAL_SDK__.jsxRuntime;
const installGlobalUiSdk = () => __WEBGAL_SDK__;
function getUiSdk() {
    return (typeof window !== 'undefined' ? window.__WEBGAL_UI_SDK__ : undefined) ?? installGlobalUiSdk();
}
const TITLE_CLASSIC_PARTS = [
    { id: 'main', name: '标题主容器', selector: '.Title_main', allowLayoutEdit: true },
    { id: 'buttonList', name: '按钮列表', selector: '.Title_buttonList', allowLayoutEdit: true },
    { id: 'button', name: '标题按钮', selector: '.Title_button', allowLayoutEdit: false },
    { id: 'buttonText', name: '按钮文字', selector: '.Title_button_text', allowLayoutEdit: false },
];
const TITLE_CLASSIC_DEFAULT_CSS = `
.Title_main {
  position: absolute;
  left: 0px;
  top: 0px;
  width: 2560px;
  height: 1440px;
  z-index: 13;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.Title_buttonList {
  font-family: "思源宋体", serif;
  display: flex;
  position: absolute;
  left: 0px;
  bottom: 0px;
  width: 2560px;
  height: 172.8px;
  background: rgba(0, 0, 0, 0.4);
  justify-content: space-evenly;
  justify-items: center;
  align-items: center;
  flex-flow: row;
  transition: background 0.75s;
  box-sizing: border-box;
}

.Title_buttonList:hover {
  background: rgba(0, 0, 0, 0.6);
}

.Title_button {
  font-weight: bold;
  text-align: center;
  flex: 0 1 auto;
  cursor: pointer;
  padding: 5.12px 25.6px;
  border: 0px solid transparent;
  background: transparent;
  transition: background-color 0.3s, transform 0.3s, text-shadow 0.3s;
}

.Title_button:hover {
  text-shadow: 0px 0px 10px rgba(255, 255, 255, 1);
  transform: scale(1.025, 1.025) translate(0px, -1.28px);
}

.Title_button:disabled,
.Title_button.Title_button_disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

.Title_button:disabled:hover,
.Title_button.Title_button_disabled:hover {
  text-shadow: none;
  transform: none;
}

.Title_button_text {
  display: block;
  font-size: 47.36px;
  font-family:
    "WebgalUI",
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    Roboto,
    Oxygen,
    Ubuntu,
    Cantarell,
    "Fira Sans",
    "Droid Sans",
    "Helvetica Neue",
    sans-serif;
  letter-spacing: 0.15em;
  padding: 0px 23.68px;
  color: #f5f5f5;
  white-space: nowrap;
}
`.trim();
export function TitleClassic(props) {
    const sdk = getUiSdk();
    const { rootProps } = sdk.useScreenParts('title', TITLE_CLASSIC_PARTS, TITLE_CLASSIC_DEFAULT_CSS);
    if (!props.visible)
        return null;
    const backgroundStyle = props.backgroundUrl === ''
        ? { background: 'linear-gradient(135deg, #fdfbfb 0%, #dcddde 100%)' }
        : {
            backgroundImage: `url("${props.backgroundUrl}"), linear-gradient(135deg, #fdfbfb 0%, #dcddde 100%)`,
            backgroundSize: 'cover',
        };
    const renderButton = (key, label, onClick, disabled = false) => (_jsx("button", { type: "button", disabled: disabled, className: `Title_button${disabled ? ' Title_button_disabled' : ''}`, onClick: () => {
            if (disabled)
                return;
            props.playSe.click();
            onClick();
        }, onMouseEnter: disabled ? undefined : props.playSe.enter, children: _jsx("span", { className: "Title_button_text", children: label }) }, key));
    return (_jsx("div", { ...rootProps, children: _jsx("div", { className: "Title_main", style: backgroundStyle, children: _jsxs("div", { className: "Title_buttonList", children: [renderButton('start', props.t('title.start.title'), props.onStart), props.enableContinue &&
                        renderButton('continue', props.t('title.continue.title'), props.onContinue, !props.canContinue), renderButton('options', props.t('title.options.title'), props.onOpenOptions), renderButton('load', props.t('title.load.title'), props.onOpenLoad), props.enableExtra &&
                        renderButton('extra', props.t('title.extra.title'), props.onOpenExtra, !props.hasAppreciationItems), renderButton('exit', props.t('title.exit.title'), props.onExit)] }) }) }));
}
export const TITLE_CLASSIC_VARIANT = {
    screen: 'title',
    variantId: 'classic',
    name: '经典底栏',
    component: TitleClassic,
    parts: TITLE_CLASSIC_PARTS,
    defaultCssText: TITLE_CLASSIC_DEFAULT_CSS,
};

export { TITLE_CLASSIC_PARTS as parts, TITLE_CLASSIC_DEFAULT_CSS as defaultCssText, TitleClassic as Screen };
export default TitleClassic;
