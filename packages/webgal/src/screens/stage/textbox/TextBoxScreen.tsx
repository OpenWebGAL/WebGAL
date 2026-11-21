import { useEffect, useMemo, useState } from 'react';
import type { BuiltInScreenVariant, ScreenPartDefinition, TextBoxScreenProps } from '@/screens/contracts';
import { installGlobalUiSdk, type RichTextToken, type WebgalUiSdk } from '@/sdk/globalUiSdk';

function getUiSdk(): WebgalUiSdk {
  return (typeof window !== 'undefined' ? window.__WEBGAL_UI_SDK__ : undefined) ?? installGlobalUiSdk();
}

function joinRichTextSegments(
  sdk: WebgalUiSdk,
  segments: string[],
  lineLimit?: number,
): { lines: RichTextToken[][]; prefixNodeCount: number } {
  let merged: RichTextToken[][] = [];
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

const TEXTBOX_PARTS: ScreenPartDefinition[] = [
  { id: 'background', name: '文本框底图', selector: '.TextBox_Background', kind: 'container', allowLayoutEdit: true },
  { id: 'main', name: '文本框容器', selector: '.TextBox_main', kind: 'container', allowLayoutEdit: true },
  {
    id: 'miniAvatar',
    name: '小头像容器',
    selector: '.TextBox_miniAvatarContainer',
    kind: 'container',
    allowLayoutEdit: true,
  },
  {
    id: 'nameBackground',
    name: '角色名背景',
    selector: '.TextBox_ShowName_Background',
    kind: 'container',
    allowLayoutEdit: true,
  },
  { id: 'showName', name: '角色名文本', selector: '.TextBox_showName', kind: 'text', allowLayoutEdit: true },
  { id: 'text', name: '对话正文', selector: '.TextBox_text', kind: 'text', allowLayoutEdit: false },
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
  font-weight: bold;
  letter-spacing: 0.2em;
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
  display: block;
  overflow: hidden;
  padding-left: 0.1em;
  box-sizing: border-box;
  font-weight: bold;
  letter-spacing: 0.2em;
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
  opacity: 0;
  animation-name: webgalTextDelayShow;
  animation-timing-function: ease-out;
  animation-fill-mode: forwards;
}

.TextBox_textElement_Settled {
  position: relative;
  opacity: 1;
}
`.trim();

export function TextBoxScreen(props: TextBoxScreenProps) {
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

  const { lines: textLines, prefixNodeCount } = useMemo(
    () => joinRichTextSegments(sdk, props.dialogSegments, props.lineLimit),
    [sdk, props.dialogSegments, props.lineLimit],
  );
  const nameLines = useMemo(
    () => (props.isHasName ? sdk.parseRichTextLines(props.showName, { lineLimit: props.lineLimit }) : []),
    [sdk, props.isHasName, props.showName, props.lineLimit],
  );

  const hasContent = props.dialogSegments.some((s) => s !== '') || props.showName !== '';
  if (!props.visible || (!hasContent && !props.isPreview)) return null;

  const fontPx = `${(props.fontSizePercent / 100) * 25.6}px`;
  const miniAvatarOffClass = props.miniAvatarUrl === '' ? ' TextBox_main_miniavatarOff' : '';
  const nameNode = sdk.renderRichTextLines(nameLines, {
    isSettled: true,
    dialogKey: `${props.currentDialogKey}-name`,
  });

  return (
    <div {...rootProps}>
      <div className="TextBox_Container" style={{ fontFamily: props.fontFamily }}>
        <div className={`TextBox_Background${miniAvatarOffClass}`} style={{ opacity: props.textboxOpacity / 100 }} />
        <div className={`TextBox_main${miniAvatarOffClass}`}>
          <div className="TextBox_miniAvatarContainer">
            {props.miniAvatarUrl !== '' && (
              <img className="TextBox_miniAvatarImg" alt="miniAvatar" src={props.miniAvatarUrl} />
            )}
          </div>
          {props.isHasName && (
            <>
              <div className="TextBox_ShowName_Background" style={{ opacity: props.textboxOpacity / 100 }}>
                <span style={{ opacity: 0 }}>{nameNode}</span>
              </div>
              <div className="TextBox_showName">{nameNode}</div>
            </>
          )}
          <div
            className={`TextBox_text${props.isRead ? ' TextBox_text_read' : ''}`}
            style={{
              fontSize: fontPx,
              lineHeight: `${props.lineHeight}em`,
            }}
          >
            {sdk.renderRichTextLines(textLines, {
              isSettled,
              charDelayMs: props.textDelayMs,
              charDurationMs: props.textDurationMs,
              revealEndMs: props.textRevealEndMs,
              prefixNodeCount,
              dialogKey: props.currentDialogKey,
              settledClassName: 'TextBox_textElement_Settled',
              animateClassName: 'TextBox_textElement_start',
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export const TEXTBOX_DEFAULT_VARIANT: BuiltInScreenVariant<TextBoxScreenProps> = {
  screen: 'textbox',
  variantId: 'default',
  name: '默认样式 (Refine 2026)',
  component: TextBoxScreen,
  parts: TEXTBOX_PARTS,
  defaultCssText: TEXTBOX_DEFAULT_CSS,
};
