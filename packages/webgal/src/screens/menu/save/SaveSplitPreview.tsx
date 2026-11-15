import { useEffect, useMemo, useState } from 'react';
import type { BuiltInScreenVariant, SaveScreenProps, ScreenPartDefinition } from '@/screens/contracts';
import { renderRichText, resolveScreenAssetUrl, useScreenParts } from '@/sdk/globalUiSdk';

const SLOTS_PER_PAGE = 12;
const BASE_PAGE_COUNT = 20;

const SAVE_SPLIT_PARTS: ScreenPartDefinition[] = [
  { id: 'main', name: '存档页面容器', selector: '.Save_Split_main', allowLayoutEdit: true },
  { id: 'top', name: '顶部栏', selector: '.Save_Split_top', allowLayoutEdit: true },
  { id: 'title', name: '水印标题', selector: '.Save_Split_title', allowLayoutEdit: true },
  { id: 'pageList', name: '页码栏', selector: '.Save_Split_pageList', allowLayoutEdit: true },
  { id: 'pageButton', name: '页码按钮', selector: '.Save_Split_pageButton', allowLayoutEdit: false },
  { id: 'previewPane', name: '左侧大图预览', selector: '.Save_Split_preview', allowLayoutEdit: true },
  { id: 'content', name: '右侧档位区', selector: '.Save_Split_grid', allowLayoutEdit: true },
  { id: 'slotCard', name: '紧凑档位卡', selector: '.Save_Split_card', allowLayoutEdit: false },
];

