const __WEBGAL_SDK__ = globalThis.__WEBGAL_UI_SDK__;
if (!__WEBGAL_SDK__) {
  throw new Error("WebGAL UI SDK is not initialized.");
}
const { jsx: _jsx, jsxs: _jsxs } = __WEBGAL_SDK__.jsxRuntime;
const installGlobalUiSdk = () => __WEBGAL_SDK__;
function getUiSdk() {
    return (typeof window !== 'undefined' ? window.__WEBGAL_UI_SDK__ : undefined) ?? installGlobalUiSdk();
}
const TITLE_EDITORIAL_PARTS = [
    { id: 'main', name: '标题主容器', selector: '.Title_main', allowLayoutEdit: true },
    { id: 'buttonList', name: '按钮列表', selector: '.Title_buttonList', allowLayoutEdit: true },
    { id: 'button', name: '标题按钮', selector: '.Title_button', allowLayoutEdit: false },
    { id: 'buttonText', name: '按钮文字', selector: '.Title_button_text', allowLayoutEdit: false },
];
const TITLE_EDITORIAL_DEFAULT_CSS = `
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
  position: absolute;
  right: 0px;
  top: 0px;
  width: 680px;
  height: 1440px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-end;
  padding: 0px 128px 0px 80px;
  background: linear-gradient(
    90deg,
    rgba(16, 20, 28, 0) 0%,
    rgba(16, 20, 28, 0.45) 45%,
    rgba(16, 20, 28, 0.72) 100%
  );
  box-sizing: border-box;
}

.Title_button {
  width: 100%;
  text-align: right;
  cursor: pointer;
  padding: 22px 28px 22px 16px;
  margin: 6px 0px;
  border: 0px solid transparent;
  border-bottom: 1px solid rgba(255, 255, 255, 0.14);
  border-right: 3px solid transparent;
  background: transparent;
  transition: border-color 0.25s ease, background-color 0.25s ease, transform 0.25s ease;
}

.Title_button:last-child {
  border-bottom-color: transparent;
}

.Title_button:hover {
  border-right-color: #e2e8f0;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.1) 100%);
  transform: translateX(-8px);
}

.Title_button:disabled,
.Title_button.Title_button_disabled {
  cursor: not-allowed;
  opacity: 0.4;
}

.Title_button:disabled:hover,
.Title_button.Title_button_disabled:hover {
  border-right-color: transparent;
  background: transparent;
  transform: none;
}

.Title_button_text {
  display: block;
  font-family: "思源宋体", Georgia, serif;
  font-size: 46px;
  letter-spacing: 0.22em;
  color: #f8fafc;
  text-shadow: 0px 2px 10px rgba(0, 0, 0, 0.55);
  white-space: nowrap;
}
`.trim();
export function TitleEditorialRight(props) {
    const sdk = getUiSdk();
    const { rootProps } = sdk.useScreenParts('title', TITLE_EDITORIAL_PARTS, TITLE_EDITORIAL_DEFAULT_CSS);
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
export const TITLE_EDITORIAL_RIGHT_VARIANT = {
    screen: 'title',
    variantId: 'editorial-right',
    name: '右侧书卷',
    component: TitleEditorialRight,
    parts: TITLE_EDITORIAL_PARTS,
    defaultCssText: TITLE_EDITORIAL_DEFAULT_CSS,
};

export { TITLE_EDITORIAL_PARTS as parts, TITLE_EDITORIAL_DEFAULT_CSS as defaultCssText, TitleEditorialRight as Screen };
export default TitleEditorialRight;
