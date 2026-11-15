const __WEBGAL_SDK__ = globalThis.__WEBGAL_UI_SDK__;
if (!__WEBGAL_SDK__) {
  throw new Error("WebGAL UI SDK is not initialized.");
}
const { jsx: _jsx, jsxs: _jsxs } = __WEBGAL_SDK__.jsxRuntime;
const { AlignTextLeftOne, DoubleDown, DoubleRight, DoubleUp, FolderOpen, FullScreen, Home, Lock, OffScreen, PlayOne, PreviewCloseOne, PreviewOpen, ReplayMusic, Save, SettingTwo, TreeDiagram, Unlock } = __WEBGAL_SDK__.icons;
const installGlobalUiSdk = () => __WEBGAL_SDK__;
function getUiSdk() {
    return (typeof window !== 'undefined' ? window.__WEBGAL_UI_SDK__ : undefined) ?? installGlobalUiSdk();
}
const BOTTOM_CONTROL_PANEL_PARTS = [
    { id: 'main', name: '底部快捷栏容器', selector: '.BottomControlPanel_main', allowLayoutEdit: true },
    { id: 'button', name: '快捷栏按钮', selector: '.BottomControlPanel_button', allowLayoutEdit: false },
    {
        id: 'fastSlPreview',
        name: '快速存读档预览浮窗',
        selector: '.BottomControlPanel_fastSlPreview',
        allowLayoutEdit: true,
    },
];
const BOTTOM_CONTROL_PANEL_DEFAULT_CSS = `
.BottomControlPanel_main {
  position: absolute;
  right: 20px;
  bottom: 20px;
  height: 70px;
  z-index: 9;
  display: flex;
  flex-flow: row;
  justify-content: center;
  align-items: center;
  border-radius: 35px;
  padding: 3.07px 35.84px;
  font-size: 20.48px;
  box-sizing: border-box;
}

.BottomControlPanel_fastSlWrapper {
  position: relative;
  height: 100%;
  display: inline-flex;
  align-items: center;
}

.BottomControlPanel_button {
  height: 100%;
  display: inline-block;
  color: #ffffff;
  font-family: "WebgalUI", -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 30.72px;
  padding: 9.22px 9.22px 0px 4.61px;
  transition: background-color 0.5s;
  cursor: pointer;
  border-radius: 4px;
  margin: 0px 3.07px;
  position: relative;
  border: 0px solid transparent;
  background: transparent;
  white-space: nowrap;
}

.BottomControlPanel_button:hover,
.BottomControlPanel_button.BottomControlPanel_button_active {
  background-color: rgba(255, 255, 255, 0.3);
}

.BottomControlPanel_button_icon {
  position: relative;
  top: 2px;
  padding: 0px;
  filter: drop-shadow(1px 1px 5px rgba(0, 0, 0, 1));
  display: inline;
}

.BottomControlPanel_button_text {
  position: relative;
  bottom: 8px;
  color: #ffffff;
  text-shadow: 1px 1px 5px rgba(0, 0, 0, 1);
  padding-left: 3px;
}

.BottomControlPanel_fastSlPreview {
  position: absolute;
  top: -250px;
  right: 0px;
  background: linear-gradient(315deg, rgba(253, 251, 251, 0.9) 0%, rgba(235, 237, 238, 0.85) 100%);
  width: 900px;
  height: 230px;
  color: #005caf;
  border-radius: 5px;
  display: none;
  animation: fastSlEnter 0.33s;
  transition: opacity 0.33s;
  font-size: 30.72px;
  pointer-events: none;
  box-sizing: border-box;
}

.BottomControlPanel_fastSlWrapper:hover .BottomControlPanel_fastSlPreview,
.BottomControlPanel_fastSlPreview[data-webgal-selected-part="true"] {
  display: flex;
}

.BottomControlPanel_fastSlCard {
  padding: 15.36px;
  display: flex;
  box-sizing: border-box;
  height: 100%;
  width: 100%;
}

.BottomControlPanel_fastSlThumb {
  display: flex;
  overflow: hidden;
  border-radius: 5px;
  flex-shrink: 0;
  height: 100%;
}

.BottomControlPanel_fastSlMeta {
  overflow: hidden;
  padding: 0px 0px 0px 15.36px;
  text-align: left;
}

.BottomControlPanel_fastSlSpeaker {
  font-size: 30.72px;
}

.BottomControlPanel_fastSlLine {
  font-size: 23.04px;
  color: rgb(55, 60, 56);
}

.BottomControlPanel_fastSlEmpty {
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 38.4px;
}

@keyframes fastSlEnter {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}
`.trim();
export function BottomControlPanelScreen(props) {
    const sdk = getUiSdk();
    const { rootProps } = sdk.useScreenParts('bottomControlPanel', BOTTOM_CONTROL_PANEL_PARTS, BOTTOM_CONTROL_PANEL_DEFAULT_CSS);
    if (!props.visible)
        return null;
    const iconSize = 42;
    const strokeWidth = 2.5;
    const renderBtn = (key, icon, label, onClick, active = false) => (_jsxs("button", { type: "button", className: `BottomControlPanel_button${active ? ' BottomControlPanel_button_active' : ''}`, onClick: onClick, onMouseEnter: props.playSe.enter, children: [_jsx("span", { className: "BottomControlPanel_button_icon", children: icon }), label !== '' && _jsx("span", { className: "BottomControlPanel_button_text", children: label })] }, key));
    const previewNode = props.quickSavePreview ? (_jsxs("div", { className: "BottomControlPanel_fastSlCard", children: [props.quickSavePreview.previewImage !== '' && (_jsx("img", { className: "BottomControlPanel_fastSlThumb", src: props.quickSavePreview.previewImage, alt: "quick-save-preview" })), _jsxs("div", { className: "BottomControlPanel_fastSlMeta", children: [_jsx("div", { className: "BottomControlPanel_fastSlSpeaker", children: sdk.renderRichText(props.quickSavePreview.nowStageState.showName, { replaceSpaceWithNbsp: false }) }), _jsx("div", { className: "BottomControlPanel_fastSlLine", children: sdk.renderRichText(props.quickSavePreview.nowStageState.showText, { replaceSpaceWithNbsp: false }) })] })] })) : (_jsx("div", { className: "BottomControlPanel_fastSlEmpty", children: props.t('gaming.noSaving') }));
    return (_jsx("div", { ...rootProps, children: _jsxs("div", { className: "BottomControlPanel_main", style: { visibility: props.controlsVisible ? 'visible' : 'hidden' }, children: [renderBtn('toggle-textbox', props.isTextBoxVisible ? (_jsx(PreviewCloseOne, { theme: "outline", size: iconSize, fill: "#f5f5f7", strokeWidth: strokeWidth })) : (_jsx(PreviewOpen, { theme: "outline", size: iconSize, fill: "#f5f5f7", strokeWidth: strokeWidth })), props.t(props.isTextBoxVisible ? 'gaming.buttons.hide' : 'gaming.buttons.show'), () => {
                    props.playSe.click();
                    props.onToggleTextBox();
                }), renderBtn('backlog', _jsx(AlignTextLeftOne, { theme: "outline", size: iconSize, fill: "#f5f5f7", strokeWidth: strokeWidth }), props.t('gaming.buttons.backlog'), () => {
                    props.playSe.click();
                    props.onOpenBacklog();
                }), props.enableFlowchart &&
                    renderBtn('flowchart', _jsx(TreeDiagram, { theme: "outline", size: iconSize, fill: "#f5f5f7", strokeWidth: strokeWidth }), props.t('gaming.buttons.flowchart'), () => {
                        props.playSe.click();
                        props.onOpenFlowchart();
                    }), renderBtn('replay', _jsx(ReplayMusic, { theme: "outline", size: iconSize, fill: "#f5f5f7", strokeWidth: strokeWidth }), props.t('gaming.buttons.replay'), () => {
                    props.playSe.click();
                    props.onReplayVocal();
                }), renderBtn('auto', _jsx(PlayOne, { theme: "outline", size: iconSize, fill: "#f5f5f7", strokeWidth: strokeWidth }), props.t('gaming.buttons.auto'), () => {
                    props.playSe.click();
                    props.onToggleAuto();
                }, props.isAuto), renderBtn('fast', _jsx(DoubleRight, { theme: "outline", size: iconSize, fill: "#f5f5f7", strokeWidth: strokeWidth }), props.t('gaming.buttons.forward'), () => {
                    props.playSe.click();
                    props.onToggleFast();
                }, props.isFast), _jsxs("div", { className: "BottomControlPanel_fastSlWrapper", children: [renderBtn('quick-save', _jsx(DoubleDown, { theme: "outline", size: iconSize, fill: "#f5f5f7", strokeWidth: strokeWidth }), props.t('gaming.buttons.quicklySave'), () => {
                            props.playSe.click();
                            props.onQuickSave();
                        }), _jsx("div", { className: "BottomControlPanel_fastSlPreview", children: previewNode })] }), _jsxs("div", { className: "BottomControlPanel_fastSlWrapper", children: [renderBtn('quick-load', _jsx(DoubleUp, { theme: "outline", size: iconSize, fill: "#f5f5f7", strokeWidth: strokeWidth }), props.t('gaming.buttons.quicklyLoad'), () => {
                            props.playSe.click();
                            props.onQuickLoad();
                        }), _jsx("div", { className: "BottomControlPanel_fastSlPreview", children: previewNode })] }), renderBtn('save', _jsx(Save, { theme: "outline", size: iconSize, fill: "#f5f5f7", strokeWidth: strokeWidth }), props.t('gaming.buttons.save'), () => {
                    props.playSe.click();
                    props.onOpenSave();
                }), renderBtn('load', _jsx(FolderOpen, { theme: "outline", size: iconSize, fill: "#f5f5f7", strokeWidth: strokeWidth }), props.t('gaming.buttons.load'), () => {
                    props.playSe.click();
                    props.onOpenLoad();
                }), renderBtn('options', _jsx(SettingTwo, { theme: "outline", size: iconSize, fill: "#f5f5f7", strokeWidth: strokeWidth }), props.t('gaming.buttons.options'), () => {
                    props.playSe.click();
                    props.onOpenOptions();
                }), renderBtn('title', _jsx(Home, { theme: "outline", size: iconSize, fill: "#f5f5f7", strokeWidth: strokeWidth }), props.t('gaming.buttons.title'), () => {
                    props.playSe.dialogOpen();
                    props.onBackToTitle();
                }), props.isFullscreenSupported &&
                    renderBtn('fullscreen', props.isFullscreen ? (_jsx(OffScreen, { theme: "outline", size: iconSize, fill: "#f5f5f7", strokeWidth: strokeWidth })) : (_jsx(FullScreen, { theme: "outline", size: iconSize, fill: "#f5f5f7", strokeWidth: strokeWidth })), props.t('gaming.buttons.fullscreen'), props.onToggleFullscreen), renderBtn('lock', props.isControlsLocked ? (_jsx(Lock, { theme: "outline", size: iconSize, fill: "#f5f5f7", strokeWidth: strokeWidth })) : (_jsx(Unlock, { theme: "outline", size: iconSize, fill: "#f5f5f7", strokeWidth: strokeWidth })), '', () => {
                    props.playSe.click();
                    props.onToggleControlsLock();
                })] }) }));
}
export const BOTTOM_CONTROL_PANEL_DEFAULT_VARIANT = {
    screen: 'bottomControlPanel',
    variantId: 'default',
    name: '默认底部快捷栏',
    component: BottomControlPanelScreen,
    parts: BOTTOM_CONTROL_PANEL_PARTS,
    defaultCssText: BOTTOM_CONTROL_PANEL_DEFAULT_CSS,
};

export { BOTTOM_CONTROL_PANEL_PARTS as parts, BOTTOM_CONTROL_PANEL_DEFAULT_CSS as defaultCssText, BottomControlPanelScreen as Screen };
export default BottomControlPanelScreen;
