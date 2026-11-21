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

const TEXTBOX_BARE_PARTS: ScreenPartDefinition[] = [
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

const TEXTBOX_BARE_DEFAULT_CSS = `
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
}

.TextBox_Background {
  position: absolute;
  left: 0px;
  right: 0px;
  bottom: 0px;
  min-height: 360px;
  max-height: 360px;
  z-index: 2;
  box-sizing: border-box;
}

.TextBox_main {
  position: absolute;
  left: 0px;
  right: 0px;
  bottom: 0px;
  min-height: 360px;
  max-height: 360px;
  z-index: 3;
  padding: 96px 80px 48px 460px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.TextBox_main.TextBox_main_miniavatarOff {
  padding: 96px 80px 48px 80px;
}

.TextBox_miniAvatarContainer {
  position: absolute;
  left: 40px;
  bottom: 0px;
  width: 360px;
  height: 360px;
  overflow: hidden;
  pointer-events: none;
}

.TextBox_miniAvatarImg {
  max-height: 100%;
  max-width: 100%;
  position: absolute;
  bottom: 0px;
}

.TextBox_ShowName_Background {
  position: absolute;
  left: 460px;
  top: 24px;
  height: 64px;
  min-width: 240px;
  line-height: 64px;
  padding: 0px;
  font-size: 48px;
  z-index: 2;
  white-space: nowrap;
  box-sizing: border-box;
}

.TextBox_showName {
  position: absolute;
  left: 460px;
  top: 24px;
  height: 64px;
  min-width: 240px;
  line-height: 64px;
  padding: 0px;
  font-size: 48px;
  z-index: 3;
  white-space: nowrap;
  box-sizing: border-box;
  font-weight: bold;
  color: #ffffff;
}

.TextBox_main_miniavatarOff .TextBox_ShowName_Background,
.TextBox_main_miniavatarOff .TextBox_showName {
  left: 80px;
}

.TextBox_text {
  width: 100%;
  display: block;
  overflow: hidden;
  box-sizing: border-box;
  color: #ffffff;
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

export function TextBoxBare(props: TextBoxScreenProps) {
  const sdk = getUiSdk();
  const { rootProps } = sdk.useScreenParts('textbox', TEXTBOX_BARE_PARTS, TEXTBOX_BARE_DEFAULT_CSS);
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

export const TEXTBOX_BARE_VARIANT: BuiltInScreenVariant<TextBoxScreenProps> = {
  screen: 'textbox',
  variantId: 'bare',
  name: '无样式基底',
  component: TextBoxBare,
  parts: TEXTBOX_BARE_PARTS,
  defaultCssText: TEXTBOX_BARE_DEFAULT_CSS,
};
