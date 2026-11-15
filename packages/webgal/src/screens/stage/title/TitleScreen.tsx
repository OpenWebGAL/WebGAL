import type { BuiltInScreenVariant, ScreenPartDefinition, TitleScreenProps } from '@/screens/contracts';
import { installGlobalUiSdk, type WebgalUiSdk } from '@/sdk/globalUiSdk';

function getUiSdk(): WebgalUiSdk {
  return (typeof window !== 'undefined' ? window.__WEBGAL_UI_SDK__ : undefined) ?? installGlobalUiSdk();
}

const TITLE_PARTS: ScreenPartDefinition[] = [
  { id: 'main', name: '标题主容器', selector: '.Title_main', allowLayoutEdit: true },
  { id: 'buttonList', name: '按钮列表', selector: '.Title_buttonList', allowLayoutEdit: true },
  { id: 'button', name: '标题按钮', selector: '.Title_button', allowLayoutEdit: false },
  { id: 'buttonText', name: '按钮文字', selector: '.Title_button_text', allowLayoutEdit: false },
];

const TITLE_DEFAULT_CSS = `
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
  font-family: "资源圆体", serif;
  position: absolute;
  left: 0px;
  top: 0px;
  min-width: 640px;
  height: 1440px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  padding-left: 120px;
  transition: background 0.75s;
  box-sizing: border-box;
}

.Title_button {
  flex: 0 1 auto;
  font-weight: bold;
  text-align: left;
  cursor: pointer;
  padding: 17.92px 0px;
  margin: 18px 0px;
  transition: transform 0.22s ease, opacity 0.22s ease;
  background: transparent;
  backdrop-filter: none;
  border: 0px solid transparent;
  border-radius: 0px;
  transform: none;
  overflow: visible;
  text-shadow: none;
}

.Title_button:hover {
  transform: translate3d(0px, -3px, 0px) scale(1.01);
  padding: 17.92px 0px;
  text-shadow: none;
  filter: drop-shadow(0px 6px 8px rgba(6, 10, 18, 0.06)) drop-shadow(0px 3px 4px rgba(6, 10, 18, 0.04));
}

.Title_button:disabled,
.Title_button.Title_button_disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

.Title_button:disabled:hover,
.Title_button.Title_button_disabled:hover {
  transform: none;
  filter: none;
  padding: 17.92px 0px;
}

.Title_button_text {
  display: block;
  padding: 0.08em 0.55em 0.12em 0.35em;
  font-size: 51.2px;
  font-family: "资源圆体", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  letter-spacing: 0.16em;
  line-height: 1.2;
  white-space: nowrap;
  color: #ffffff;
  paint-order: stroke fill;
  -webkit-text-stroke: 0.09em rgba(12, 20, 32, 0.7);
  text-shadow:
    0px 2px 6px rgba(7, 12, 20, 0.15),
    0px 1px 2px rgba(7, 12, 20, 0.1);
}
`.trim();

export function TitleScreen(props: TitleScreenProps) {
  const sdk = getUiSdk();
  const { rootProps } = sdk.useScreenParts('title', TITLE_PARTS, TITLE_DEFAULT_CSS);

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

export const TITLE_DEFAULT_VARIANT: BuiltInScreenVariant<TitleScreenProps> = {
  screen: 'title',
  variantId: 'default',
  name: '默认样式 (Refine 2026)',
  component: TitleScreen,
  parts: TITLE_PARTS,
  defaultCssText: TITLE_DEFAULT_CSS,
};
