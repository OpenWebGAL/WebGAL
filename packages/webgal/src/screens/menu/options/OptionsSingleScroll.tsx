import { useMemo, useRef, useState } from 'react';
import { Info, Left } from '@icon-park/react';
import type { BuiltInScreenVariant, OptionsScreenProps, ScreenPartDefinition } from '@/screens/contracts';
import { renderRichText, resolveScreenAssetUrl, useScreenParts } from '@/sdk/globalUiSdk';

const OPTIONS_SCROLL_PARTS: ScreenPartDefinition[] = [
  { id: 'backdrop', name: '页面背景', selector: '.Options_Scroll_backdrop', kind: 'container', allowLayoutEdit: false },
  { id: 'main', name: '选项页面容器', selector: '.Options_Scroll_main', kind: 'container', allowLayoutEdit: true },
  { id: 'header', name: '顶部标题栏', selector: '.Options_Scroll_header', kind: 'container', allowLayoutEdit: true },
  { id: 'titleText', name: '标题文本', selector: '.Options_Scroll_titleText', kind: 'text', allowLayoutEdit: true },
  {
    id: 'versionPill',
    name: '版本信息按钮',
    selector: '.Options_Scroll_versionPill',
    kind: 'container',
    allowLayoutEdit: false,
  },
  {
    id: 'versionText',
    name: '版本信息文字',
    selector: '.Options_Scroll_versionText',
    kind: 'text',
    stateHostSelector: '.Options_Scroll_versionPill',
    allowLayoutEdit: false,
  },
  {
    id: 'content',
    name: '单页滚动内容区',
    selector: '.Options_Scroll_content',
    kind: 'container',
    allowLayoutEdit: true,
  },
  { id: 'section', name: '分组卡片', selector: '.Options_Scroll_section', kind: 'container', allowLayoutEdit: false },
  {
    id: 'sectionHeading',
    name: '分组大标题',
    selector: '.Options_Scroll_sectionHeading',
    kind: 'text',
    allowLayoutEdit: false,
  },
  { id: 'optionLabel', name: '选项标签文字', selector: '.Options_Scroll_label', kind: 'text', allowLayoutEdit: false },
  {
    id: 'optionButton',
    name: '选项按钮',
    selector: '.Options_Scroll_button',
    kind: 'container',
    allowLayoutEdit: false,
  },
  {
    id: 'optionButtonText',
    name: '选项按钮文字',
    selector: '.Options_Scroll_button_text',
    kind: 'text',
    stateHostSelector: '.Options_Scroll_button',
    allowLayoutEdit: false,
  },
  {
    id: 'textPreview',
    name: '文本预览框',
    selector: '.Options_Scroll_preview',
    kind: 'container',
    allowLayoutEdit: true,
  },
];

