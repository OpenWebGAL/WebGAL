import type { BuiltInScreenVariant, ChooseScreenProps, ScreenPartDefinition } from '@/screens/contracts';
import { installGlobalUiSdk, type WebgalUiSdk } from '@/sdk/globalUiSdk';

function getUiSdk(): WebgalUiSdk {
  return (typeof window !== 'undefined' ? window.__WEBGAL_UI_SDK__ : undefined) ?? installGlobalUiSdk();
}

const CHOOSE_PARTS: ScreenPartDefinition[] = [
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

const CHOOSE_DEFAULT_CSS = `
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
  background: rgba(0, 0, 0, 0.05);
}

.Choose_item {
  font-family: inherit;
  cursor: pointer;
  min-width: 1280px;
  padding: 16.96px 67.84px;
  margin: 16.96px 0px;
  text-align: center;
  border-radius: 4px;
  border: 3px solid rgba(0, 0, 0, 0);
  box-shadow: 0px 0px 25px rgba(0, 0, 0, 0.25);
  background: rgba(255, 255, 255, 0.65);
  transition: background-color 0.5s, border 0.5s, box-shadow 0.5s;
}

.Choose_item:hover {
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0px 0px 25px rgba(0, 0, 0, 0.35);
  border: 3px solid #8e354a;
}

.Choose_item:disabled,
.Choose_item.Choose_item_disabled {
  cursor: not-allowed;
  background: rgba(255, 255, 255, 0.5);
  border: 3px solid rgba(0, 0, 0, 0);
  box-shadow: 0px 0px 25px rgba(0, 0, 0, 0.25);
}

.Choose_item_text {
  display: inline-block;
  font-size: 67.84px;
  color: #8e354a;
  transition: color 0.5s, font-weight 0.5s;
}

.Choose_item:disabled .Choose_item_text,
.Choose_item.Choose_item_disabled .Choose_item_text {
  color: rgba(142, 53, 74, 0.5);
}
`.trim();

export function ChooseScreen(props: ChooseScreenProps) {
  const sdk = getUiSdk();
  const { rootProps } = sdk.useScreenParts('choose', CHOOSE_PARTS, CHOOSE_DEFAULT_CSS);

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

export const CHOOSE_DEFAULT_VARIANT: BuiltInScreenVariant<ChooseScreenProps> = {
  screen: 'choose',
  variantId: 'default',
  name: '默认分支选择',
  component: ChooseScreen,
  parts: CHOOSE_PARTS,
  defaultCssText: CHOOSE_DEFAULT_CSS,
};
