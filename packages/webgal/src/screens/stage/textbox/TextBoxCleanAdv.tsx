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

const TEXTBOX_CLEAN_ADV_PARTS: ScreenPartDefinition[] = [
  { id: 'background', name: '文本框底图', selector: '.TextBox_Background', allowLayoutEdit: true },
  { id: 'main', name: '文本框容器', selector: '.TextBox_main', allowLayoutEdit: true },
  { id: 'miniAvatar', name: '小头像容器', selector: '.TextBox_miniAvatarContainer', allowLayoutEdit: true },
  { id: 'nameBackground', name: '角色名背景', selector: '.TextBox_ShowName_Background', allowLayoutEdit: true },
  { id: 'showName', name: '角色名文本', selector: '.TextBox_showName', allowLayoutEdit: true },
  { id: 'text', name: '对话正文', selector: '.TextBox_text', allowLayoutEdit: false },
];

const TEXTBOX_CLEAN_ADV_DEFAULT_CSS = `
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
  animation: webgalTextBoxShowSoftly 0.55s ease-out forwards;
}

.TextBox_Background {
  position: absolute;
  left: 0px;
  right: 0px;
  bottom: 0px;
  min-height: 400px;
  max-height: 400px;
  z-index: 2;
  border-radius: 0px;
  background: linear-gradient(
    180deg,
    rgba(9, 13, 21, 0) 0%,
    rgba(9, 13, 21, 0.72) 26%,
    rgba(8, 11, 18, 0.92) 100%
  );
  box-sizing: border-box;
}

.TextBox_main {
  position: absolute;
  left: 0px;
  right: 0px;
  bottom: 0px;
  min-height: 400px;
  max-height: 400px;
  z-index: 3;
  border-radius: 0px;
  padding: 120px 260px 56px 520px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  font-weight: 500;
  color: #f8fafc;
  letter-spacing: 0.14em;
  transition: padding-left 0.33s;
}

.TextBox_main.TextBox_main_miniavatarOff {
  padding: 120px 260px 56px 260px;
}

.TextBox_miniAvatarContainer {
  position: absolute;
  left: 96px;
  bottom: 20px;
  width: 360px;
  height: 360px;
  border-radius: 0px;
  overflow: visible;
  pointer-events: none;
}

.TextBox_miniAvatarImg {
  max-height: 100%;
  max-width: 100%;
  position: absolute;
  bottom: 0px;
  filter: drop-shadow(0px 8px 18px rgba(0, 0, 0, 0.55));
}

.TextBox_ShowName_Background {
  position: absolute;
  left: 520px;
  top: 40px;
  height: 62px;
  min-width: 340px;
  line-height: 62px;
  padding: 0px 48px 0px 22px;
  font-size: 46px;
  border-radius: 0px;
  z-index: 2;
  background: linear-gradient(90deg, rgba(125, 211, 252, 0.16) 0%, rgba(125, 211, 252, 0) 100%);
  border: 0px solid transparent;
  border-left: 5px solid #7dd3fc;
  white-space: nowrap;
  box-sizing: border-box;
}

.TextBox_showName {
  position: absolute;
  left: 520px;
  top: 40px;
  height: 62px;
  min-width: 340px;
  line-height: 62px;
  padding: 0px 48px 0px 22px;
  font-size: 46px;
  border-radius: 0px;
  z-index: 3;
  border: 0px solid transparent;
  white-space: nowrap;
  box-sizing: border-box;
  color: #f8fafc;
  letter-spacing: 0.12em;
  text-shadow: 0px 2px 10px rgba(0, 0, 0, 0.78);
}

.TextBox_main_miniavatarOff .TextBox_ShowName_Background,
.TextBox_main_miniavatarOff .TextBox_showName {
  left: 260px;
}

.TextBox_text {
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding-left: 0.1em;
  box-sizing: border-box;
  color: #f1f5f9;
  text-shadow: 0px 2px 8px rgba(0, 0, 0, 0.85);
}

.TextBox_text.TextBox_text_read {
  color: #94a3b8;
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

export function TextBoxCleanAdv(props: TextBoxScreenProps) {
  const sdk = getUiSdk();
  const { rootProps } = sdk.useScreenParts('textbox', TEXTBOX_CLEAN_ADV_PARTS, TEXTBOX_CLEAN_ADV_DEFAULT_CSS);
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

export const TEXTBOX_CLEAN_ADV_VARIANT: BuiltInScreenVariant<TextBoxScreenProps> = {
  screen: 'textbox',
  variantId: 'clean-adv',
  name: '极简底栏',
  component: TextBoxCleanAdv,
  parts: TEXTBOX_CLEAN_ADV_PARTS,
  defaultCssText: TEXTBOX_CLEAN_ADV_DEFAULT_CSS,
};
