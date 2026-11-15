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

const TEXTBOX_NVL_PARTS: ScreenPartDefinition[] = [
  { id: 'background', name: '文本框底图', selector: '.TextBox_Background', allowLayoutEdit: true },
  { id: 'main', name: '文本框容器', selector: '.TextBox_main', allowLayoutEdit: true },
  { id: 'miniAvatar', name: '小头像容器', selector: '.TextBox_miniAvatarContainer', allowLayoutEdit: true },
  { id: 'nameBackground', name: '角色名背景', selector: '.TextBox_ShowName_Background', allowLayoutEdit: true },
  { id: 'showName', name: '角色名文本', selector: '.TextBox_showName', allowLayoutEdit: true },
  { id: 'text', name: '对话正文', selector: '.TextBox_text', allowLayoutEdit: false },
];

const TEXTBOX_NVL_DEFAULT_CSS = `
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
  animation: webgalTextBoxShowSoftly 0.6s ease-out forwards;
}

.TextBox_Background {
  position: absolute;
  left: 0px;
  top: 0px;
  right: 0px;
  bottom: 0px;
  width: 2560px;
  height: 1440px;
  z-index: 2;
  border-radius: 0px;
  background: rgba(11, 15, 23, 0.76);
  backdrop-filter: blur(12px);
  box-sizing: border-box;
}

.TextBox_main {
  position: absolute;
  left: 0px;
  top: 0px;
  right: 0px;
  bottom: 0px;
  width: 2560px;
  height: 1440px;
  z-index: 3;
  border-radius: 0px;
  padding: 260px 440px 180px 440px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  font-weight: normal;
  color: #f8fafc;
  letter-spacing: 0.12em;
}

.TextBox_main.TextBox_main_miniavatarOff {
  padding: 260px 440px 180px 440px;
}

.TextBox_miniAvatarContainer {
  position: absolute;
  left: 72px;
  bottom: 96px;
  width: 300px;
  height: 300px;
  border-radius: 16px;
  overflow: hidden;
  pointer-events: none;
}

.TextBox_miniAvatarImg {
  max-height: 100%;
  max-width: 100%;
  position: absolute;
  bottom: 0px;
  filter: drop-shadow(0px 6px 16px rgba(0, 0, 0, 0.55));
}

.TextBox_ShowName_Background {
  position: absolute;
  left: 440px;
  top: 152px;
  height: 76px;
  min-width: 480px;
  line-height: 68px;
  padding: 0px 40px 8px 0px;
  font-size: 48px;
  border-radius: 0px;
  z-index: 2;
  background: transparent;
  border: 0px solid transparent;
  border-bottom: 2px solid rgba(226, 232, 240, 0.35);
  white-space: nowrap;
  box-sizing: border-box;
}

.TextBox_showName {
  position: absolute;
  left: 440px;
  top: 152px;
  height: 76px;
  min-width: 480px;
  line-height: 68px;
  padding: 0px 40px 8px 0px;
  font-size: 48px;
  border-radius: 0px;
  z-index: 3;
  border: 0px solid transparent;
  white-space: nowrap;
  box-sizing: border-box;
  color: #e2e8f0;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-shadow: 0px 2px 10px rgba(0, 0, 0, 0.65);
}

.TextBox_text {
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding-left: 0.1em;
  box-sizing: border-box;
  color: #f8fafc;
  text-shadow: 0px 2px 10px rgba(0, 0, 0, 0.65);
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

export function TextBoxImmersiveNvl(props: TextBoxScreenProps) {
  const sdk = getUiSdk();
  const { rootProps } = sdk.useScreenParts('textbox', TEXTBOX_NVL_PARTS, TEXTBOX_NVL_DEFAULT_CSS);
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

export const TEXTBOX_IMMERSIVE_NVL_VARIANT: BuiltInScreenVariant<TextBoxScreenProps> = {
  screen: 'textbox',
  variantId: 'immersive-nvl',
  name: '全屏书卷 (NVL)',
  component: TextBoxImmersiveNvl,
  parts: TEXTBOX_NVL_PARTS,
  defaultCssText: TEXTBOX_NVL_DEFAULT_CSS,
};