const SAVE_SPLIT_DEFAULT_CSS = `
.Save_Split_backdrop {
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

.Save_Split_main {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  cursor: default;
}

.Save_Split_top {
  position: relative;
  width: 100%;
  height: 129.6px;
  display: flex;
  justify-content: center;
  flex-shrink: 0;
}

.Save_Split_title {
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

.Save_Split_pageList {
  position: relative;
  z-index: 1;
  height: 100%;
  max-width: 100%;
  display: flex;
  overflow-x: auto;
}

.Save_Split_pageButton {
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

.Save_Split_pageButton:hover {
  color: #77428D;
  border-bottom: 4px solid #77428D;
  font-weight: bold;
}

.Save_Split_pageButton.Save_Split_pageButton_on {
  font-weight: bold;
  color: #77428D;
  border-bottom: 4px solid #77428D;
  background-color: rgba(119, 66, 141, 0.05);
}

.Save_Split_pageText {
  width: 100%;
  padding-bottom: 3px;
  border-left: 2px solid rgba(0, 0, 0, 0.1);
}

.Save_Split_pageButton:first-child .Save_Split_pageText {
  border-left-color: transparent;
}

.Save_Split_body {
  flex: 1;
  min-height: 0px;
  padding: 36px 96px;
  display: flex;
  gap: 56px;
  box-sizing: border-box;
}

.Save_Split_preview {
  width: 960px;
  height: 100%;
  flex-shrink: 0;
  border-radius: 6px;
  overflow: hidden;
  background: linear-gradient(-45deg, rgba(255, 255, 255, 0.72) 0%, rgba(255, 255, 255, 0.96) 100%);
  box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
}

.Save_Split_previewTop {
  height: 76px;
  display: flex;
  font-family: "资源圆体", serif;
}

.Save_Split_previewIndex {
  width: 150px;
  background-color: #B28FCE;
  color: #ffffff;
  font-size: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.Save_Split_previewTime {
  flex: 1;
  font-family: "WebgalUI", serif;
  font-size: 30px;
  letter-spacing: 0.08em;
  color: #77428D;
  padding: 0px 28px;
  display: flex;
  align-items: center;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 1) 100%);
}

.Save_Split_previewImgWrap {
  width: 100%;
  height: 540px;
  background: rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.Save_Split_previewImgWrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.Save_Split_previewBody {
  flex: 1;
  padding: 28px 36px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  box-sizing: border-box;
  overflow: hidden;
}

.Save_Split_previewSpeaker {
  font-size: 38px;
  font-weight: bold;
  color: #77428D;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.Save_Split_previewText {
  font-size: 32px;
  line-height: 1.6;
  color: #373C38;
  overflow: hidden;
}

.Save_Split_grid {
  flex: 1;
  min-width: 0px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(4, 1fr);
  gap: 24px;
}

.Save_Split_card {
  border: 2px solid transparent;
  border-radius: 4px;
  padding: 0px;
  background: linear-gradient(-45deg, rgba(0, 0, 0, 0.05), rgba(0, 0, 0, 0.08));
  box-shadow: 0px 0px 12px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  text-align: left;
  transition: transform 0.22s, box-shadow 0.22s, border-color 0.22s;
}

.Save_Split_card:hover,
.Save_Split_card.Save_Split_card_selected {
  transform: translateY(-4px);
  border-color: #77428D;
  box-shadow: 0px 8px 22px rgba(119, 66, 141, 0.18);
}

.Save_Split_cardTop {
  height: 46px;
  display: flex;
  font-family: "资源圆体", serif;
}

.Save_Split_cardIndex {
  width: 84px;
  background-color: #B28FCE;
  color: #ffffff;
  font-size: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.Save_Split_cardDate {
  flex: 1;
  font-family: "WebgalUI", serif;
  font-size: 22px;
  color: #77428D;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0.98) 100%);
  padding: 0px 14px;
  display: flex;
  align-items: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.Save_Split_cardThumb {
  flex: 1;
  min-height: 0px;
  width: 100%;
  background: rgba(255, 255, 255, 0.55);
  overflow: hidden;
}

.Save_Split_cardThumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.Save_Split_cardFooter {
  height: 54px;
  padding: 0px 16px;
  background: rgba(255, 255, 255, 0.94);
  font-size: 24px;
  font-weight: bold;
  color: #373C38;
  display: flex;
  align-items: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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

export function SaveSplitPreviewScreen(props: SaveScreenProps) {
  const { visible, slPage, savesByIndex, t, playSe, onSelectPage, onLoadRange, onSlotAction } = props;
  const { rootProps } = useScreenParts('save', SAVE_SPLIT_PARTS, SAVE_SPLIT_DEFAULT_CSS);

  const safePage = Math.max(1, slPage);
  const startIndex = (safePage - 1) * SLOTS_PER_PAGE + 1;
  const endIndex = startIndex + SLOTS_PER_PAGE - 1;
  const [previewSlotIndex, setPreviewSlotIndex] = useState<number>(startIndex);

  useEffect(() => {
    if (!visible) return;
    onLoadRange(startIndex, endIndex);
  }, [visible, startIndex, endIndex, onLoadRange]);

  const totalPages = useMemo(() => getTotalPages(savesByIndex, safePage), [savesByIndex, safePage]);
  const pages = useMemo(() => Array.from({ length: totalPages }, (_, i) => i + 1), [totalPages]);
  const slots = useMemo(() => Array.from({ length: SLOTS_PER_PAGE }, (_, i) => startIndex + i), [startIndex]);

  useEffect(() => {
    const firstOccupied = slots.find((idx) => Boolean(savesByIndex[idx]));
    setPreviewSlotIndex(firstOccupied ?? startIndex);
  }, [safePage, startIndex]);

  if (!visible) return null;

  const activeSlot = slots.includes(previewSlotIndex) ? previewSlotIndex : startIndex;
  const previewSave = savesByIndex[activeSlot];

  return (
    <div {...rootProps} className={`${rootProps.className} Save_Split_backdrop`}>
      <div className="Save_Split_main">
        <div className="Save_Split_top">
          <div className="Save_Split_title">{t('menu.saving.title')}</div>
          <div className="Save_Split_pageList">
            {pages.map((page) => {
              const isActive = page === safePage;
              return (
                <button
                  key={page}
                  type="button"
                  className={`Save_Split_pageButton${isActive ? ' Save_Split_pageButton_on' : ''}`}
                  onMouseEnter={playSe.enter}
                  onClick={() => {
                    playSe.pageChange();
                    onSelectPage(page);
                  }}
                >
                  <span className="Save_Split_pageText">{page}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="Save_Split_body">
          <div className="Save_Split_preview">
            {previewSave ? (
              <>
                <div className="Save_Split_previewTop">
                  <div className="Save_Split_previewIndex">{previewSave.index}</div>
                  <div className="Save_Split_previewTime">{previewSave.saveTime}</div>
                </div>
                <div className="Save_Split_previewImgWrap">
                  <img src={resolveScreenAssetUrl(previewSave.previewImage)} alt="preview" />
                </div>
                <div className="Save_Split_previewBody">
                  <div className="Save_Split_previewSpeaker">
                    {previewSave.nowStageState.showName === ''
                      ? '\u00A0'
                      : renderRichText(previewSave.nowStageState.showName, { replaceSpaceWithNbsp: true })}
                  </div>
                  <div className="Save_Split_previewText">
                    {renderRichText(previewSave.nowStageState.showText, { replaceSpaceWithNbsp: true })}
                  </div>
                </div>
              </>
            ) : (
              <div className="Save_Split_previewTop">
                <div className="Save_Split_previewIndex">{activeSlot}</div>
                <div className="Save_Split_previewTime">{t('gaming.noSaving')}</div>
              </div>
            )}
          </div>

          <div className="Save_Split_grid">
            {slots.map((slotIndex) => {
              const save = savesByIndex[slotIndex];
              const isSelected = slotIndex === activeSlot;
              return (
                <button
                  key={slotIndex}
                  type="button"
                  className={`Save_Split_card${isSelected ? ' Save_Split_card_selected' : ''}`}
                  onMouseEnter={() => {
                    playSe.enter();
                    setPreviewSlotIndex(slotIndex);
                  }}
                  onFocus={() => setPreviewSlotIndex(slotIndex)}
                  onClick={() => onSlotAction(slotIndex)}
                >
                  {save ? (
                    <>
                      <div className="Save_Split_cardTop">
                        <div className="Save_Split_cardIndex">{save.index}</div>
                        <div className="Save_Split_cardDate">{save.saveTime}</div>
                      </div>
                      <div className="Save_Split_cardThumb">
                        <img src={resolveScreenAssetUrl(save.previewImage)} alt="preview" />
                      </div>
                      <div className="Save_Split_cardFooter">
                        {save.nowStageState.showName === ''
                          ? '\u00A0'
                          : renderRichText(save.nowStageState.showName, { replaceSpaceWithNbsp: true })}
                      </div>
                    </>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export const SAVE_SPLIT_PREVIEW_VARIANT: BuiltInScreenVariant<SaveScreenProps> = {
  screen: 'save',
  variantId: 'split-preview',
  name: '分栏大图预览',
  component: SaveSplitPreviewScreen,
  parts: SAVE_SPLIT_PARTS,
  defaultCssText: SAVE_SPLIT_DEFAULT_CSS,
};
