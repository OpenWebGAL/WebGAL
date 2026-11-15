import { useEffect, useMemo, useRef, useState } from 'react';
import { Info, Left } from '@icon-park/react';
import type { BuiltInScreenVariant, OptionsScreenProps, ScreenPartDefinition } from '@/screens/contracts';
import { renderRichText, resolveScreenAssetUrl, useScreenParts } from '@/sdk/globalUiSdk';

type OptionTab = 'system' | 'display' | 'sound';

const OPTIONS_TABBED_PARTS: ScreenPartDefinition[] = [
  { id: 'main', name: '选项页面容器', selector: '.Options_main', allowLayoutEdit: true },
  { id: 'header', name: '顶部标题栏', selector: '.Options_main_header', allowLayoutEdit: true },
  { id: 'titleText', name: '标题文本', selector: '.Option_title_text', allowLayoutEdit: true },
  { id: 'tabs', name: '左侧分类栏', selector: '.Options_button_list', allowLayoutEdit: true },
  { id: 'tabButton', name: '分类按钮', selector: '.Options_page_button', allowLayoutEdit: false },
  { id: 'content', name: '右侧内容区', selector: '.Options_main_content', allowLayoutEdit: true },
  { id: 'optionGroup', name: '选项分组', selector: '.NormalOption', allowLayoutEdit: false },
  { id: 'optionButton', name: '选项按钮', selector: '.NormalButton', allowLayoutEdit: false },
  { id: 'textPreview', name: '文本预览框', selector: '.Options_textPreview', allowLayoutEdit: true },
];

