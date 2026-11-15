import type { BuiltInScreenVariant, ScreenPartDefinition, TitleScreenProps } from '@/screens/contracts';
import { installGlobalUiSdk, type WebgalUiSdk } from '@/sdk/globalUiSdk';

function getUiSdk(): WebgalUiSdk {
  return (typeof window !== 'undefined' ? window.__WEBGAL_UI_SDK__ : undefined) ?? installGlobalUiSdk();
}

const TITLE_CLASSIC_PARTS: ScreenPartDefinition[] = [
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
  position: absolute;
  left: 0px;
  bottom: 172.8px;
  width: 2560px;
  height: 172.8px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 32px;
  padding: 0px 80px;
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(5px);
  box-sizing: border-box;
  transition: background 0.75s;
}

.Title_button {
  flex: 0 1 auto;
  font-weight: bold;
  text-align: center;
  cursor: pointer;
  padding: 20px 44px;
  margin: 0px 12px;
  border: 0px solid transparent;
  border-radius: 6px;
  background: transparent;
  transition: text-shadow 0.35s ease, background-color 0.35s ease, transform 0.25s ease;
}

.Title_button:hover {
  background: rgba(255, 255, 255, 0.2);
  text-shadow: 0px 0px 14px rgba(255, 255, 255, 1), 0px 0px 24px rgba(255, 255, 255, 0.85);
}

.Title_button:disabled,
.Title_button.Title_button_disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

.Title_button:disabled:hover,
.Title_button.Title_button_disabled:hover {
  background: transparent;
  text-shadow: none;
}

.Title_button_text {
  display: block;
  font-family: "WebgalUI", -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 46px;
  color: #ffffff;
  letter-spacing: 0.16em;
  text-shadow: 0px 2px 10px rgba(0, 0, 0, 0.5);
  white-space: nowrap;
}
`.trim();

export function TitleClassic(props: TitleScreenProps) {
  const sdk = getUiSdk();
  const { rootProps } = sdk.useScreenParts('title', TITLE_CLASSIC_PARTS, TITLE_CLASSIC_DEFAULT_CSS);

  if (!props.visible) return null;

  const backgroundStyle =
    props.backgroundUrl === ''
      ? { background: 'linear-gradient(135deg, #fdfbfb 0%, #dcddde 100%)' }
      : {
          backgroundImage: `url("${props.backgroundUrl}"), linear-gradient(135deg, #fdfbfb 0%, #dcddde 100%)`,
          backgroundSize: 'cover',
        };

  const renderButton = (key: string, label: string, onClick: () => void, disabled = false) => (
    <button
      key={key}
      type="button"
      disabled={disabled}
      className={`Title_button${disabled ? ' Title_button_disabled' : ''}`}
      onClick={() => {
        if (disabled) return;
        props.playSe.click();
        onClick();
      }}
      onMouseEnter={disabled ? undefined : props.playSe.enter}
    >
      <span className="Title_button_text">{label}</span>
    </button>
  );

  return (
    <div {...rootProps}>
      <div className="Title_main" style={backgroundStyle}>
        <div className="Title_buttonList">
          {renderButton('start', props.t('title.start.title'), props.onStart)}
          {props.enableContinue &&
            renderButton('continue', props.t('title.continue.title'), props.onContinue, !props.canContinue)}
          {renderButton('options', props.t('title.options.title'), props.onOpenOptions)}
          {renderButton('load', props.t('title.load.title'), props.onOpenLoad)}
          {props.enableExtra &&
            renderButton('extra', props.t('title.extra.title'), props.onOpenExtra, !props.hasAppreciationItems)}
          {renderButton('exit', props.t('title.exit.title'), props.onExit)}
        </div>
      </div>
    </div>
  );
}

export const TITLE_CLASSIC_VARIANT: BuiltInScreenVariant<TitleScreenProps> = {
  screen: 'title',
  variantId: 'classic',
  name: '经典底栏 (WebGAL Classic)',
  component: TitleClassic,
  parts: TITLE_CLASSIC_PARTS,
  defaultCssText: TITLE_CLASSIC_DEFAULT_CSS,
};
