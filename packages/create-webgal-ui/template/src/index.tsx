import { useScreenParts } from '@webgal/ui-sdk';
import type { ScreenPartDefinition, TitleScreenProps } from './types/webgal-ui-sdk';
import defaultCssText from './style.scss?inline';

export const variantId = 'custom-title';
export const name = 'Custom Title Screen';

export const parts: ScreenPartDefinition[] = [
  { id: 'background', name: '背景层', selector: '.custom-title-bg', kind: 'container', allowLayoutEdit: false },
  { id: 'menu', name: '标题按钮栏', selector: '.custom-title-menu', kind: 'container', allowLayoutEdit: true },
  { id: 'button', name: '按钮容器', selector: '.custom-title-btn', kind: 'container', allowLayoutEdit: false },
  {
    id: 'buttonText',
    name: '按钮文字',
    selector: '.custom-title-btn-text',
    kind: 'text',
    stateHostSelector: '.custom-title-btn',
    allowLayoutEdit: false,
  },
];

export { defaultCssText };

export default function CustomTitleScreen(props: TitleScreenProps) {
  const { rootProps } = useScreenParts('title', parts, defaultCssText);
  if (!props.visible) return null;

  return (
    <div {...rootProps}>
      <div
        className="custom-title-bg"
        style={props.backgroundUrl ? { backgroundImage: `url("${props.backgroundUrl}")` } : undefined}
      />
      <div className="custom-title-menu">
        <button
          type="button"
          className="custom-title-btn"
          onMouseEnter={() => props.playSe.enter()}
          onClick={() => {
            props.playSe.click();
            props.onStart();
          }}
        >
          <span className="custom-title-btn-text">{props.t('title.start.title')}</span>
        </button>
        {props.enableContinue && (
          <button
            type="button"
            className="custom-title-btn"
            disabled={!props.canContinue}
            onMouseEnter={() => props.playSe.enter()}
            onClick={() => {
              props.playSe.click();
              props.onContinue();
            }}
          >
            <span className="custom-title-btn-text">{props.t('title.continue.title')}</span>
          </button>
        )}
        <button
          type="button"
          className="custom-title-btn"
          onMouseEnter={() => props.playSe.enter()}
          onClick={() => {
            props.playSe.click();
            props.onOpenLoad();
          }}
        >
          <span className="custom-title-btn-text">{props.t('title.load.title')}</span>
        </button>
        <button
          type="button"
          className="custom-title-btn"
          onMouseEnter={() => props.playSe.enter()}
          onClick={() => {
            props.playSe.click();
            props.onOpenOptions();
          }}
        >
          <span className="custom-title-btn-text">{props.t('title.options.title')}</span>
        </button>
        {props.enableExtra && (
          <button
            type="button"
            className="custom-title-btn"
            onMouseEnter={() => props.playSe.enter()}
            onClick={() => {
              props.playSe.click();
              props.onOpenExtra();
            }}
          >
            <span className="custom-title-btn-text">{props.t('title.extra.title')}</span>
          </button>
        )}
        <button
          type="button"
          className="custom-title-btn"
          onMouseEnter={() => props.playSe.enter()}
          onClick={() => {
            props.playSe.click();
            props.onExit();
          }}
        >
          <span className="custom-title-btn-text">{props.t('title.exit.title')}</span>
        </button>
      </div>
    </div>
  );
}