const OPTIONS_TABBED_DEFAULT_CSS = `
@keyframes Options_Elements_in {
  0% {
    opacity: 0;
    transform: scale(1.03, 1.03) translate(-25px, -20px);
  }
  100% {
    opacity: 1;
    transform: scale(1, 1) translate(0px, 0px);
  }
}

@keyframes Options_TextReveal {
  0% { opacity: 0; }
  100% { opacity: 1; }
}

@keyframes Options_bubbleFadeIn {
  0% {
    opacity: 0;
    transform: translateX(-50%) translateY(4px);
  }
  100% {
    opacity: 1;
    transform: translateX(-50%) translateY(0px);
  }
}

.Options_backdrop {
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

.Options_main {
  position: relative;
  width: 100%;
  height: 100%;
  cursor: default;
}

.Options_main_header {
  height: 194.4px;
  width: 100%;
  display: flex;
  align-items: flex-start;
}

.Options_title {
  font-family: "思源宋体", serif;
  letter-spacing: 0.1em;
  font-size: 57.6px;
  display: flex;
  flex-flow: row;
  align-items: flex-start;
  margin: 28.8px 0px;
  padding: 11.52px 115.2px 11.52px 63.36px;
}

.Option_title_text {
  font-size: 95.04px;
  font-weight: bold;
  color: transparent;
  background: linear-gradient(to left, #227D51, rgba(81, 110, 65, 1));
  -webkit-background-clip: text;
  background-clip: text;
  animation: Options_Elements_in 0.7s ease-out forwards;
}

.Options_page_container {
  height: 1101.6px;
  display: flex;
  padding: 25.6px 96px;
  box-sizing: border-box;
}

.Options_button_list {
  animation: Options_Elements_in 0.7s ease-out forwards;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.Options_page_button {
  font-family: "思源宋体", serif;
  font-size: 76.8px;
  font-weight: bold;
  color: transparent;
  background: linear-gradient(to left, #227D51, rgba(81, 110, 65, 1));
  opacity: 0.35;
  -webkit-background-clip: text;
  background-clip: text;
  transition: color 0.33s, opacity 0.33s;
  cursor: pointer;
  border: none;
  padding: 0px;
  text-align: left;
}

.Options_page_button:hover,
.Options_page_button.Options_page_button_active {
  opacity: 1;
}

.Options_main_content {
  flex: 1;
  padding: 0px 0px 0px 76.8px;
  overflow: auto;
}

.Options_main_content_half {
  width: 95%;
  display: flex;
  flex-flow: row wrap;
  align-items: flex-start;
  align-content: flex-start;
  padding: 0px 25.6px;
  position: relative;
  box-sizing: border-box;
}

.NormalOption {
  margin: 5.12px 25.6px;
  padding: 5.12px;
  display: flex;
  flex-flow: column;
  align-items: flex-start;
  animation: Options_Elements_in 0.7s ease-out forwards;
  transition: transform 0.25s, box-shadow 0.25s;
}

.NormalOption.NormalOption_full {
  width: 100%;
}

.NormalOption_title {
  color: transparent;
  background: linear-gradient(to left, #227D51, rgba(81, 110, 65, 1));
  -webkit-background-clip: text;
  background-clip: text;
  font-size: 51.2px;
  padding: 7.68px 25.6px 7.68px 5.12px;
  font-weight: bold;
}

.NormalOption_content {
  width: 100%;
  display: flex;
  flex-flow: row wrap;
  align-items: center;
}

.NormalButton {
  font-size: 38.4px;
  box-sizing: border-box;
  padding: 7.68px 38.4px;
  background-color: rgba(50, 50, 50, 0.05);
  margin: 0px 15.36px 0px 0px;
  transition: all 0.2s ease;
  color: rgba(160, 170, 160, 1);
  cursor: pointer;
  border: none;
  border-bottom: 2px solid transparent;
}

.NormalButton:hover {
  border-bottom: 2px solid rgba(81, 110, 65, 0.9);
  color: rgba(81, 110, 65, 0.9);
  font-weight: bold;
}

.NormalButton.NormalButtonChecked {
  background-color: rgba(81, 110, 65, 0.15);
  border-bottom: 2px solid rgba(81, 110, 65, 0.9);
  color: rgba(81, 110, 65, 0.9);
  font-weight: bold;
}

.Option_select {
  position: relative;
  max-width: 100%;
  font-size: 38.4px;
}

.Option_select_button,
.Option_select_item {
  box-sizing: border-box;
  border: 0px;
  border-bottom: 2px solid transparent;
  background: rgba(50, 50, 50, 0.05);
  color: rgba(160, 170, 160, 1);
  font: inherit;
  cursor: pointer;
}

.Option_select_button {
  min-width: 384px;
  padding: 7.68px 38.4px;
  text-align: left;
}

.Option_select_button:hover,
.Option_select_button:focus-visible,
.Option_select_button.Option_select_button_active {
  border-bottom-color: rgba(81, 110, 65, 0.9);
  color: rgba(81, 110, 65, 0.9);
  font-weight: bold;
}

.Option_select_menu {
  position: absolute;
  z-index: 3;
  top: 100%;
  left: 0px;
  display: grid;
  min-width: 100%;
  padding: 9.6px;
  background: rgb(235, 243, 250);
  box-shadow: 0px 7.68px 30.72px rgba(34, 75, 55, 0.2);
}

.Option_select_item {
  padding: 13.44px 28.8px;
  background: rgb(235, 243, 250);
  text-align: left;
  white-space: nowrap;
}

.Option_select_item:hover,
.Option_select_item:focus-visible,
.Option_select_item.Option_select_item_active {
  background: rgba(81, 110, 65, 0.15);
  border-bottom-color: rgba(81, 110, 65, 0.9);
  color: rgba(81, 110, 65, 0.9);
  font-weight: bold;
}

.Option_WebGAL_slider {
  position: relative;
  display: flex;
  align-items: center;
  width: 500px;
  height: 50px;
  background: transparent;
}

.Option_WebGAL_slider input[type='range'] {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 50px;
  background: transparent;
  cursor: pointer;
}

.Option_WebGAL_slider input[type='range']:focus {
  outline: none;
}

.Option_WebGAL_slider input[type='range']::-webkit-slider-runnable-track {
  width: 100%;
  height: 10px;
  border-radius: 51.2px;
  background: rgba(81, 110, 65, 0.9);
  box-shadow: 1px 1px 7px rgba(0, 0, 0, 0.3);
}

.Option_WebGAL_slider input[type='range']::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  height: 36px;
  width: 36px;
  border-radius: 999px;
  background: #ffffff;
  border: none;
  margin-top: -14px;
  box-shadow: 0px 0px 5px rgba(0, 0, 0, 0.5);
  cursor: pointer;
}

.Option_WebGAL_slider input[type='range']::-moz-range-track {
  width: 100%;
  height: 10px;
  border-radius: 51.2px;
  background: rgba(81, 110, 65, 0.9);
  box-shadow: 1px 1px 7px rgba(0, 0, 0, 0.3);
}

.Option_WebGAL_slider input[type='range']::-moz-range-thumb {
  height: 36px;
  width: 36px;
  border-radius: 999px;
  background: #ffffff;
  border: none;
  box-shadow: 0px 0px 5px rgba(0, 0, 0, 0.5);
  cursor: pointer;
}

.Option_WebGAL_bubble {
  position: absolute;
  bottom: calc(100% + 10px);
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.85);
  color: #ffffff;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 25.6px;
  font-weight: bold;
  white-space: nowrap;
  pointer-events: none;
  opacity: 0;
  animation: Options_bubbleFadeIn 0.2s ease-out forwards;
}

.Option_WebGAL_bubble::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border-width: 6px;
  border-style: solid;
  border-color: rgba(0, 0, 0, 0.85) transparent transparent transparent;
}

.About_title_text {
  position: absolute;
  right: 10px;
  top: 10px;
  margin: 5.12px 25.6px;
  padding: 5.12px;
  cursor: pointer;
  border-radius: 4px;
  border: none;
  background: transparent;
  animation: Options_Elements_in 0.7s ease-out forwards;
}

.About_title_text:hover {
  background: rgba(0, 0, 0, 0.05);
}

.Options_about {
  padding: 10px 0px 0px 0px;
  width: 100%;
}

.Options_about_back {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 50px;
  height: 50px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  border: none;
  cursor: pointer;
}

.Options_about_back:hover {
  background: rgba(0, 0, 0, 0.2);
}

.Options_about_title {
  color: transparent;
  background: linear-gradient(to left, #227D51, rgba(81, 110, 65, 1));
  -webkit-background-clip: text;
  background-clip: text;
  font-size: 51.2px;
  padding: 7.68px 25.6px 7.68px 5.12px;
  font-weight: bold;
  margin-top: 20px;
}

.Options_about_text {
  color: rgba(81, 110, 65, 1);
  padding: 0px 0px 0px 10px;
  font-size: 34.56px;
}

.Options_about_text a {
  color: rgba(81, 110, 65, 1);
}

.Options_textPreview {
  z-index: 1;
  padding: 25.6px;
  min-height: 480px;
  width: 100%;
  box-sizing: border-box;
  position: relative;
  cursor: pointer;
  overflow: hidden;
  border-radius: 4px;
}

.Options_textPreview_textbox {
  position: static;
  width: 100%;
  min-height: 428.8px;
}

.Options_preview_bg {
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

.Options_preview_main {
  position: absolute;
  left: 0px;
  right: -2px;
  bottom: -2px;
  min-height: 430px;
  max-height: 430px;
  border-radius: 0px;
  padding: 125.6px 50px 48px 320px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  letter-spacing: 0.2em;
}

.Options_preview_nameBg {
  position: absolute;
  left: 320px;
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

.Options_preview_nameText {
  position: absolute;
  left: 320px;
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

.Options_preview_dialog {
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

.Options_preview_char {
  opacity: 0;
  animation-name: Options_TextReveal;
  animation-timing-function: ease-out;
  animation-fill-mode: forwards;
}
`.trim();

