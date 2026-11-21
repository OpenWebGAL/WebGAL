import type { BuiltInScreenVariant, ScreenPartDefinition, TitleScreenProps } from '@/screens/contracts';
import { installGlobalUiSdk, type WebgalUiSdk } from '@/sdk/globalUiSdk';

function getUiSdk(): WebgalUiSdk {
  return (typeof window !== 'undefined' ? window.__WEBGAL_UI_SDK__ : undefined) ?? installGlobalUiSdk();
}

const TITLE_CLASSIC_PARTS: ScreenPartDefinition[] = [
  { id: 'main', name: '标题主容器', selector: '.Title_main', kind: 'container', allowLayoutEdit: true },
  { id: 'buttonList', name: '按钮列表', selector: '.Title_buttonList', kind: 'container', allowLayoutEdit: true },
  { id: 'button', name: '标题按钮', selector: '.Title_button', kind: 'container', allowLayoutEdit: false },
  {
    id: 'buttonText',
    name: '按钮文字',
    selector: '.Title_button_text',
    kind: 'text',
    stateHostSelector: '.Title_button',
    allowLayoutEdit: false,
  },
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
  font-family: "思源宋体", serif;
  display: flex;
  position: absolute;
  left: 0px;
  bottom: 0px;
  width: 2560px;
  height: 172.8px;
  background: rgba(0, 0, 0, 0.4);
  justify-content: space-evenly;
  justify-items: center;
  align-items: center;
  flex-flow: row;
  transition: background 0.75s;
  box-sizing: border-box;
}

.Title_buttonList:hover {
  background: rgba(0, 0, 0, 0.6);
}

.Title_button {
  text-align: center;
  flex: 0 1 auto;
  cursor: pointer;
  padding: 5.12px 25.6px;
  border: 0px solid transparent;
  background: transparent;
  transition: background-color 0.3s, transform 0.3s;
}

.Title_button:hover {
  transform: scale(1.025, 1.025) translate(0px, -1.28px);
}

.Title_button:disabled,
.Title_button.Title_button_disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

.Title_button:disabled:hover,
.Title_button.Title_button_disabled:hover {
  transform: none;
}

.Title_button_text {
  display: block;
  font-size: 47.36px;
  font-weight: bold;
  font-family:
    "WebgalUI",
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    Roboto,
    Oxygen,
    Ubuntu,
    Cantarell,
    "Fira Sans",
    "Droid Sans",
    "Helvetica Neue",
    sans-serif;
  letter-spacing: 0.15em;
  padding: 0px 23.68px;
  color: #f5f5f5;
  white-space: nowrap;
  transition: text-shadow 0.3s;
}

.Title_button:hover .Title_button_text {
  text-shadow: 0px 0px 10px rgba(255, 255, 255, 1);
}

.Title_button:disabled:hover .Title_button_text,
.Title_button.Title_button_disabled:hover .Title_button_text {
  text-shadow: none;
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
  name: '经典底栏',
  component: TitleClassic,
  parts: TITLE_CLASSIC_PARTS,
  defaultCssText: TITLE_CLASSIC_DEFAULT_CSS,
};
