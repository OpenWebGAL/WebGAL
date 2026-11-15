const __WEBGAL_SDK__ = globalThis.__WEBGAL_UI_SDK__;
if (!__WEBGAL_SDK__) {
  throw new Error("WebGAL UI SDK is not initialized.");
}
const { jsx: _jsx, Fragment: _Fragment, jsxs: _jsxs } = __WEBGAL_SDK__.jsxRuntime;
const { useEffect, useMemo, useState } = __WEBGAL_SDK__.react;
const installGlobalUiSdk = () => __WEBGAL_SDK__;
function getUiSdk() {
    return (typeof window !== 'undefined' ? window.__WEBGAL_UI_SDK__ : undefined) ?? installGlobalUiSdk();
}
function joinRichTextSegments(sdk, segments, lineLimit) {
    let merged = [];
    let prefixNodeCount = 0;
    for (const seg of segments) {
        const lines = sdk.parseRichTextLines(seg, { replaceSpaceWithNbsp: true });
        prefixNodeCount = (lineLimit !== undefined ? merged.slice(0, lineLimit) : merged).flat().length;
        if (merged.length === 0) {
            merged = lines;
            continue;
        }
        const [firstLine = [], ...restLines] = lines;
        const joinedLast = [...merged[merged.length - 1], ...firstLine];
        merged = [...merged.slice(0, -1), joinedLast, ...restLines];
    }
    return {
        lines: lineLimit !== undefined ? merged.slice(0, lineLimit) : merged,
        prefixNodeCount,
    };
}
const TEXTBOX_PARTS = [
    { id: 'background', name: '文本框底图', selector: '.TextBox_Background', allowLayoutEdit: true },
    { id: 'main', name: '文本框容器', selector: '.TextBox_main', allowLayoutEdit: true },
    { id: 'miniAvatar', name: '小头像容器', selector: '.TextBox_miniAvatarContainer', allowLayoutEdit: true },
    { id: 'nameBackground', name: '角色名背景', selector: '.TextBox_ShowName_Background', allowLayoutEdit: true },
    { id: 'showName', name: '角色名文本', selector: '.TextBox_showName', allowLayoutEdit: true },
    { id: 'text', name: '对话正文', selector: '.TextBox_text', allowLayoutEdit: false },
];
const TEXTBOX_DEFAULT_CSS = `
@keyframes webgalTextBoxShowSoftly {
  0% { opacity: 0; }
  100% { opacity: 1; }
}

@keyframes webgalTextDelayShow {
  0% { opacity: 0; }
  100% { opacity: 1; }
}

.TextBox_Container {
  position: absolute;
  left: 0px;
  top: 0px;
  width: 2560px;
  height: 1440px;
  z-index: 6;
  pointer-events: none;
  animation: webgalTextBoxShowSoftly 0.7s ease-out forwards;
}

.TextBox_Background {
  position: absolute;
  left: 0px;
  right: -2px;
  bottom: -2px;
  min-height: 430px;
  max-height: 430px;
  z-index: 2;
  border-radius: 0px;
  background-blend-mode: darken;
  background-color: rgba(167, 186, 214, 0.28);
  background-image: linear-gradient(
    118deg,
    rgba(147, 165, 207, 0.9) 0%,
    rgba(182, 198, 222, 0.82) 48%,
    rgba(228, 239, 233, 0.82) 100%
  );
  -webkit-mask-image:
    linear-gradient(to bottom, rgba(0, 0, 0, 0.04) 0px, rgba(0, 0, 0, 0.28) 10%, #000000 75%),
    linear-gradient(to right, rgba(0, 0, 0, 0.08) 0px, rgba(0, 0, 0, 0.28) 10%, #000000 42%);
  -webkit-mask-composite: source-in;
  mask-image:
    linear-gradient(to bottom, rgba(0, 0, 0, 0.04) 0px, rgba(0, 0, 0, 0.28) 10%, #000000 75%),
    linear-gradient(to right, rgba(0, 0, 0, 0.08) 0px, rgba(0, 0, 0, 0.28) 10%, #000000 42%);
  mask-composite: intersect;
  box-sizing: border-box;
  transition: left 0.33s;
}

.TextBox_Background.TextBox_main_miniavatarOff {
  left: 0px;
}

.TextBox_main {
  position: absolute;
  left: 0px;
  right: -2px;
  bottom: -2px;
  min-height: 430px;
  max-height: 430px;
  z-index: 3;
  border-radius: 0px;
  background-blend-mode: darken;
  padding: 125.6px 50px 70px 490px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  font-weight: bold;
  color: #ffffff;
  letter-spacing: 0.2em;
  transition: left 0.33s;
}

.TextBox_main.TextBox_main_miniavatarOff {
  left: 0px;
}

.TextBox_miniAvatarContainer {
  position: absolute;
  left: 0px;
  bottom: 0px;
  width: 450px;
  height: 450px;
  border-radius: 0px;
  overflow: visible;
  pointer-events: none;
}

.TextBox_miniAvatarImg {
  max-height: 100%;
  max-width: 100%;
  position: absolute;
  bottom: 0px;
  filter: drop-shadow(15px 0px 3px rgba(0, 0, 0, 0.5));
}

.TextBox_ShowName_Background {
  position: absolute;
  left: 490px;
  top: 26px;
  height: 90px;
  min-width: 50%;
  line-height: 68px;
  padding: 0px 51.2px 10px 0px;
  font-size: 51.2px;
  border-radius: 0px;
  z-index: 2;
  background: transparent;
  border: 0px solid transparent;
  border-bottom: 3px solid transparent;
  border-image: linear-gradient(
      to right,
      rgba(255, 255, 255, 0.2) 0%,
      rgba(255, 255, 255, 0.95) 5%,
      rgba(255, 255, 255, 0) 50%,
      rgba(255, 255, 255, 0) 100%
    )
    1;
  box-shadow: none;
  backdrop-filter: none;
  -webkit-mask-image: none;
  mask-image: none;
  white-space: nowrap;
  box-sizing: border-box;
}

.TextBox_showName {
  position: absolute;
  left: 490px;
  top: 26px;
  height: 90px;
  min-width: 50%;
  line-height: 68px;
  padding: 0px 51.2px 10px 0px;
  font-size: 51.2px;
  border-radius: 0px;
  z-index: 3;
  border: 4px solid rgba(255, 255, 255, 0);
  white-space: nowrap;
  box-sizing: border-box;
  color: #f8f8f8;
  paint-order: stroke fill;
  -webkit-text-stroke: 0.12em #2e2312;
  text-shadow:
    0.05em 0.05em 0.02em rgba(0, 0, 0, 0.85),
    0.05em 0.05em 0.03em rgba(0, 0, 0, 0.5);
}

.TextBox_text {
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding-left: 0.1em;
  box-sizing: border-box;
  color: #f8f8f8;
  paint-order: stroke fill;
  -webkit-text-stroke: 0.12em #2e2312;
  text-shadow:
    0.05em 0.05em 0.02em rgba(0, 0, 0, 0.85),
    0.05em 0.05em 0.03em rgba(0, 0, 0, 0.5);
}

.TextBox_text.TextBox_text_read {
  color: #c0c0c0;
}

.TextBox_text ruby rt {
  font-size: 0.45em;
  line-height: 1;
}

.TextBox_textElement_start {
  position: relative;
  display: inline-flex;
  align-content: space-between;
  opacity: 0;
  animation-name: webgalTextDelayShow;
  animation-timing-function: ease-out;
  animation-fill-mode: forwards;
}

.TextBox_textElement_Settled {
  position: relative;
  display: inline-flex;
  align-content: space-between;
  opacity: 1;
}
`.trim();
export function TextBoxScreen(props) {
    const sdk = getUiSdk();
    const { rootProps } = sdk.useScreenParts('textbox', TEXTBOX_PARTS, TEXTBOX_DEFAULT_CSS);
    const [isSettled, setIsSettled] = useState(false);
    const segmentSignature = props.dialogSegments.join('\0');
    useEffect(() => {
        setIsSettled(false);
    }, [props.currentDialogKey, segmentSignature]);
    useEffect(() => {
        if (!props.isPreview && props.settledSignal > 0) {
            setIsSettled(true);
        }
    }, [props.settledSignal, props.isPreview]);
    const { lines: textLines, prefixNodeCount } = useMemo(() => joinRichTextSegments(sdk, props.dialogSegments, props.lineLimit), [sdk, props.dialogSegments, props.lineLimit]);
    const nameLines = useMemo(() => (props.isHasName ? sdk.parseRichTextLines(props.showName, { lineLimit: props.lineLimit }) : []), [sdk, props.isHasName, props.showName, props.lineLimit]);
    const hasContent = props.dialogSegments.some((s) => s !== '') || props.showName !== '';
    if (!props.visible || (!hasContent && !props.isPreview))
        return null;
    const fontPx = `${(props.fontSizePercent / 100) * 25.6}px`;
    const miniAvatarOffClass = props.miniAvatarUrl === '' ? ' TextBox_main_miniavatarOff' : '';
    const nameNode = sdk.renderRichTextLines(nameLines, {
        isSettled: true,
        dialogKey: `${props.currentDialogKey}-name`,
    });
    return (_jsx("div", { ...rootProps, children: _jsxs("div", { className: "TextBox_Container", style: { fontFamily: props.fontFamily }, children: [_jsx("div", { className: `TextBox_Background${miniAvatarOffClass}`, style: { opacity: props.textboxOpacity / 100 } }), _jsxs("div", { className: `TextBox_main${miniAvatarOffClass}`, children: [_jsx("div", { className: "TextBox_miniAvatarContainer", children: props.miniAvatarUrl !== '' && (_jsx("img", { className: "TextBox_miniAvatarImg", alt: "miniAvatar", src: props.miniAvatarUrl })) }), props.isHasName && (_jsxs(_Fragment, { children: [_jsx("div", { className: "TextBox_ShowName_Background", style: { opacity: props.textboxOpacity / 100 }, children: _jsx("span", { style: { opacity: 0 }, children: nameNode }) }), _jsx("div", { className: "TextBox_showName", children: nameNode })] })), _jsx("div", { className: `TextBox_text${props.isRead ? ' TextBox_text_read' : ''}`, style: {
                                fontSize: fontPx,
                                lineHeight: `${props.lineHeight}em`,
                            }, children: sdk.renderRichTextLines(textLines, {
                                isSettled,
                                charDelayMs: props.textDelayMs,
                                charDurationMs: props.textDurationMs,
                                revealEndMs: props.textRevealEndMs,
                                prefixNodeCount,
                                dialogKey: props.currentDialogKey,
                                settledClassName: 'TextBox_textElement_Settled',
                                animateClassName: 'TextBox_textElement_start',
                            }) })] })] }) }));
}
export const TEXTBOX_DEFAULT_VARIANT = {
    screen: 'textbox',
    variantId: 'default',
    name: '默认样式 (Refine 2026)',
    component: TextBoxScreen,
    parts: TEXTBOX_PARTS,
    defaultCssText: TEXTBOX_DEFAULT_CSS,
};

export { TEXTBOX_PARTS as parts, TEXTBOX_DEFAULT_CSS as defaultCssText, TextBoxScreen as Screen };
export default TextBoxScreen;