function OptionSliderControl(props: {
  id: string;
  value: number;
  min?: number;
  max?: number;
  onEnter: () => void;
  onChange: (value: number) => void;
}) {
  const { id, value, min = 0, max = 100, onEnter, onChange } = props;
  const [hovered, setHovered] = useState(false);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onUp = () => setDragging(false);
    document.addEventListener('mouseup', onUp);
    return () => document.removeEventListener('mouseup', onUp);
  }, []);

  const calcBubbleLeft = () => {
    if (!inputRef.current) return 0;
    const span = max - min || 1;
    const ratio = (value - min) / span;
    const sliderWidth = inputRef.current.offsetWidth;
    const thumbWidth = sliderWidth * 0.072;
    return ratio * (sliderWidth - thumbWidth) + thumbWidth / 2;
  };

  return (
    <div className="Option_WebGAL_slider">
      <input
        id={id}
        ref={inputRef}
        type="range"
        min={min}
        max={max}
        value={value}
        onMouseEnter={() => {
          setHovered(true);
          onEnter();
        }}
        onMouseLeave={() => !dragging && setHovered(false)}
        onMouseDown={() => setDragging(true)}
        onFocus={onEnter}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      {(hovered || dragging) && (
        <div className="Option_WebGAL_bubble" style={{ left: `${calcBubbleLeft()}px` }}>
          {Number(value.toFixed(1))}
        </div>
      )}
    </div>
  );
}

function getPreviewFontSizePx(sizeIndex: number): number {
  if (sizeIndex === 0) return 25.6 * 1.55;
  if (sizeIndex === 2) return 25.6 * 2.3;
  return 25.6 * 2.05;
}