const OPTIONS_SCROLL_DEFAULT_CSS = `
@keyframes Options_Scroll_TextReveal {
  0% { opacity: 0; }
  100% { opacity: 1; }
}

.Options_Scroll_backdrop {
  position: absolute;
  left: 0px;
  top: 0px;
  width: 2560px;
  height: 1440px;
  z-index: 15;
  padding-bottom: 144px; /* 底部 144px 预留给 MenuPanel 浮层 */
  box-sizing: border-box;
  background-image: linear-gradient(to top, #accbee 0%, #e7f0fd 100%);
  backdrop-filter: blur(50px);
}

.Options_Scroll_main {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  cursor: default;
}

.Options_Scroll_header {
  height: 160px;
  padding: 0px 128px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  box-sizing: border-box;
}

.Options_Scroll_titleText {
  font-family: "思源宋体", serif;
  letter-spacing: 0.1em;
  font-size: 92px;
  font-weight: bold;
  color: transparent;
  background: linear-gradient(to left, #227D51, rgba(81, 110, 65, 1));
  -webkit-background-clip: text;
  background-clip: text;
}

.Options_Scroll_versionPill {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 10px 24px;
  border-radius: 999px;
  border: 1px solid rgba(81, 110, 65, 0.18);
  background: rgba(255, 255, 255, 0.56);
  font-family: inherit;
  line-height: 1;
  cursor: pointer;
  transition: background-color 0.2s, border-color 0.2s;
}

.Options_Scroll_versionPill:hover {
  background: rgba(255, 255, 255, 0.85);
  border-color: rgba(81, 110, 65, 0.45);
}

.Options_Scroll_versionPill.active {
  background: rgba(255, 255, 255, 0.85);
  border-color: rgba(81, 110, 65, 0.45);
}

.Options_Scroll_versionIcon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 0;
  flex-shrink: 0;
}

.Options_Scroll_versionIcon > span {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 0;
}

.Options_Scroll_versionText {
  color: rgba(81, 110, 65, 0.92);
  font-size: 28px;
  line-height: 1;
}

.Options_Scroll_content {
  flex: 1;
  min-height: 0px;
  padding: 16px 128px 40px 128px;
  overflow-y: auto;
  scrollbar-gutter: stable;
  display: flex;
  flex-direction: column;
  gap: 32px;
  box-sizing: border-box;
}

.Options_Scroll_section {
  background: rgba(255, 255, 255, 0.65);
  border: 1px solid rgba(255, 255, 255, 0.78);
  border-radius: 6px;
  padding: 32px 44px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 28px 48px;
  align-items: start;
  box-shadow: 0px 8px 24px rgba(34, 75, 55, 0.06);
}

.Options_Scroll_sectionHeading {
  grid-column: 1 / -1;
  font-family: "思源宋体", serif;
  font-size: 52px;
  font-weight: bold;
  color: transparent;
  background: linear-gradient(to left, #227D51, rgba(81, 110, 65, 1));
  -webkit-background-clip: text;
  background-clip: text;
  padding-bottom: 12px;
  border-bottom: 2px solid rgba(81, 110, 65, 0.2);
}

.Options_Scroll_item {
  min-width: 0px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.Options_Scroll_item.Options_Scroll_item_full {
  grid-column: 1 / -1;
  width: 100%;
}

.Options_Scroll_about {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
}

.Options_Scroll_aboutBack {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  line-height: 0;
  width: 56px;
  height: 56px;
  background: rgba(0, 0, 0, 0.08);
  border-radius: 6px;
  border: none;
  cursor: pointer;
  margin-bottom: 8px;
  transition: background-color 0.2s;
}

.Options_Scroll_aboutBack > span {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 0;
}

.Options_Scroll_aboutBack:hover {
  background: rgba(0, 0, 0, 0.16);
}

.Options_Scroll_aboutHeading {
  color: transparent;
  background: linear-gradient(to left, #227D51, rgba(81, 110, 65, 1));
  -webkit-background-clip: text;
  background-clip: text;
  font-size: 44px;
  font-weight: bold;
  margin-top: 12px;
}

.Options_Scroll_aboutText {
  color: rgba(81, 110, 65, 1);
  font-size: 34px;
  padding-left: 4px;
}

.Options_Scroll_aboutText a {
  color: rgba(81, 110, 65, 1);
}

.Options_Scroll_label {
  font-size: 38px;
  font-weight: bold;
  color: rgba(81, 110, 65, 0.95);
}

.Options_Scroll_row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 14px;
}

.Options_Scroll_button {
  padding: 8px 34px;
  background-color: rgba(50, 50, 50, 0.05);
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  transition: all 0.2s ease;
}

.Options_Scroll_button:hover {
  background-color: rgba(81, 110, 65, 0.15);
  border-bottom-color: rgba(81, 110, 65, 0.9);
}

.Options_Scroll_button.active {
  background-color: rgba(81, 110, 65, 0.15);
  border-bottom-color: rgba(81, 110, 65, 0.9);
}

.Options_Scroll_button_text {
  font-size: 34px;
  color: rgba(120, 134, 122, 1);
  transition: color 0.2s ease;
}

.Options_Scroll_button:hover .Options_Scroll_button_text {
  color: rgba(81, 110, 65, 0.95);
  font-weight: bold;
}

.Options_Scroll_button.active .Options_Scroll_button_text {
  color: rgba(81, 110, 65, 0.95);
  font-weight: bold;
}

.Options_Scroll_rangeWrap {
  display: flex;
  align-items: center;
  gap: 20px;
}

.Options_Scroll_rangeWrap input[type='range'] {
  -webkit-appearance: none;
  appearance: none;
  width: 460px;
  height: 44px;
  background: transparent;
  cursor: pointer;
}

.Options_Scroll_rangeWrap input[type='range']::-webkit-slider-runnable-track {
  width: 100%;
  height: 10px;
  border-radius: 51.2px;
  background: rgba(81, 110, 65, 0.9);
  box-shadow: 1px 1px 7px rgba(0, 0, 0, 0.3);
}

.Options_Scroll_rangeWrap input[type='range']::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  height: 36px;
  width: 36px;
  border-radius: 999px;
  background: #ffffff;
  border: none;
  margin-top: -13px;
  box-shadow: 0px 0px 5px rgba(0, 0, 0, 0.5);
}

.Options_Scroll_rangeVal {
  min-width: 72px;
  font-size: 30px;
  font-weight: bold;
  color: rgba(81, 110, 65, 0.92);
}

.Options_Scroll_preview {
  padding: 25.6px;
  min-height: 480px;
  width: 100%;
  border-radius: 4px;
  box-sizing: border-box;
  position: relative;
  cursor: pointer;
  overflow: hidden;
}

.Options_Scroll_previewTextbox {
  position: static;
  width: 100%;
  min-height: 428.8px;
}

.Options_Scroll_previewBg {
  position: absolute;
  left: 0px;
  right: -2px;
  bottom: -2px;
  min-height: 430px;
  max-height: 430px;
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
    linear-gradient(to bottom, rgba(0, 0, 0, 0.04) 0px, rgba(0, 0, 0, 0.28) 10%, #000 75%),
    linear-gradient(to right, rgba(0, 0, 0, 0.08) 0px, rgba(0, 0, 0, 0.28) 10%, #000 42%);
  -webkit-mask-composite: source-in;
  mask-image:
    linear-gradient(to bottom, rgba(0, 0, 0, 0.04) 0px, rgba(0, 0, 0, 0.28) 10%, #000 75%),
    linear-gradient(to right, rgba(0, 0, 0, 0.08) 0px, rgba(0, 0, 0, 0.28) 10%, #000 42%);
  mask-composite: intersect;
}

.Options_Scroll_previewBox {
  position: absolute;
  left: 0px;
  right: -2px;
  bottom: -2px;
  min-height: 430px;
  max-height: 430px;
  border-radius: 0px;
  padding: 125.6px 50px 48px 360px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  letter-spacing: 0.2em;
}

.Options_Scroll_previewNameBar {
  position: absolute;
  left: 360px;
  top: 26px;
  min-width: 50%;
  height: 90px;
  border: 0px;
  border-bottom: 3px solid transparent;
  border-image: linear-gradient(
      to right,
      rgba(255, 255, 255, 0.2) 0%,
      rgba(255, 255, 255, 0.95) 5%,
      rgba(255, 255, 255, 0) 50%,
      rgba(255, 255, 255, 0) 100%
    )
    1;
  box-sizing: border-box;
}

.Options_Scroll_previewName {
  position: absolute;
  left: 360px;
  top: 26px;
  min-width: 50%;
  height: 90px;
  line-height: 68px;
  padding: 0px 51.2px 10px 0px;
  font-size: 51.2px;
  font-weight: bold;
  white-space: nowrap;
  box-sizing: border-box;
  color: #f8f8f8;
  paint-order: stroke fill;
  -webkit-text-stroke: 0.12em #2e2312;
  text-shadow:
    0.05em 0.05em 0.02em rgba(0, 0, 0, 0.85),
    0.05em 0.05em 0.03em rgba(0, 0, 0, 0.5);
}

.Options_Scroll_previewText {
  width: 100%;
  overflow: hidden;
  padding-left: 0.1em;
  font-weight: bold;
  color: #f8f8f8;
  paint-order: stroke fill;
  -webkit-text-stroke: 0.12em #2e2312;
  text-shadow:
    0.05em 0.05em 0.02em rgba(0, 0, 0, 0.85),
    0.05em 0.05em 0.03em rgba(0, 0, 0, 0.5);
}

.Options_Scroll_char {
  opacity: 0;
  animation-name: Options_Scroll_TextReveal;
  animation-timing-function: ease-out;
  animation-fill-mode: forwards;
}
`.trim();

