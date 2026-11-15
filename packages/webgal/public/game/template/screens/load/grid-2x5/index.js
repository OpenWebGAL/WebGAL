const __WEBGAL_SDK__ = globalThis.__WEBGAL_UI_SDK__;
if (!__WEBGAL_SDK__) {
  throw new Error("WebGAL UI SDK is not initialized.");
}
const { jsx: _jsx, jsxs: _jsxs, Fragment: _Fragment } = __WEBGAL_SDK__.jsxRuntime;
const { useEffect, useMemo } = __WEBGAL_SDK__.react;
const { renderRichText, resolveScreenAssetUrl, useScreenParts } = __WEBGAL_SDK__;
const SLOTS_PER_PAGE = 10;
const BASE_PAGE_COUNT = 20;
const LOAD_GRID_PARTS = [
    { id: 'main', name: '读档页面容器', selector: '.Save_Load_main', allowLayoutEdit: true },
    { id: 'top', name: '顶部栏', selector: '.Save_Load_top', allowLayoutEdit: true },
    { id: 'title', name: '水印标题', selector: '.Save_Load_title', allowLayoutEdit: true },
    { id: 'pageList', name: '页码栏', selector: '.Save_Load_top_buttonList', allowLayoutEdit: true },
    { id: 'pageButton', name: '页码按钮', selector: '.Save_Load_top_button', allowLayoutEdit: false },
    { id: 'content', name: '读档网格区', selector: '.Save_Load_content', allowLayoutEdit: true },
    { id: 'slotCard', name: '读档卡片', selector: '.Save_Load_content_element', allowLayoutEdit: false },
    { id: 'slotIndex', name: '档位序号', selector: '.Save_Load_content_element_top_index', allowLayoutEdit: false },
    { id: 'slotTime', name: '存档时间', selector: '.Save_Load_content_element_top_date', allowLayoutEdit: false },
    { id: 'slotPreview', name: '存档缩略图', selector: '.Save_Load_content_miniPic', allowLayoutEdit: false },
    { id: 'slotSpeaker', name: '角色名文本', selector: '.Save_Load_content_speaker', allowLayoutEdit: false },
    { id: 'slotText', name: '对话摘要文本', selector: '.Save_Load_content_text_padding', allowLayoutEdit: false },
];
const LOAD_GRID_DEFAULT_CSS = `
@keyframes Load_Grid_Elements_in {
  0% { opacity: 0; }
  100% { opacity: 1; }
}

@keyframes Load_Grid_Elements_in_transform {
  0% {
    transform: scale(1.05, 1.05) translate(-25px, -20px) rotateY(15deg) rotateX(-15deg);
  }
  100% {
    transform: scale(1, 1) translate(0px, 0px);
  }
}

.Save_Load_backdrop {
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

.Save_Load_main {
  position: relative;
  width: 100%;
  height: 100%;
  cursor: default;
}

.Save_Load_top {
  position: relative;
  width: 100%;
  height: 129.6px;
  display: flex;
  justify-content: center;
  animation: Load_Grid_Elements_in 1s ease-out forwards;
}

.Save_Load_title {
  font-family: "思源宋体", serif;
  letter-spacing: 0.1em;
  width: auto;
  font-size: 128px;
  min-width: 350px;
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  left: 20px;
  top: 0px;
  z-index: 0;
  opacity: 0.2;
  transform: translateY(-10px);
  pointer-events: none;
}

.Load_title_text {
  font-weight: bold;
  color: transparent;
  background: linear-gradient(135deg, #005CAF 0%, #2EA9DF 100%);
  text-shadow: 2px 2px 15px rgba(255, 255, 255, 0.5);
  -webkit-background-clip: text;
  background-clip: text;
}

.Save_Load_top_buttonList {
  position: relative;
  z-index: 1;
  height: 100%;
  max-width: 100%;
  display: flex;
  overflow-x: auto;
}

.Save_Load_top_button {
  font-size: 51.2px;
  text-align: center;
  cursor: pointer;
  width: 104.96px;
  color: rgba(0, 0, 0, 0.5);
  border: 0px solid transparent;
  border-bottom: 4px solid rgba(0, 0, 0, 0);
  background: transparent;
  padding: 0px;
  transition: color 0.33s, border-bottom-color 0.33s, background-color 0.33s;
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.Save_Load_top_button:hover {
  color: #005CAF;
  border-bottom: 5px solid #005CAF;
  font-weight: bold;
}

.Save_Load_top_button.Save_Load_top_button_on {
  font-weight: bold;
  color: #005CAF;
  border-bottom: 5px solid #005CAF;
  background-color: rgba(0, 92, 175, 0.1);
}

.Save_Load_top_button_text {
  text-align: center;
  width: 100%;
  padding: 0px 0px 3px 0px;
  border-left: 2px solid rgba(0, 0, 0, 0.1);
}

.Save_Load_top_button:first-child .Save_Load_top_button_text {
  border-left-color: transparent;
}

.Save_Load_content {
  height: 1166.4px;
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-evenly;
  align-items: center;
}

.Save_Load_content_element {
  cursor: pointer;
  background: linear-gradient(-45deg, rgba(0, 0, 0, 0.05), rgba(0, 0, 0, 0.075));
  width: 448px;
  height: 525px;
  overflow: hidden;
  animation: Load_Grid_Elements_in 1s ease-out forwards, Load_Grid_Elements_in_transform 1s ease-out;
  opacity: 0;
  border-radius: 4px;
  transition: transform 0.25s, box-shadow 0.25s;
  display: flex;
  flex-direction: column;
  border: none;
  padding: 0px;
  text-align: left;
}

.Save_Load_content_element:hover {
  transform: scale(1.05, 1.05) translate(-5.12px, -5.12px);
}

.Save_Load_content_element.Save_Load_content_element_empty {
  cursor: default;
}

.Save_Load_content_element_top {
  width: 100%;
  height: 12%;
  display: flex;
  font-family: "资源圆体", serif;
}

.Save_Load_content_element_top_index {
  color: #ffffff;
  font-size: 39.68px;
  text-align: center;
  height: 100%;
  width: 20%;
  padding: 0px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #51A8DD;
}

.Save_Load_content_element_top_date {
  font-family: "WebgalUI", serif;
  letter-spacing: 0.1em;
  padding: 12.51px 0px 0px 14.72px;
  font-size: 29.44px;
  height: 100%;
  width: 80%;
  box-sizing: border-box;
  background-color: #005CAF;
  color: #ffffff;
}

.Save_Load_content_miniPic {
  width: 100%;
  height: 48%;
  overflow: hidden;
}

.Save_Load_content_miniPic_img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.Save_Load_content_text {
  font-family: "WebgalUI", sans-serif;
  font-size: 30.72px;
  letter-spacing: 0.05em;
  color: #373C38;
  width: 100%;
  height: 40%;
  background: linear-gradient(-45deg, rgba(255, 255, 255, 0.75) 0%, rgba(255, 255, 255, 1) 100%);
  display: flex;
  flex-flow: column;
  justify-content: flex-start;
  align-items: flex-start;
}

.Save_Load_content_speaker {
  font-weight: bold;
  color: #005caf;
  padding: 10.75px 24.58px 7.68px 24.58px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  width: 100%;
  box-sizing: border-box;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.Save_Load_content_text_padding {
  width: 100%;
  padding: 6.14px 23.04px;
  box-sizing: border-box;
  overflow: hidden;
}
`.trim();
function getTotalPages(savesByIndex, currentPage) {
    let maxIndex = BASE_PAGE_COUNT * SLOTS_PER_PAGE;
    for (const [key, value] of Object.entries(savesByIndex)) {
        const idx = Number(key);
        if (value && Number.isInteger(idx) && idx > maxIndex) {
            maxIndex = idx;
        }
    }
    return Math.max(BASE_PAGE_COUNT, currentPage, Math.ceil(maxIndex / SLOTS_PER_PAGE));
}
export function LoadGrid2x5Screen(props) {
    const { visible, slPage, savesByIndex, t, playSe, onSelectPage, onLoadRange, onSlotAction } = props;
    const { rootProps } = useScreenParts('load', LOAD_GRID_PARTS, LOAD_GRID_DEFAULT_CSS);
    const safePage = Math.max(1, slPage);
    const startIndex = (safePage - 1) * SLOTS_PER_PAGE + 1;
    const endIndex = startIndex + SLOTS_PER_PAGE - 1;
    useEffect(() => {
        if (!visible)
            return;
        onLoadRange(startIndex, endIndex);
    }, [visible, startIndex, endIndex, onLoadRange]);
    const totalPages = useMemo(() => getTotalPages(savesByIndex, safePage), [savesByIndex, safePage]);
    const pages = useMemo(() => Array.from({ length: totalPages }, (_, i) => i + 1), [totalPages]);
    const slots = useMemo(() => Array.from({ length: SLOTS_PER_PAGE }, (_, i) => startIndex + i), [startIndex]);
    if (!visible)
        return null;
    return (_jsx("div", { ...rootProps, className: `${rootProps.className} Save_Load_backdrop`, children: _jsxs("div", { className: "Save_Load_main", children: [_jsxs("div", { className: "Save_Load_top", children: [_jsx("div", { className: "Save_Load_title", children: _jsx("div", { className: "Load_title_text", children: t('menu.loadSaving.title') }) }), _jsx("div", { className: "Save_Load_top_buttonList", children: pages.map((page) => {
                                const isActive = page === safePage;
                                return (_jsx("button", { type: "button", className: `Save_Load_top_button${isActive ? ' Save_Load_top_button_on' : ''}`, onMouseEnter: playSe.enter, onClick: () => {
                                        playSe.pageChange();
                                        onSelectPage(page);
                                    }, children: _jsx("div", { className: "Save_Load_top_button_text", children: page }) }, page));
                            }) })] }), _jsx("div", { className: "Save_Load_content", children: slots.map((slotIndex, order) => {
                        const save = savesByIndex[slotIndex];
                        return (_jsx("button", { type: "button", className: `Save_Load_content_element${save ? '' : ' Save_Load_content_element_empty'}`, style: { animationDelay: `${(order + 1) * 30}ms` }, onMouseEnter: playSe.enter, onClick: () => {
                                if (!save)
                                    return;
                                onSlotAction(slotIndex);
                            }, children: save ? (_jsxs(_Fragment, { children: [_jsxs("div", { className: "Save_Load_content_element_top", children: [_jsx("div", { className: "Save_Load_content_element_top_index", children: save.index }), _jsx("div", { className: "Save_Load_content_element_top_date", children: save.saveTime })] }), _jsx("div", { className: "Save_Load_content_miniPic", children: _jsx("img", { className: "Save_Load_content_miniPic_img", src: resolveScreenAssetUrl(save.previewImage), alt: "preview" }) }), _jsxs("div", { className: "Save_Load_content_text", children: [_jsx("div", { className: "Save_Load_content_speaker", children: save.nowStageState.showName === ''
                                                    ? '\u00A0'
                                                    : renderRichText(save.nowStageState.showName, { replaceSpaceWithNbsp: true }) }), _jsx("div", { className: "Save_Load_content_text_padding", children: renderRichText(save.nowStageState.showText, { replaceSpaceWithNbsp: true }) })] })] })) : null }, slotIndex));
                    }) }, `load-grid-page-${safePage}`)] }) }));
}
export const LOAD_GRID_2X5_VARIANT = {
    screen: 'load',
    variantId: 'grid-2x5',
    name: '经典双列网格',
    component: LoadGrid2x5Screen,
    parts: LOAD_GRID_PARTS,
    defaultCssText: LOAD_GRID_DEFAULT_CSS,
};

export { LOAD_GRID_PARTS as parts, LOAD_GRID_DEFAULT_CSS as defaultCssText, LoadGrid2x5Screen as Screen };
export default LoadGrid2x5Screen;