export function OptionsTabbedClassicScreen(props: OptionsScreenProps) {
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

  const { rootProps } = useScreenParts('options', OPTIONS_TABBED_PARTS, OPTIONS_TABBED_DEFAULT_CSS);
  const [activeTab, setActiveTab] = useState<OptionTab>('system');
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);
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
  const currentLangLabel = languageOptions.find((item) => item.value === optionData.language)?.label ?? '日本語';

  if (!visible) return null;

  const selectTab = (tab: OptionTab) => {
    playSe.switch();
    setActiveTab(tab);
  };

  return (
    <div {...rootProps} className={`${rootProps.className} Options_backdrop`}>
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
      <div className="Options_main">
        <div className="Options_main_header">
          <div className="Options_title">
            <div className="Option_title_text">{t('menu.options.title')}</div>
          </div>
        </div>

        <div className="Options_page_container">
          <div className="Options_button_list">
            {(
              [
                ['system', t('menu.options.pages.system.title')],
                ['display', t('menu.options.pages.display.title')],
                ['sound', t('menu.options.pages.sound.title')],
              ] as const
            ).map(([tabKey, label]) => (
              <button
                key={tabKey}
                type="button"
                className={`Options_page_button${activeTab === tabKey ? ' Options_page_button_active' : ''}`}
                onMouseEnter={playSe.enter}
                onClick={() => selectTab(tabKey)}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="Options_main_content">
            {activeTab === 'system' && (
              <div className="Options_main_content_half">
                {showAbout ? (
                  <div className="Options_about">
                    <button
                      type="button"
                      className="Options_about_back"
                      onClick={() => {
                        playSe.switch();
                        setShowAbout(false);
                      }}
                    >
                      <Left theme="outline" size={35} strokeWidth={3} fill="#333" />
                    </button>
                    <div className="Options_about_title">{t('menu.options.pages.system.options.about.subTitle')}</div>
                    <div className="Options_about_title">{t('menu.options.pages.system.options.about.version')}</div>
                    <div className="Options_about_text">{version}</div>
                    <div className="Options_about_title">{t('menu.options.pages.system.options.about.source')}</div>
                    <div className="Options_about_text">
                      <a target="_blank" href="https://github.com/OpenWebGAL/WebGAL" rel="noreferrer">
                        https://github.com/OpenWebGAL/WebGAL
                      </a>
                    </div>
                    <div className="Options_about_title">
                      {t('menu.options.pages.system.options.about.contributors')}
                    </div>
                    <div className="Options_about_text">
                      <a
                        target="_blank"
                        href="https://github.com/OpenWebGAL/WebGAL/graphs/contributors"
                        rel="noreferrer"
                      >
                        https://github.com/OpenWebGAL/WebGAL/graphs/contributors
                      </a>
                    </div>
                    <div className="Options_about_title">{t('menu.options.pages.system.options.about.website')}</div>
                    <div className="Options_about_text">
                      <a target="_blank" href="https://openwebgal.com/" rel="noreferrer">
                        https://openwebgal.com/
                      </a>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="NormalOption">
                      <div className="NormalOption_title">{t('menu.options.pages.system.options.autoSpeed.title')}</div>
                      <div className="NormalOption_content">
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
                            className={`NormalButton${optionData.autoSpeed === val ? ' NormalButtonChecked' : ''}`}
                            onMouseEnter={playSe.enter}
                            onClick={() => {
                              playSe.switch();
                              onChangeOption('autoSpeed', val);
                            }}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="NormalOption">
                      <div className="NormalOption_title">{t('menu.options.pages.system.options.language.title')}</div>
                      <div className="NormalOption_content">
                        <div className="Option_select">
                          <button
                            type="button"
                            className={`Option_select_button${showLanguageMenu ? ' Option_select_button_active' : ''}`}
                            onMouseEnter={playSe.enter}
                            onClick={() => {
                              playSe.switch();
                              setShowLanguageMenu((prev) => !prev);
                            }}
                          >
                            {currentLangLabel}
                          </button>
                          {showLanguageMenu && (
                            <div className="Option_select_menu">
                              {languageOptions.map((item) => (
                                <button
                                  key={item.value}
                                  type="button"
                                  className={`Option_select_item${
                                    optionData.language === item.value ? ' Option_select_item_active' : ''
                                  }`}
                                  onMouseEnter={playSe.enter}
                                  onClick={() => {
                                    playSe.switch();
                                    onChangeLanguage(item.value);
                                    setShowLanguageMenu(false);
                                  }}
                                >
                                  {item.label}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="NormalOption">
                      <div className="NormalOption_title">{t('menu.options.pages.system.options.skipAll.title')}</div>
                      <div className="NormalOption_content">
                        <OptionSliderControl
                          id="skipAll"
                          value={optionData.skipAll ? 100 : 0}
                          onEnter={playSe.enter}
                          onChange={(val) => onChangeOption('skipAll', val > 50)}
                        />
                      </div>
                    </div>

                    <div className="NormalOption">
                      <div className="NormalOption_title">{t('menu.options.pages.system.options.resetData.title')}</div>
                      <div className="NormalOption_content">
                        <button
                          type="button"
                          className="NormalButton"
                          onMouseEnter={playSe.enter}
                          onClick={onResetSaves}
                        >
                          {t('menu.options.pages.system.options.resetData.options.clearGameSave')}
                        </button>
                        <button
                          type="button"
                          className="NormalButton"
                          onMouseEnter={playSe.enter}
                          onClick={onResetOptions}
                        >
                          {t('menu.options.pages.system.options.resetData.options.resetSettings')}
                        </button>
                        <button type="button" className="NormalButton" onMouseEnter={playSe.enter} onClick={onResetAll}>
                          {t('menu.options.pages.system.options.resetData.options.clearAll')}
                        </button>
                      </div>
                    </div>

                    <div className="NormalOption">
                      <div className="NormalOption_title">{t('menu.options.pages.system.options.gameSave.title')}</div>
                      <div className="NormalOption_content">
                        <button
                          type="button"
                          className="NormalButton"
                          onMouseEnter={playSe.enter}
                          onClick={() => {
                            playSe.click();
                            onExportSaves();
                          }}
                        >
                          {t('menu.options.pages.system.options.gameSave.options.export')}
                        </button>
                        <button
                          type="button"
                          className="NormalButton"
                          onMouseEnter={playSe.enter}
                          onClick={() => {
                            playSe.click();
                            importInputRef.current?.click();
                          }}
                        >
                          {t('menu.options.pages.system.options.gameSave.options.import')}
                        </button>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="About_title_text"
                      aria-label={t('menu.options.pages.system.options.about.title')}
                      onClick={() => {
                        playSe.switch();
                        setShowAbout(true);
                      }}
                    >
                      <Info theme="outline" size={32} fill="#227D515F" />
                    </button>
                  </>
                )}
              </div>
            )}

            {activeTab === 'display' && (
              <div className="Options_main_content_half">
                {isFullscreenSupported && (
                  <div className="NormalOption">
                    <div className="NormalOption_title">{t('menu.options.pages.display.options.fullScreen.title')}</div>
                    <div className="NormalOption_content">
                      <button
                        type="button"
                        className={`NormalButton${isFullscreen ? ' NormalButtonChecked' : ''}`}
                        onMouseEnter={playSe.enter}
                        onClick={() => {
                          playSe.switch();
                          onToggleFullscreen(true);
                        }}
                      >
                        {t('menu.options.pages.display.options.fullScreen.options.on')}
                      </button>
                      <button
                        type="button"
                        className={`NormalButton${!isFullscreen ? ' NormalButtonChecked' : ''}`}
                        onMouseEnter={playSe.enter}
                        onClick={() => {
                          playSe.switch();
                          onToggleFullscreen(false);
                        }}
                      >
                        {t('menu.options.pages.display.options.fullScreen.options.off')}
                      </button>
                    </div>
                  </div>
                )}

                <div className="NormalOption">
                  <div className="NormalOption_title">{t('menu.options.pages.display.options.textSize.title')}</div>
                  <div className="NormalOption_content">
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
                        className={`NormalButton${optionData.textSize === val ? ' NormalButtonChecked' : ''}`}
                        onMouseEnter={playSe.enter}
                        onClick={() => {
                          playSe.switch();
                          onChangeOption('textSize', val);
                        }}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="NormalOption">
                  <div className="NormalOption_title">{t('menu.options.pages.display.options.textFont.title')}</div>
                  <div className="NormalOption_content">
                    {fontLabels.map((label, index) => (
                      <button
                        key={`${label}-${index}`}
                        type="button"
                        className={`NormalButton${currentFontIndex === index ? ' NormalButtonChecked' : ''}`}
                        onMouseEnter={playSe.enter}
                        onClick={() => {
                          playSe.switch();
                          onChangeOption('textboxFont', index);
                        }}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="NormalOption">
                  <div className="NormalOption_title">{t('menu.options.pages.display.options.textSpeed.title')}</div>
                  <div className="NormalOption_content">
                    <OptionSliderControl
                      id="textSpeed"
                      value={optionData.textSpeed}
                      onEnter={playSe.enter}
                      onChange={(val) => onChangeOption('textSpeed', val)}
                    />
                  </div>
                </div>

                <div className="NormalOption">
                  <div className="NormalOption_title">
                    {t('menu.options.pages.display.options.textboxOpacity.title')}
                  </div>
                  <div className="NormalOption_content">
                    <OptionSliderControl
                      id="textboxOpacity"
                      value={optionData.textboxOpacity}
                      onEnter={playSe.enter}
                      onChange={(val) => onChangeOption('textboxOpacity', val)}
                    />
                  </div>
                </div>

                <div className="NormalOption NormalOption_full">
                  <div className="NormalOption_title">{t('menu.options.pages.display.options.textPreview.title')}</div>
                  <div
                    className="Options_textPreview"
                    style={{
                      background: previewBgUrl
                        ? `bottom / cover no-repeat url('${resolveScreenAssetUrl(previewBgUrl)}')`
                        : 'rgba(0, 0, 0, 0.1)',
                    }}
                    onClick={() => setPreviewKey((k) => k + 1)}
                  >
                    {textboxPreviewNode ?? (
                      <div className="Options_textPreview_textbox" key={`${previewKey}-${optionData.textSpeed}`}>
                        <div className="Options_preview_bg" style={{ opacity: optionData.textboxOpacity / 100 }} />
                        <div className="Options_preview_main" style={{ fontFamily: activeFontFamily }}>
                          <div
                            className="Options_preview_nameBg"
                            style={{ opacity: optionData.textboxOpacity / 100 }}
                          />
                          <div className="Options_preview_nameText">
                            {t('menu.options.pages.display.options.textPreview.title')}
                          </div>
                          <div
                            className="Options_preview_dialog"
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
                              animateClassName: 'Options_preview_char',
                              dialogKey: `preview-${previewKey}-${optionData.textSpeed}`,
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'sound' && (
              <div className="Options_main_content_half">
                {(
                  [
                    ['volumeMain', 'menu.options.pages.sound.options.volumeMain.title'],
                    ['vocalVolume', 'menu.options.pages.sound.options.vocalVolume.title'],
                    ['bgmVolume', 'menu.options.pages.sound.options.bgmVolume.title'],
                    ['seVolume', 'menu.options.pages.sound.options.seVolume.title'],
                    ['uiSeVolume', 'menu.options.pages.sound.options.uiSeVolume.title'],
                  ] as const
                ).map(([key, titleKey]) => (
                  <div className="NormalOption" key={key}>
                    <div className="NormalOption_title">{t(titleKey)}</div>
                    <div className="NormalOption_content">
                      <OptionSliderControl
                        id={key}
                        value={optionData[key]}
                        onEnter={playSe.enter}
                        onChange={(val) => onChangeOption(key, val)}
                      />
                    </div>
                  </div>
                ))}

                <div className="NormalOption">
                  <div className="NormalOption_title">{t('menu.options.pages.sound.options.voiceOption.title')}</div>
                  <div className="NormalOption_content">
                    <button
                      type="button"
                      className={`NormalButton${optionData.voiceInterruption === 0 ? ' NormalButtonChecked' : ''}`}
                      onMouseEnter={playSe.enter}
                      onClick={() => {
                        playSe.switch();
                        onChangeOption('voiceInterruption', 0);
                      }}
                    >
                      {t('menu.options.pages.sound.options.voiceStop.title')}
                    </button>
                    <button
                      type="button"
                      className={`NormalButton${optionData.voiceInterruption === 1 ? ' NormalButtonChecked' : ''}`}
                      onMouseEnter={playSe.enter}
                      onClick={() => {
                        playSe.switch();
                        onChangeOption('voiceInterruption', 1);
                      }}
                    >
                      {t('menu.options.pages.sound.options.voiceContinue.title')}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export const OPTIONS_TABBED_CLASSIC_VARIANT: BuiltInScreenVariant<OptionsScreenProps> = {
  screen: 'options',
  variantId: 'tabbed-classic',
  name: '经典分类标签',
  component: OptionsTabbedClassicScreen,
  parts: OPTIONS_TABBED_PARTS,
  defaultCssText: OPTIONS_TABBED_DEFAULT_CSS,
};
