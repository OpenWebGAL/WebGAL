import type { BuiltInScreenVariant, ChooseScreenProps, ScreenPartDefinition } from '@/screens/contracts';
import { installGlobalUiSdk, type WebgalUiSdk } from '@/sdk/globalUiSdk';

function getUiSdk(): WebgalUiSdk {
  return (typeof window !== 'undefined' ? window.__WEBGAL_UI_SDK__ : undefined) ?? installGlobalUiSdk();
}

const CHOOSE_SLEEK_DARK_PARTS: ScreenPartDefinition[] = [
  { id: 'main', name: '选项列表容器', selector: '.Choose_Main', kind: 'container', allowLayoutEdit: true },
  { id: 'item', name: '选项按钮', selector: '.Choose_item', kind: 'container', allowLayoutEdit: false },
  {
    id: 'itemText',
    name: '选项按钮文字',
    selector: '.Choose_item_text',
    kind: 'text',
    stateHostSelector: '.Choose_item',
    allowLayoutEdit: false,
  },
];

const CHOOSE_SLEEK_DARK_DEFAULT_CSS = `
.Choose_Main {
  position: absolute;
  left: 0px;
  top: 0px;
  width: 2560px;
  height: 1440px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 13;
  background: rgba(5, 8, 15, 0.36);
}

.Choose_item {
  font-family: inherit;
  cursor: pointer;
  min-width: 1200px;
  padding: 22px 72px;
  margin: 16px 0px;
  text-align: center;
  border-radius: 10px;
  border: 1px solid rgba(148, 163, 184, 0.35);
  box-shadow: 0px 8px 28px rgba(0, 0, 0, 0.45);
  background: linear-gradient(
    90deg,
    rgba(17, 24, 39, 0.84) 0%,
    rgba(30, 41, 59, 0.9) 50%,
    rgba(17, 24, 39, 0.84) 100%
  );
  backdrop-filter: blur(10px);
  transition: background 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease, transform 0.2s ease;
}

.Choose_item:hover {
  background: linear-gradient(
    90deg,
    rgba(30, 41, 59, 0.92) 0%,
    rgba(51, 65, 85, 0.96) 50%,
    rgba(30, 41, 59, 0.92) 100%
  );
  border-color: rgba(125, 211, 252, 0.88);
  box-shadow: 0px 0px 28px rgba(56, 189, 248, 0.32), 0px 10px 32px rgba(0, 0, 0, 0.55);
  transform: translateY(-2px);
}

.Choose_item:disabled,
.Choose_item.Choose_item_disabled {
  cursor: not-allowed;
  background: rgba(15, 23, 42, 0.6);
  border-color: rgba(148, 163, 184, 0.2);
  box-shadow: none;
  transform: none;
}

.Choose_item_text {
  display: inline-block;
  font-size: 52px;
  letter-spacing: 0.1em;
  color: #f1f5f9;
  transition: color 0.25s ease;
}

.Choose_item:hover .Choose_item_text {
  color: #ffffff;
}

.Choose_item:disabled .Choose_item_text,
.Choose_item.Choose_item_disabled .Choose_item_text {
  color: rgba(148, 163, 184, 0.55);
}
`.trim();

export function ChooseSleekDark(props: ChooseScreenProps) {
  const sdk = getUiSdk();
  const { rootProps } = sdk.useScreenParts('choose', CHOOSE_SLEEK_DARK_PARTS, CHOOSE_SLEEK_DARK_DEFAULT_CSS);

  if (!props.visible) return null;

  return (
    <div {...rootProps}>
      <div className="Choose_Main" style={{ fontFamily: props.fontFamily }}>
        {props.options.map((option) => (
          <button
            key={option.id}
            type="button"
            disabled={option.disabled}
            className={`Choose_item${option.disabled ? ' Choose_item_disabled' : ''}`}
            onClick={() => {
              if (option.disabled) return;
              props.playSe.click();
              props.onSelect(option.id);
            }}
            onMouseEnter={option.disabled ? undefined : props.playSe.enter}
          >
            <span className="Choose_item_text">{option.text}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export const CHOOSE_SLEEK_DARK_VARIANT: BuiltInScreenVariant<ChooseScreenProps> = {
  screen: 'choose',
  variantId: 'sleek-dark',
  name: '暗夜浮光',
  component: ChooseSleekDark,
  parts: CHOOSE_SLEEK_DARK_PARTS,
  defaultCssText: CHOOSE_SLEEK_DARK_DEFAULT_CSS,
};
