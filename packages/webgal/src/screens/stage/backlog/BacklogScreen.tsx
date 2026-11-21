import { CloseSmall, Return, VolumeNotice } from '@icon-park/react';
import type { BacklogScreenProps, BuiltInScreenVariant, ScreenPartDefinition } from '@/screens/contracts';
import { installGlobalUiSdk } from '@/sdk/globalUiSdk';

function getUiSdk() {
  return (typeof window !== 'undefined' ? window.__WEBGAL_UI_SDK__ : undefined) ?? installGlobalUiSdk();
}

const BACKLOG_PARTS: ScreenPartDefinition[] = [
  { id: 'main', name: '历史记录主容器', selector: '.Backlog_main', kind: 'container', allowLayoutEdit: true },
  { id: 'top', name: '顶部栏', selector: '.Backlog_top', kind: 'container', allowLayoutEdit: true },
  { id: 'title', name: '顶部标题文字', selector: '.Backlog_title', kind: 'text', allowLayoutEdit: false },
  { id: 'content', name: '记录滚动容器', selector: '.Backlog_content', kind: 'container', allowLayoutEdit: true },
  { id: 'item', name: '单条记录项', selector: '.Backlog_item', kind: 'container', allowLayoutEdit: false },
  { id: 'actionButton', name: '操作按钮', selector: '.Backlog_item_action', kind: 'container', allowLayoutEdit: false },
  { id: 'itemName', name: '角色名文字', selector: '.Backlog_item_name', kind: 'text', allowLayoutEdit: false },
  { id: 'itemText', name: '记录正文文字', selector: '.Backlog_item_text', kind: 'text', allowLayoutEdit: false },
];

const BACKLOG_DEFAULT_CSS = `
.Backlog_main {
  font-family: "思源宋体", serif;
  position: absolute;
  left: 0px;
  top: 0px;
  width: 2560px;
  height: 1440px;
  z-index: 10;
  background: rgba(0, 0, 0, 0.7);
  padding: 51.2px 0px;
  box-sizing: border-box;
  animation: backlog_soft_in 0.7s ease-out forwards;
}

.Backlog_top {
  position: absolute;
  left: 0px;
  top: 51.2px;
  width: 2560px;
  height: 133.76px;
  padding-left: 25.6px;
  display: flex;
  box-sizing: border-box;
}

.Backlog_close {
  padding: 15.36px 15.36px 0px 15.36px;
  border-radius: 1000px;
  transform: translate(0px, -13px);
  border: 0px solid transparent;
  background: transparent;
  display: inline-flex;
  align-items: flex-start;
  justify-content: center;
  cursor: pointer;
}

.Backlog_close:hover {
  background: rgba(255, 255, 255, 0.25);
  animation: backlog_icon_softin 0.25s ease-out forwards;
}

.Backlog_title {
  height: 100%;
  line-height: 100%;
  font-size: 92.16px;
  font-weight: bold;
  color: transparent;
  background: linear-gradient(150deg, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 1) 35%, rgba(165, 212, 228, 1) 100%);
  -webkit-background-clip: text;
  background-clip: text;
}

.Backlog_content {
  font-family: "资源圆体", "WebgalUI", serif;
  position: absolute;
  left: 0px;
  top: 185px;
  width: 2560px;
  height: 1152px;
  padding: 25.6px 256px;
  overflow: auto;
  display: flex;
  flex-flow: column-reverse;
  font-weight: normal;
  box-sizing: border-box;
}

.Backlog_item {
  display: flex;
  color: #ffffff;
  font-size: 42.24px;
  margin: 52.8px 0px 0px 0px;
  width: 100%;
  opacity: 0;
  animation: backlog_item_in 0.5s ease-out forwards;
}

.Backlog_item_meta {
  display: flex;
  flex-flow: row;
  align-items: flex-start;
  width: 30%;
  max-width: 30%;
  min-width: 30%;
}

.Backlog_item_actions {
  display: flex;
  flex-flow: row;
  align-items: flex-start;
  margin: 14.78px 0px 0px 0px;
}

.Backlog_item_action {
  cursor: pointer;
  padding: 0.42px 31.68px 0px 31.68px;
  margin: 0px 0px 0px 21.12px;
  background: rgba(255, 255, 255, 0.075);
  border-radius: 7px;
  border: 0px solid transparent;
  display: flex;
  color: #ffffff;
}

.Backlog_item_action:hover {
  background: rgba(255, 255, 255, 0.25);
}

.Backlog_item_action.active {
  background: rgba(255, 255, 255, 0.25);
}

.Backlog_item_name {
  font-weight: bold;
  color: transparent;
  background: linear-gradient(150deg, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 1) 35%, rgba(165, 212, 228, 1) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  margin: 0px 0px 0px auto;
  overflow-wrap: break-word;
  box-sizing: border-box;
  border-radius: 7px;
  padding: 9.72px 24.29px;
  font-size: 48.58px;
  width: 50%;
  text-align: left;
  letter-spacing: 0.1em;
}

.Backlog_item_text {
  color: #ffffff;
  font-size: 48.58px;
  width: 82.5%;
  box-sizing: border-box;
  padding: 9.72px 0px 0px 48.58px;
  letter-spacing: 0.05em;
}

@keyframes backlog_soft_in {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

@keyframes backlog_icon_softin {
  0% {
    background-color: rgba(255, 255, 255, 0);
  }
  100% {
    background-color: rgba(255, 255, 255, 0.25);
  }
}

@keyframes backlog_item_in {
  0% {
    opacity: 0;
    transform: scale(1.05, 1.05) translate(-15px, 10px) rotateX(-5deg) rotateY(-5deg);
  }
  100% {
    opacity: 1;
    transform: scale(1, 1) translate(0px, 0px) rotateX(0deg) rotateY(0deg);
  }
}
`.trim();

