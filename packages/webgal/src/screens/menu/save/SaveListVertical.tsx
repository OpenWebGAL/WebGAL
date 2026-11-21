import { useEffect, useMemo } from 'react';
import type { BuiltInScreenVariant, SaveScreenProps, ScreenPartDefinition } from '@/screens/contracts';
import { renderRichText, resolveScreenAssetUrl, useScreenParts } from '@/sdk/globalUiSdk';

const SLOTS_PER_PAGE = 6;
const BASE_PAGE_COUNT = 20;

const SAVE_LIST_PARTS: ScreenPartDefinition[] = [
  { id: 'backdrop', name: '页面背景', selector: '.Save_List_backdrop', kind: 'container', allowLayoutEdit: false },
  { id: 'main', name: '存档页面容器', selector: '.Save_List_main', kind: 'container', allowLayoutEdit: true },
  { id: 'top', name: '顶部栏', selector: '.Save_List_top', kind: 'container', allowLayoutEdit: true },
  { id: 'title', name: '水印标题文字', selector: '.Save_List_title', kind: 'text', allowLayoutEdit: true },
  { id: 'pageList', name: '页码栏', selector: '.Save_List_pageList', kind: 'container', allowLayoutEdit: true },
  { id: 'pageButton', name: '页码按钮', selector: '.Save_List_pageButton', kind: 'container', allowLayoutEdit: false },
  {
    id: 'pageButtonText',
    name: '页码按钮文字',
    selector: '.Save_List_pageText',
    kind: 'text',
    stateHostSelector: '.Save_List_pageButton',
    allowLayoutEdit: false,
  },
  { id: 'content', name: '存档列表区', selector: '.Save_List_content', kind: 'container', allowLayoutEdit: true },
  { id: 'slotRow', name: '档位行卡片', selector: '.Save_List_row', kind: 'container', allowLayoutEdit: false },
  { id: 'slotIndex', name: '档位序号底框', selector: '.Save_List_rowIndex', kind: 'container', allowLayoutEdit: false },
  {
    id: 'slotIndexText',
    name: '档位序号文字',
    selector: '.Save_List_rowIndex_text',
    kind: 'text',
    allowLayoutEdit: false,
  },
  { id: 'slotSpeaker', name: '角色名文本', selector: '.Save_List_rowSpeaker', kind: 'text', allowLayoutEdit: false },
  { id: 'slotTime', name: '存档时间文本', selector: '.Save_List_rowTime', kind: 'text', allowLayoutEdit: false },
  { id: 'slotText', name: '对话摘要文本', selector: '.Save_List_rowText', kind: 'text', allowLayoutEdit: false },
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
  text-align: center;
  cursor: pointer;
  width: 104.96px;
  border: 0px solid transparent;
  border-bottom: 4px solid rgba(0, 0, 0, 0);
  background: transparent;
  padding: 0px;
  transition: border-bottom-color 0.33s, background-color 0.33s;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.Save_List_pageButton:hover {
  border-bottom: 4px solid #77428D;
}

.Save_List_pageButton.active {
  border-bottom: 4px solid #77428D;
  background-color: rgba(119, 66, 141, 0.05);
}

.Save_List_pageText {
  font-size: 51.2px;
  color: rgba(0, 0, 0, 0.5);
  width: 100%;
  padding-bottom: 3px;
  border-left: 2px solid rgba(0, 0, 0, 0.1);
  transition: color 0.33s;
}

.Save_List_pageButton:hover .Save_List_pageText {
  color: #77428D;
  font-weight: bold;
}

.Save_List_pageButton.active .Save_List_pageText {
  font-weight: bold;
  color: #77428D;
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
  display: flex;
  align-items: center;
  justify-content: center;
}

.Save_List_rowIndex_text {
  color: #ffffff;
  font-family: "资源圆体", serif;
  font-size: 42px;
  font-weight: bold;
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

function getTotalPages(savesByIndex: SaveScreenProps['savesByIndex'], currentPage: number): number {
  let maxIndex = BASE_PAGE_COUNT * SLOTS_PER_PAGE;
  for (const [key, value] of Object.entries(savesByIndex)) {
    const idx = Number(key);
    if (value && Number.isInteger(idx) && idx > maxIndex) {
      maxIndex = idx;
    }
  }
  return Math.max(BASE_PAGE_COUNT, currentPage, Math.ceil(maxIndex / SLOTS_PER_PAGE));
}

export function SaveListVerticalScreen(props: SaveScreenProps) {
  const { visible, slPage, savesByIndex, t, playSe, onSelectPage, onLoadRange, onSlotAction } = props;
  const { rootProps } = useScreenParts('save', SAVE_LIST_PARTS, SAVE_LIST_DEFAULT_CSS);

  const safePage = Math.max(1, slPage);
  const startIndex = (safePage - 1) * SLOTS_PER_PAGE + 1;
  const endIndex = startIndex + SLOTS_PER_PAGE - 1;

  useEffect(() => {
    if (!visible) return;
    onLoadRange(startIndex, endIndex);
  }, [visible, startIndex, endIndex, onLoadRange]);

  const totalPages = useMemo(() => getTotalPages(savesByIndex, safePage), [savesByIndex, safePage]);
  const pages = useMemo(() => Array.from({ length: totalPages }, (_, i) => i + 1), [totalPages]);
  const slots = useMemo(() => Array.from({ length: SLOTS_PER_PAGE }, (_, i) => startIndex + i), [startIndex]);

  if (!visible) return null;

  return (
    <div {...rootProps} className={`${rootProps.className} Save_List_backdrop`}>
      <div className="Save_List_main">
        <div className="Save_List_top">
          <div className="Save_List_title">{t('menu.saving.title')}</div>
          <div className="Save_List_pageList">
            {pages.map((page) => {
              const isActive = page === safePage;
              return (
                <button
                  key={page}
                  type="button"
                  className={`Save_List_pageButton${isActive ? ' active' : ''}`}
                  onMouseEnter={playSe.enter}
                  onClick={() => {
                    playSe.pageChange();
                    onSelectPage(page);
                  }}
                >
                  <span className="Save_List_pageText">{page}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="Save_List_content" key={`save-list-page-${safePage}`}>
          {slots.map((slotIndex, order) => {
            const save = savesByIndex[slotIndex];
            return (
              <button
                key={slotIndex}
                type="button"
                className={`Save_List_row${save ? '' : ' Save_List_row_empty'}`}
                style={{ animationDelay: `${order * 35}ms` }}
                onMouseEnter={playSe.enter}
                onClick={() => onSlotAction(slotIndex)}
              >
                <div className="Save_List_rowIndex">
                  <span className="Save_List_rowIndex_text">{slotIndex}</span>
                </div>
                {save ? (
                  <>
                    <div className="Save_List_rowThumb">
                      <img src={resolveScreenAssetUrl(save.previewImage)} alt="preview" />
                    </div>
                    <div className="Save_List_rowBody">
                      <div className="Save_List_rowMeta">
                        <span className="Save_List_rowSpeaker">
                          {save.nowStageState.showName === ''
                            ? '\u00A0'
                            : renderRichText(save.nowStageState.showName, { replaceSpaceWithNbsp: true })}
                        </span>
                        <span className="Save_List_rowTime">{save.saveTime}</span>
                      </div>
                      <div className="Save_List_rowText">
                        {renderRichText(save.nowStageState.showText, { replaceSpaceWithNbsp: true })}
                      </div>
                    </div>
                  </>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export const SAVE_LIST_VERTICAL_VARIANT: BuiltInScreenVariant<SaveScreenProps> = {
  screen: 'save',
  variantId: 'list-vertical',
  name: '单列竖向列表',
  component: SaveListVerticalScreen,
  parts: SAVE_LIST_PARTS,
  defaultCssText: SAVE_LIST_DEFAULT_CSS,
};
