const __WEBGAL_SDK__ = globalThis.__WEBGAL_UI_SDK__;
if (!__WEBGAL_SDK__) {
  throw new Error("WebGAL UI SDK is not initialized.");
}
const { jsx: _jsx, jsxs: _jsxs, Fragment: _Fragment } = __WEBGAL_SDK__.jsxRuntime;
const { useEffect, useMemo } = __WEBGAL_SDK__.react;
const { renderRichText, resolveScreenAssetUrl, useScreenParts } = __WEBGAL_SDK__;
const SLOTS_PER_PAGE = 6;
const BASE_PAGE_COUNT = 20;
const SAVE_LIST_PARTS = [
    { id: 'main', name: '存档页面容器', selector: '.Save_List_main', allowLayoutEdit: true },
    { id: 'top', name: '顶部栏', selector: '.Save_List_top', allowLayoutEdit: true },
    { id: 'title', name: '水印标题', selector: '.Save_List_title', allowLayoutEdit: true },
    { id: 'pageList', name: '页码栏', selector: '.Save_List_pageList', allowLayoutEdit: true },
    { id: 'pageButton', name: '页码按钮', selector: '.Save_List_pageButton', allowLayoutEdit: false },
    { id: 'content', name: '存档列表区', selector: '.Save_List_content', allowLayoutEdit: true },
    { id: 'slotRow', name: '档位行卡片', selector: '.Save_List_row', allowLayoutEdit: false },
];
const SAVE_LIST_DEFAULT_CSS = `
@keyframes Save_List_Elements_in {
  0% { opacity: 0; transform: translateY(10px); }
  100% { opacity: 1; transform: translateY(0px); }
}

.Save_List_backdrop {
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

.Save_List_main {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  cursor: default;
}

.Save_List_top {
  position: relative;
  width: 100%;
  height: 129.6px;
  display: flex;
  justify-content: center;
  flex-shrink: 0;
}

.Save_List_title {
  font-family: "思源宋体", serif;
  letter-spacing: 0.1em;
  font-size: 128px;
  min-width: 350px;
  display: flex;
  align-items: center;
  position: absolute;
  left: 20px;
  top: 0px;
  z-index: 0;
  opacity: 0.2;
  transform: translateY(-10px);
  pointer-events: none;
  font-weight: bold;
  color: transparent;
  background: linear-gradient(135deg, #77428D 0%, #B28FCE 100%);
  text-shadow: 2px 2px 15px rgba(255, 255, 255, 0.5);
  -webkit-background-clip: text;
  background-clip: text;
}

.Save_List_pageList {
  position: relative;
  z-index: 1;
  height: 100%;
  max-width: 100%;
  display: flex;
  overflow-x: auto;
}

.Save_List_pageButton {
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
  justify-content: center;
  flex-shrink: 0;
}

.Save_List_pageButton:hover {
  color: #77428D;
  border-bottom: 4px solid #77428D;
  font-weight: bold;
}

.Save_List_pageButton.Save_List_pageButton_on {
  font-weight: bold;
  color: #77428D;
  border-bottom: 4px solid #77428D;
  background-color: rgba(119, 66, 141, 0.05);
}

.Save_List_pageText {
  width: 100%;
  padding-bottom: 3px;
  border-left: 2px solid rgba(0, 0, 0, 0.1);
}

.Save_List_pageButton:first-child .Save_List_pageText {
  border-left-color: transparent;
}

.Save_List_content {
  flex: 1;
  min-height: 0px;
  padding: 28px 180px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow-y: auto;
  box-sizing: border-box;
}

.Save_List_row {
  width: 100%;
  height: 168px;
  display: flex;
  align-items: stretch;
  border: none;
  border-radius: 6px;
  padding: 0px;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.72) 0%, rgba(255, 255, 255, 0.94) 100%);
  box-shadow: 0px 0px 15px 2px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  overflow: hidden;
  text-align: left;
  flex-shrink: 0;
  animation: Save_List_Elements_in 0.45s ease-out both;
  transition: transform 0.22s, box-shadow 0.22s;
}

.Save_List_row.Save_List_row_empty {
  background: linear-gradient(-45deg, rgba(0, 0, 0, 0.04), rgba(0, 0, 0, 0.07));
}

.Save_List_row:hover {
  transform: translateX(8px);
  box-shadow: 0px 6px 20px rgba(119, 66, 141, 0.16);
}

.Save_List_rowIndex {
  width: 120px;
  flex-shrink: 0;
  background-color: #B28FCE;
  color: #ffffff;
  font-family: "资源圆体", serif;
  font-size: 42px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
}

.Save_List_row.Save_List_row_empty .Save_List_rowIndex {
  background-color: rgba(178, 143, 206, 0.45);
}

.Save_List_rowThumb {
  width: 298px;
  height: 100%;
  flex-shrink: 0;
  background: rgba(0, 0, 0, 0.04);
  overflow: hidden;
}

.Save_List_rowThumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.Save_List_rowBody {
  flex: 1;
  min-width: 0px;
  padding: 18px 34px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 10px;
  box-sizing: border-box;
}

.Save_List_rowMeta {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 24px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  padding-bottom: 8px;
}

.Save_List_rowSpeaker {
  font-size: 32px;
  font-weight: bold;
  color: #77428D;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.Save_List_rowTime {
  font-family: "WebgalUI", serif;
  font-size: 26px;
  letter-spacing: 0.08em;
  color: rgba(119, 66, 141, 0.85);
  flex-shrink: 0;
}

.Save_List_rowText {
  font-size: 29px;
  color: #373C38;
  line-height: 1.4;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
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
export function SaveListVerticalScreen(props) {
    const { visible, slPage, savesByIndex, t, playSe, onSelectPage, onLoadRange, onSlotAction } = props;
    const { rootProps } = useScreenParts('save', SAVE_LIST_PARTS, SAVE_LIST_DEFAULT_CSS);
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
    return (_jsx("div", { ...rootProps, className: `${rootProps.className} Save_List_backdrop`, children: _jsxs("div", { className: "Save_List_main", children: [_jsxs("div", { className: "Save_List_top", children: [_jsx("div", { className: "Save_List_title", children: t('menu.saving.title') }), _jsx("div", { className: "Save_List_pageList", children: pages.map((page) => {
                                const isActive = page === safePage;
                                return (_jsx("button", { type: "button", className: `Save_List_pageButton${isActive ? ' Save_List_pageButton_on' : ''}`, onMouseEnter: playSe.enter, onClick: () => {
                                        playSe.pageChange();
                                        onSelectPage(page);
                                    }, children: _jsx("span", { className: "Save_List_pageText", children: page }) }, page));
                            }) })] }), _jsx("div", { className: "Save_List_content", children: slots.map((slotIndex, order) => {
                        const save = savesByIndex[slotIndex];
                        return (_jsxs("button", { type: "button", className: `Save_List_row${save ? '' : ' Save_List_row_empty'}`, style: { animationDelay: `${order * 35}ms` }, onMouseEnter: playSe.enter, onClick: () => onSlotAction(slotIndex), children: [_jsx("div", { className: "Save_List_rowIndex", children: slotIndex }), save ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "Save_List_rowThumb", children: _jsx("img", { src: resolveScreenAssetUrl(save.previewImage), alt: "preview" }) }), _jsxs("div", { className: "Save_List_rowBody", children: [_jsxs("div", { className: "Save_List_rowMeta", children: [_jsx("span", { className: "Save_List_rowSpeaker", children: save.nowStageState.showName === ''
                                                                ? '\u00A0'
                                                                : renderRichText(save.nowStageState.showName, { replaceSpaceWithNbsp: true }) }), _jsx("span", { className: "Save_List_rowTime", children: save.saveTime })] }), _jsx("div", { className: "Save_List_rowText", children: renderRichText(save.nowStageState.showText, { replaceSpaceWithNbsp: true }) })] })] })) : null] }, slotIndex));
                    }) }, `save-list-page-${safePage}`)] }) }));
}
export const SAVE_LIST_VERTICAL_VARIANT = {
    screen: 'save',
    variantId: 'list-vertical',
    name: '单列竖向列表',
    component: SaveListVerticalScreen,
    parts: SAVE_LIST_PARTS,
    defaultCssText: SAVE_LIST_DEFAULT_CSS,
};

export { SAVE_LIST_PARTS as parts, SAVE_LIST_DEFAULT_CSS as defaultCssText, SaveListVerticalScreen as Screen };
export default SaveListVerticalScreen;
