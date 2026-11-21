import { useEffect, useMemo } from 'react';
import type { BuiltInScreenVariant, LoadScreenProps, ScreenPartDefinition } from '@/screens/contracts';
import { renderRichText, resolveScreenAssetUrl, useScreenParts } from '@/sdk/globalUiSdk';

const SLOTS_PER_PAGE = 6;
const BASE_PAGE_COUNT = 20;

const LOAD_LIST_PARTS: ScreenPartDefinition[] = [
  { id: 'backdrop', name: '页面背景', selector: '.Load_List_backdrop', kind: 'container', allowLayoutEdit: false },
  { id: 'main', name: '读档页面容器', selector: '.Load_List_main', kind: 'container', allowLayoutEdit: true },
  { id: 'top', name: '顶部栏', selector: '.Load_List_top', kind: 'container', allowLayoutEdit: true },
  { id: 'title', name: '水印标题文字', selector: '.Load_List_title', kind: 'text', allowLayoutEdit: true },
  { id: 'pageList', name: '页码栏', selector: '.Load_List_pageList', kind: 'container', allowLayoutEdit: true },
  { id: 'pageButton', name: '页码按钮', selector: '.Load_List_pageButton', kind: 'container', allowLayoutEdit: false },
  {
    id: 'pageButtonText',
    name: '页码按钮文字',
    selector: '.Load_List_pageText',
    kind: 'text',
    stateHostSelector: '.Load_List_pageButton',
    allowLayoutEdit: false,
  },
  { id: 'content', name: '读档列表区', selector: '.Load_List_content', kind: 'container', allowLayoutEdit: true },
  { id: 'slotRow', name: '档位行卡片', selector: '.Load_List_row', kind: 'container', allowLayoutEdit: false },
  { id: 'slotIndex', name: '档位序号底框', selector: '.Load_List_rowIndex', kind: 'container', allowLayoutEdit: false },
  {
    id: 'slotIndexText',
    name: '档位序号文字',
    selector: '.Load_List_rowIndex_text',
    kind: 'text',
    allowLayoutEdit: false,
  },
  { id: 'slotSpeaker', name: '角色名文本', selector: '.Load_List_rowSpeaker', kind: 'text', allowLayoutEdit: false },
  { id: 'slotTime', name: '存档时间文本', selector: '.Load_List_rowTime', kind: 'text', allowLayoutEdit: false },
  { id: 'slotText', name: '对话摘要文本', selector: '.Load_List_rowText', kind: 'text', allowLayoutEdit: false },
];

const LOAD_LIST_DEFAULT_CSS = `
@keyframes Load_List_Elements_in {
  0% { opacity: 0; transform: translateY(10px); }
  100% { opacity: 1; transform: translateY(0px); }
}

.Load_List_backdrop {
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

.Load_List_main {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  cursor: default;
}

.Load_List_top {
  position: relative;
  width: 100%;
  height: 129.6px;
  display: flex;
  justify-content: center;
  flex-shrink: 0;
}

.Load_List_title {
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
  background: linear-gradient(135deg, #005CAF 0%, #2EA9DF 100%);
  text-shadow: 2px 2px 15px rgba(255, 255, 255, 0.5);
  -webkit-background-clip: text;
  background-clip: text;
}

.Load_List_pageList {
  position: relative;
  z-index: 1;
  height: 100%;
  max-width: 100%;
  display: flex;
  overflow-x: auto;
}

.Load_List_pageButton {
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

.Load_List_pageButton:hover {
  border-bottom: 5px solid #005CAF;
}

.Load_List_pageButton.active {
  border-bottom: 5px solid #005CAF;
  background-color: rgba(0, 92, 175, 0.1);
}

.Load_List_pageText {
  font-size: 51.2px;
  color: rgba(0, 0, 0, 0.5);
  width: 100%;
  padding-bottom: 3px;
  border-left: 2px solid rgba(0, 0, 0, 0.1);
  transition: color 0.33s;
}

.Load_List_pageButton:hover .Load_List_pageText {
  color: #005CAF;
  font-weight: bold;
}

.Load_List_pageButton.active .Load_List_pageText {
  font-weight: bold;
  color: #005CAF;
}

.Load_List_pageButton:first-child .Load_List_pageText {
  border-left-color: transparent;
}

.Load_List_content {
  flex: 1;
  min-height: 0px;
  padding: 28px 180px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow-y: auto;
  box-sizing: border-box;
}

.Load_List_row {
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
  animation: Load_List_Elements_in 0.45s ease-out both;
  transition: transform 0.22s, box-shadow 0.22s;
}

.Load_List_row.Load_List_row_empty {
  background: linear-gradient(-45deg, rgba(0, 0, 0, 0.04), rgba(0, 0, 0, 0.07));
  cursor: default;
}

.Load_List_row:not(.Load_List_row_empty):hover {
  transform: translateX(8px);
  box-shadow: 0px 6px 20px rgba(0, 92, 175, 0.16);
}

.Load_List_rowIndex {
  width: 120px;
  flex-shrink: 0;
  background-color: #51A8DD;
  display: flex;
  align-items: center;
  justify-content: center;
}

.Load_List_rowIndex_text {
  color: #ffffff;
  font-family: "资源圆体", serif;
  font-size: 42px;
  font-weight: bold;
}

.Load_List_row.Load_List_row_empty .Load_List_rowIndex {
  background-color: rgba(81, 168, 221, 0.42);
}

.Load_List_rowThumb {
  width: 298px;
  height: 100%;
  flex-shrink: 0;
  background: rgba(0, 0, 0, 0.04);
  overflow: hidden;
}

.Load_List_rowThumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.Load_List_rowBody {
  flex: 1;
  min-width: 0px;
  padding: 18px 34px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 10px;
  box-sizing: border-box;
}

.Load_List_rowMeta {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 24px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  padding-bottom: 8px;
}

.Load_List_rowSpeaker {
  font-size: 32px;
  font-weight: bold;
  color: #005CAF;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.Load_List_rowTime {
  font-family: "WebgalUI", serif;
  font-size: 26px;
  letter-spacing: 0.08em;
  color: rgba(0, 92, 175, 0.85);
  flex-shrink: 0;
}

.Load_List_rowText {
  font-size: 29px;
  color: #373C38;
  line-height: 1.4;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
`.trim();