function getPreviewFontSizePx(sizeIndex: number): number {
  if (sizeIndex === 0) return 25.6 * 1.55;
  if (sizeIndex === 2) return 25.6 * 2.3;
  return 25.6 * 2.05;
}

export function OptionsSingleScrollScreen(props: OptionsScreenProps) {
  const {
    visible,
    optionData,
    fontOptions,
    languageOptions,
    isFullscreenSupported,
    isFullscreen,
    previewBgUrl,
    version,
    t,
    playSe,
    onChangeOption,
    onChangeLanguage,
    onToggleFullscreen,
    onResetSaves,
    onResetOptions,
    onResetAll,
    onExportSaves,
    onImportSaves,
    textboxPreviewNode,
  } = props;

  const { rootProps } = useScreenParts('options', OPTIONS_SCROLL_PARTS, OPTIONS_SCROLL_DEFAULT_CSS);
  const [previewKey, setPreviewKey] = useState(0);
  const [showAbout, setShowAbout] = useState(false);
  const importInputRef = useRef<HTMLInputElement>(null);

  const fontLabels = useMemo(
    () =>
      fontOptions.map((option) => {
        if (option.labelKey) return t(`menu.options.pages.display.options.${option.labelKey}`);
        if (option.label) return option.label;
        return option.family;
      }),
    [fontOptions, t],
  );
  const currentFontIndex = fontOptions.length
    ? Math.min(Math.max(0, optionData.textboxFont), fontOptions.length - 1)
    : 0;
  const activeFontFamily = fontOptions[currentFontIndex]?.family ?? "'思源宋体', serif";

  if (!visible) return null;

  return (
    <div {...rootProps} className={`${rootProps.className} Options_Scroll_backdrop`}>
      <input
        ref={importInputRef}
        type="file"
        accept=".json"
        style={{ display: 'none' }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onImportSaves(file);
          e.target.value = '';
        }}
      />
      <div className="Options_Scroll_main">
        <div className="Options_Scroll_header">
          <div className="Options_Scroll_titleText">{t('menu.options.title')}</div>
          <button
            type="button"
            className={`Options_Scroll_versionPill${showAbout ? ' active' : ''}`}
            aria-label={t('menu.options.pages.system.options.about.title')}
            onMouseEnter={playSe.enter}
            onClick={() => {
              playSe.switch();
              setShowAbout((prev) => !prev);
            }}
          >
            <span className="Options_Scroll_versionIcon">
              <Info theme="outline" size={28} fill="rgba(81, 110, 65, 0.9)" />
            </span>
            <span className="Options_Scroll_versionText">{version}</span>
          </button>
        </div>

        <div className="Options_Scroll_content">
          {showAbout ? (
            <div className="Options_Scroll_section">
              <div className="Options_Scroll_about">
                <button
                  type="button"
                  className="Options_Scroll_aboutBack"
                  onMouseEnter={playSe.enter}
                  onClick={() => {
                    playSe.switch();
                    setShowAbout(false);
                  }}
                >
                  <Left theme="outline" size={35} strokeWidth={3} fill="#333" />
                </button>
                <div className="Options_Scroll_aboutHeading">
                  {t('menu.options.pages.system.options.about.subTitle')}
                </div>
                <div className="Options_Scroll_aboutHeading">
                  {t('menu.options.pages.system.options.about.version')}
                </div>
                <div className="Options_Scroll_aboutText">{version}</div>
                <div className="Options_Scroll_aboutHeading">{t('menu.options.pages.system.options.about.source')}</div>
                <div className="Options_Scroll_aboutText">
                  <a target="_blank" href="https://github.com/OpenWebGAL/WebGAL" rel="noreferrer">
                    https://github.com/OpenWebGAL/WebGAL
                  </a>
                </div>
                <div className="Options_Scroll_aboutHeading">
                  {t('menu.options.pages.system.options.about.contributors')}
                </div>
                <div className="Options_Scroll_aboutText">
                  <a target="_blank" href="https://github.com/OpenWebGAL/WebGAL/graphs/contributors" rel="noreferrer">
                    https://github.com/OpenWebGAL/WebGAL/graphs/contributors
                  </a>
                </div>
                <div className="Options_Scroll_aboutHeading">
                  {t('menu.options.pages.system.options.about.website')}
                </div>
                <div className="Options_Scroll_aboutText">
                  <a target="_blank" href="https://openwebgal.com/" rel="noreferrer">
                    https://openwebgal.com/
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="Options_Scroll_section">
                <div className="Options_Scroll_sectionHeading">{t('menu.options.pages.system.title')}</div>

                <div className="Options_Scroll_item">
                  <div className="Options_Scroll_label">{t('menu.options.pages.system.options.autoSpeed.title')}</div>
                  <div className="Options_Scroll_row">
                    {(
                      [
                        [0, t('menu.options.pages.system.options.autoSpeed.options.slow')],
                        [1, t('menu.options.pages.system.options.autoSpeed.options.medium')],
                        [2, t('menu.options.pages.system.options.autoSpeed.options.fast')],
                      ] as const
                    ).map(([val, label]) => (
                      <button
                        key={val}
                        type="button"
                        className={`Options_Scroll_button${optionData.autoSpeed === val ? ' active' : ''}`}
                        onMouseEnter={playSe.enter}
                        onClick={() => {
                          playSe.switch();
                          onChangeOption('autoSpeed', val);
                        }}
                      >
                        <span className="Options_Scroll_button_text">{label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="Options_Scroll_item">
                  <div className="Options_Scroll_label">{t('menu.options.pages.system.options.skipAll.title')}</div>
                  <div className="Options_Scroll_row">
                    <button
                      type="button"
                      className={`Options_Scroll_button${!optionData.skipAll ? ' active' : ''}`}
                      onMouseEnter={playSe.enter}
                      onClick={() => {
                        playSe.switch();
                        onChangeOption('skipAll', false);
                      }}
                    >
                      <span className="Options_Scroll_button_text">
                        {t('menu.options.pages.system.options.skipAll.options.read')}
                      </span>
                    </button>
                    <button
                      type="button"
                      className={`Options_Scroll_button${optionData.skipAll ? ' active' : ''}`}
                      onMouseEnter={playSe.enter}
                      onClick={() => {
                        playSe.switch();
                        onChangeOption('skipAll', true);
                      }}
                    >
                      <span className="Options_Scroll_button_text">
                        {t('menu.options.pages.system.options.skipAll.options.all')}
                      </span>
                    </button>
                  </div>
                </div>

                <div className="Options_Scroll_item">
                  <div className="Options_Scroll_label">{t('menu.options.pages.system.options.gameSave.title')}</div>
                  <div className="Options_Scroll_row">
                    <button
                      type="button"
                      className="Options_Scroll_button"
                      onMouseEnter={playSe.enter}
                      onClick={onExportSaves}
                    >
                      <span className="Options_Scroll_button_text">
                        {t('menu.options.pages.system.options.gameSave.options.export')}
                      </span>
                    </button>
                    <button
                      type="button"
                      className="Options_Scroll_button"
                      onMouseEnter={playSe.enter}
                      onClick={() => importInputRef.current?.click()}
                    >
                      <span className="Options_Scroll_button_text">
                        {t('menu.options.pages.system.options.gameSave.options.import')}
                      </span>
                    </button>
                  </div>
                </div>

                <div className="Options_Scroll_item">
                  <div className="Options_Scroll_label">{t('menu.options.pages.system.options.resetData.title')}</div>
                  <div className="Options_Scroll_row">
                    <button
                      type="button"
                      className="Options_Scroll_button"
                      onMouseEnter={playSe.enter}
                      onClick={onResetSaves}
                    >
                      <span className="Options_Scroll_button_text">
                        {t('menu.options.pages.system.options.resetData.options.clearGameSave')}
                      </span>
                    </button>
                    <button
                      type="button"
                      className="Options_Scroll_button"
                      onMouseEnter={playSe.enter}
                      onClick={onResetOptions}
                    >
                      <span className="Options_Scroll_button_text">
                        {t('menu.options.pages.system.options.resetData.options.resetSettings')}
                      </span>
                    </button>
                    <button
                      type="button"
                      className="Options_Scroll_button"
                      onMouseEnter={playSe.enter}
                      onClick={onResetAll}
                    >
                      <span className="Options_Scroll_button_text">
                        {t('menu.options.pages.system.options.resetData.options.clearAll')}
                      </span>
                    </button>
                  </div>
                </div>

                <div className="Options_Scroll_item Options_Scroll_item_full">
                  <div className="Options_Scroll_label">{t('menu.options.pages.system.options.language.title')}</div>
                  <div className="Options_Scroll_row">
                    {languageOptions.map((item) => (
                      <button
                        key={item.value}
                        type="button"
                        className={`Options_Scroll_button${optionData.language === item.value ? ' active' : ''}`}
                        onMouseEnter={playSe.enter}
                        onClick={() => {
                          playSe.switch();
                          onChangeLanguage(item.value);
                        }}
                      >
                        <span className="Options_Scroll_button_text">{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="Options_Scroll_section">
                <div className="Options_Scroll_sectionHeading">{t('menu.options.pages.display.title')}</div>

                {isFullscreenSupported && (
                  <div className="Options_Scroll_item">
                    <div className="Options_Scroll_label">
                      {t('menu.options.pages.display.options.fullScreen.title')}
                    </div>
                    <div className="Options_Scroll_row">
                      <button
                        type="button"
                        className={`Options_Scroll_button${isFullscreen ? ' active' : ''}`}
                        onMouseEnter={playSe.enter}
                        onClick={() => onToggleFullscreen(true)}
                      >
                        <span className="Options_Scroll_button_text">
                          {t('menu.options.pages.display.options.fullScreen.options.on')}
                        </span>
                      </button>
                      <button
                        type="button"
                        className={`Options_Scroll_button${!isFullscreen ? ' active' : ''}`}
                        onMouseEnter={playSe.enter}
                        onClick={() => onToggleFullscreen(false)}
                      >
                        <span className="Options_Scroll_button_text">
                          {t('menu.options.pages.display.options.fullScreen.options.off')}
                        </span>
                      </button>
                    </div>
                  </div>
                )}

                <div className="Options_Scroll_item">
                  <div className="Options_Scroll_label">{t('menu.options.pages.display.options.textSize.title')}</div>
                  <div className="Options_Scroll_row">
                    {(
                      [
                        [0, t('menu.options.pages.display.options.textSize.options.small')],
                        [1, t('menu.options.pages.display.options.textSize.options.medium')],
                        [2, t('menu.options.pages.display.options.textSize.options.large')],
                      ] as const
                    ).map(([val, label]) => (
                      <button
                        key={val}
                        type="button"
                        className={`Options_Scroll_button${optionData.textSize === val ? ' active' : ''}`}
                        onMouseEnter={playSe.enter}
                        onClick={() => {
                          playSe.switch();
                          onChangeOption('textSize', val);
                        }}
                      >
                        <span className="Options_Scroll_button_text">{label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="Options_Scroll_item Options_Scroll_item_full">
                  <div className="Options_Scroll_label">{t('menu.options.pages.display.options.textFont.title')}</div>
                  <div className="Options_Scroll_row">
                    {fontLabels.map((label, index) => (
                      <button
                        key={`${label}-${index}`}
                        type="button"
                        className={`Options_Scroll_button${currentFontIndex === index ? ' active' : ''}`}
                        onMouseEnter={playSe.enter}
                        onClick={() => {
                          playSe.switch();
                          onChangeOption('textboxFont', index);
                        }}
                      >
                        <span className="Options_Scroll_button_text">{label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="Options_Scroll_item">
                  <div className="Options_Scroll_label">{t('menu.options.pages.display.options.textSpeed.title')}</div>
                  <div className="Options_Scroll_rangeWrap">
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={optionData.textSpeed}
                      onMouseEnter={playSe.enter}
                      onChange={(e) => onChangeOption('textSpeed', Number(e.target.value))}
                    />
                    <span className="Options_Scroll_rangeVal">{optionData.textSpeed}</span>
                  </div>
                </div>

                <div className="Options_Scroll_item">
                  <div className="Options_Scroll_label">
                    {t('menu.options.pages.display.options.textboxOpacity.title')}
                  </div>
                  <div className="Options_Scroll_rangeWrap">
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={optionData.textboxOpacity}
                      onMouseEnter={playSe.enter}
                      onChange={(e) => onChangeOption('textboxOpacity', Number(e.target.value))}
                    />
                    <span className="Options_Scroll_rangeVal">{optionData.textboxOpacity}%</span>
                  </div>
                </div>

                <div className="Options_Scroll_item Options_Scroll_item_full">
                  <div className="Options_Scroll_label">
                    {t('menu.options.pages.display.options.textPreview.title')}
                  </div>
                  <div
                    className="Options_Scroll_preview"
                    style={{
                      background: previewBgUrl
                        ? `bottom / cover no-repeat url('${resolveScreenAssetUrl(previewBgUrl)}')`
                        : 'rgba(0, 0, 0, 0.1)',
                    }}
                    onClick={() => setPreviewKey((k) => k + 1)}
                  >
                    {textboxPreviewNode ?? (
                      <div key={`${previewKey}-${optionData.textSpeed}`} className="Options_Scroll_previewTextbox">
                        <div
                          className="Options_Scroll_previewBg"
                          style={{ opacity: optionData.textboxOpacity / 100 }}
                        />
                        <div className="Options_Scroll_previewBox" style={{ fontFamily: activeFontFamily }}>
                          <div
                            className="Options_Scroll_previewNameBar"
                            style={{ opacity: optionData.textboxOpacity / 100 }}
                          />
                          <div className="Options_Scroll_previewName">
                            {t('menu.options.pages.display.options.textPreview.title')}
                          </div>
                          <div
                            className="Options_Scroll_previewText"
                            style={{
                              fontSize: `${getPreviewFontSizePx(optionData.textSize)}px`,
                              lineHeight: optionData.textSize === 1 ? '2.2em' : '2em',
                            }}
                          >
                            {renderRichText(t('menu.options.pages.display.options.textPreview.text'), {
                              replaceSpaceWithNbsp: true,
                              isSettled: false,
                              charDelayMs: 3 + (100 - optionData.textSpeed) * 1.5,
                              charDurationMs: 200 + (100 - optionData.textSpeed) * 15,
                              animateClassName: 'Options_Scroll_char',
                              dialogKey: `preview-${previewKey}-${optionData.textSpeed}`,
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="Options_Scroll_section">
                <div className="Options_Scroll_sectionHeading">{t('menu.options.pages.sound.title')}</div>

                {(
                  [
                    ['volumeMain', 'menu.options.pages.sound.options.volumeMain.title'],
                    ['vocalVolume', 'menu.options.pages.sound.options.vocalVolume.title'],
                    ['bgmVolume', 'menu.options.pages.sound.options.bgmVolume.title'],
                    ['seVolume', 'menu.options.pages.sound.options.seVolume.title'],
                    ['uiSeVolume', 'menu.options.pages.sound.options.uiSeVolume.title'],
                  ] as const
                ).map(([key, titleKey]) => (
                  <div className="Options_Scroll_item" key={key}>
                    <div className="Options_Scroll_label">{t(titleKey)}</div>
                    <div className="Options_Scroll_rangeWrap">
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={optionData[key]}
                        onMouseEnter={playSe.enter}
                        onChange={(e) => onChangeOption(key, Number(e.target.value))}
                      />
                      <span className="Options_Scroll_rangeVal">{optionData[key]}</span>
                    </div>
                  </div>
                ))}

                <div className="Options_Scroll_item">
                  <div className="Options_Scroll_label">{t('menu.options.pages.sound.options.voiceOption.title')}</div>
                  <div className="Options_Scroll_row">
                    <button
                      type="button"
                      className={`Options_Scroll_button${optionData.voiceInterruption === 0 ? ' active' : ''}`}
                      onMouseEnter={playSe.enter}
                      onClick={() => onChangeOption('voiceInterruption', 0)}
                    >
                      <span className="Options_Scroll_button_text">
                        {t('menu.options.pages.sound.options.voiceStop.title')}
                      </span>
                    </button>
                    <button
                      type="button"
                      className={`Options_Scroll_button${optionData.voiceInterruption === 1 ? ' active' : ''}`}
                      onMouseEnter={playSe.enter}
                      onClick={() => onChangeOption('voiceInterruption', 1)}
                    >
                      <span className="Options_Scroll_button_text">
                        {t('menu.options.pages.sound.options.voiceContinue.title')}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export const OPTIONS_SINGLE_SCROLL_VARIANT: BuiltInScreenVariant<OptionsScreenProps> = {
  screen: 'options',
  variantId: 'single-scroll',
  name: '单页分组滚动',
  component: OptionsSingleScrollScreen,
  parts: OPTIONS_SCROLL_PARTS,
  defaultCssText: OPTIONS_SCROLL_DEFAULT_CSS,
};
