import { useScreenParts } from '@webgal/ui-sdk';
import type { ScreenPartDefinition, TitleScreenProps } from './types/webgal-ui-sdk';
import defaultCssText from './style.scss?inline';

export const variantId = 'custom-title';
export const name = 'Custom Title Screen';

export const parts: ScreenPartDefinition[] = [
  { id: 'background', name: '背景层', selector: '.custom-title-bg', allowLayoutEdit: false },
  { id: 'menu', name: '标题按钮栏', selector: '.custom-title-menu', allowLayoutEdit: true },
  { id: 'button', name: '按钮样式', selector: '.custom-title-btn', allowLayoutEdit: false },
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
          {props.t('title.start.title')}
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
            {props.t('title.continue.title')}
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
          {props.t('title.load.title')}
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
          {props.t('title.options.title')}
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
            {props.t('title.extra.title')}
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
          {props.t('title.exit.title')}
        </button>
      </div>
    </div>
  );
}