export function BacklogScreen(props: BacklogScreenProps) {
  const sdk = getUiSdk();
  const { rootProps } = sdk.useScreenParts('backlog', BACKLOG_PARTS, BACKLOG_DEFAULT_CSS);

  if (!props.visible) return null;

  const scrollAttr = { [props.scrollContainerAttr]: 'true' };

  return (
    <div {...rootProps}>
      <div className="Backlog_main">
        <div className="Backlog_top">
          <button
            type="button"
            className="Backlog_close"
            onClick={() => {
              props.playSe.click();
              props.onClose();
            }}
            onMouseEnter={props.playSe.enter}
          >
            <CloseSmall theme="outline" size="102.4px" fill="#ffffff" strokeWidth={3} />
          </button>
          <div className="Backlog_title">{props.t('gaming.buttons.backlog')}</div>
        </div>

        <div className="Backlog_content" {...scrollAttr}>
          {props.items.map((item, idx) => {
            const isPlaying = props.playingIndex === item.index;
            return (
              <div
                key={`${item.sentenceId}-${item.index}`}
                className="Backlog_item"
                style={{ animationDelay: `${20 * ((idx - 1) % 20)}ms` }}
              >
                <div className="Backlog_item_meta">
                  <div className="Backlog_item_actions">
                    <button
                      type="button"
                      className="Backlog_item_action"
                      onClick={() => {
                        props.playSe.click();
                        props.onJump(item.index);
                      }}
                      onMouseEnter={props.playSe.enter}
                    >
                      <Return theme="outline" size="0.8em" fill="#ffffff" strokeWidth={3} />
                    </button>
                    {item.vocalUrl !== '' && (
                      <button
                        type="button"
                        className={`Backlog_item_action${isPlaying ? ' active' : ''}`}
                        onClick={() => {
                          props.playSe.click();
                          props.onToggleVocal(item.index);
                        }}
                        onMouseEnter={props.playSe.enter}
                      >
                        <VolumeNotice theme="outline" size="0.8em" fill="#ffffff" strokeWidth={3} />
                      </button>
                    )}
                  </div>
                  <div className="Backlog_item_name">
                    {item.speaker !== '' ? sdk.renderRichText(item.speaker, { replaceSpaceWithNbsp: false }) : null}
                  </div>
                </div>
                <div className="Backlog_item_text">
                  {sdk.renderRichText(item.text, { replaceSpaceWithNbsp: false })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export const BACKLOG_DEFAULT_VARIANT: BuiltInScreenVariant<BacklogScreenProps> = {
  screen: 'backlog',
  variantId: 'default',
  name: '默认历史记录',
  component: BacklogScreen,
  parts: BACKLOG_PARTS,
  defaultCssText: BACKLOG_DEFAULT_CSS,
};