function getTotalPages(savesByIndex: LoadScreenProps['savesByIndex'], currentPage: number): number {
  let maxIndex = BASE_PAGE_COUNT * SLOTS_PER_PAGE;
  for (const [key, value] of Object.entries(savesByIndex)) {
    const idx = Number(key);
    if (value && Number.isInteger(idx) && idx > maxIndex) {
      maxIndex = idx;
    }
  }
  return Math.max(BASE_PAGE_COUNT, currentPage, Math.ceil(maxIndex / SLOTS_PER_PAGE));
}

export function LoadListVerticalScreen(props: LoadScreenProps) {
  const { visible, slPage, savesByIndex, t, playSe, onSelectPage, onLoadRange, onSlotAction } = props;
  const { rootProps } = useScreenParts('load', LOAD_LIST_PARTS, LOAD_LIST_DEFAULT_CSS);

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
    <div {...rootProps} className={`${rootProps.className} Load_List_backdrop`}>
      <div className="Load_List_main">
        <div className="Load_List_top">
          <div className="Load_List_title">{t('menu.loadSaving.title')}</div>
          <div className="Load_List_pageList">
            {pages.map((page) => {
              const isActive = page === safePage;
              return (
                <button
                  key={page}
                  type="button"
                  className={`Load_List_pageButton${isActive ? ' active' : ''}`}
                  onMouseEnter={playSe.enter}
                  onClick={() => {
                    playSe.pageChange();
                    onSelectPage(page);
                  }}
                >
                  <span className="Load_List_pageText">{page}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="Load_List_content" key={`load-list-page-${safePage}`}>
          {slots.map((slotIndex, order) => {
            const save = savesByIndex[slotIndex];
            return (
              <button
                key={slotIndex}
                type="button"
                className={`Load_List_row${save ? '' : ' Load_List_row_empty'}`}
                style={{ animationDelay: `${order * 35}ms` }}
                onMouseEnter={playSe.enter}
                onClick={() => {
                  if (!save) return;
                  onSlotAction(slotIndex);
                }}
              >
                <div className="Load_List_rowIndex">
                  <span className="Load_List_rowIndex_text">{slotIndex}</span>
                </div>
                {save ? (
                  <>
                    <div className="Load_List_rowThumb">
                      <img src={resolveScreenAssetUrl(save.previewImage)} alt="preview" />
                    </div>
                    <div className="Load_List_rowBody">
                      <div className="Load_List_rowMeta">
                        <span className="Load_List_rowSpeaker">
                          {save.nowStageState.showName === ''
                            ? '\u00A0'
                            : renderRichText(save.nowStageState.showName, { replaceSpaceWithNbsp: true })}
                        </span>
                        <span className="Load_List_rowTime">{save.saveTime}</span>
                      </div>
                      <div className="Load_List_rowText">
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

export const LOAD_LIST_VERTICAL_VARIANT: BuiltInScreenVariant<LoadScreenProps> = {
  screen: 'load',
  variantId: 'list-vertical',
  name: '单列竖向列表',
  component: LoadListVerticalScreen,
  parts: LOAD_LIST_PARTS,
  defaultCssText: LOAD_LIST_DEFAULT_CSS,
};
