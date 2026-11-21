import { useEffect, useMemo } from 'react';
import type { BuiltInScreenVariant, SaveScreenProps, ScreenPartDefinition } from '@/screens/contracts';
import { renderRichText, resolveScreenAssetUrl, useScreenParts } from '@/sdk/globalUiSdk';

const SLOTS_PER_PAGE = 10;
const BASE_PAGE_COUNT = 20;

const SAVE_GRID_PARTS: ScreenPartDefinition[] = [
  { id: 'backdrop', name: '页面背景', selector: '.Save_Load_backdrop', kind: 'container', allowLayoutEdit: false },
  { id: 'main', name: '存档页面容器', selector: '.Save_Load_main', kind: 'container', allowLayoutEdit: true },
  { id: 'top', name: '顶部栏', selector: '.Save_Load_top', kind: 'container', allowLayoutEdit: true },
  { id: 'title', name: '水印标题容器', selector: '.Save_Load_title', kind: 'container', allowLayoutEdit: true },
  { id: 'titleText', name: '水印标题文字', selector: '.Save_title_text', kind: 'text', allowLayoutEdit: false },
  { id: 'pageList', name: '页码栏', selector: '.Save_Load_top_buttonList', kind: 'container', allowLayoutEdit: true },
  { id: 'pageButton', name: '页码按钮', selector: '.Save_Load_top_button', kind: 'container', allowLayoutEdit: false },
  {
    id: 'pageButtonText',
    name: '页码按钮文字',
    selector: '.Save_Load_top_button_text',
    kind: 'text',
    stateHostSelector: '.Save_Load_top_button',
    allowLayoutEdit: false,
  },
  { id: 'content', name: '存档网格区', selector: '.Save_Load_content', kind: 'container', allowLayoutEdit: true },
  {
    id: 'slotCard',
    name: '存档卡片',
    selector: '.Save_Load_content_element',
    kind: 'container',
    allowLayoutEdit: false,
  },
  {
    id: 'slotIndex',
    name: '档位序号底框',
    selector: '.Save_Load_content_element_top_index',
    kind: 'container',
    allowLayoutEdit: false,
  },
  {
    id: 'slotIndexText',
    name: '档位序号文字',
    selector: '.Save_Load_content_element_top_index_text',
    kind: 'text',
    allowLayoutEdit: false,
  },
  {
    id: 'slotTime',
    name: '存档时间底框',
    selector: '.Save_Load_content_element_top_date',
    kind: 'container',
    allowLayoutEdit: false,
  },
  {
    id: 'slotTimeText',
    name: '存档时间文字',
    selector: '.Save_Load_content_element_top_date_text',
    kind: 'text',
    allowLayoutEdit: false,
  },
  {
    id: 'slotPreview',
    name: '存档缩略图',
    selector: '.Save_Load_content_miniPic',
    kind: 'container',
    allowLayoutEdit: false,
  },
  {
    id: 'slotBody',
    name: '文本区底框',
    selector: '.Save_Load_content_text',
    kind: 'container',
    allowLayoutEdit: false,
  },
  {
    id: 'slotSpeaker',
    name: '角色名文本',
    selector: '.Save_Load_content_speaker',
    kind: 'text',
    allowLayoutEdit: false,
  },
  {
    id: 'slotText',
    name: '对话摘要文本',
    selector: '.Save_Load_content_text_padding',
    kind: 'text',
    allowLayoutEdit: false,
  },
];

const SAVE_GRID_DEFAULT_CSS = `
@keyframes Save_Grid_Elements_in {
  0% { opacity: 0; }
  100% { opacity: 1; }
}

@keyframes Save_Grid_Elements_in_transform {
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
  animation: Save_Grid_Elements_in 1s ease-out forwards;
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

.Save_title_text {
  font-weight: bold;
  color: transparent;
  background: linear-gradient(135deg, #77428D 0%, #B28FCE 100%);
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
  flex-shrink: 0;
}

.Save_Load_top_button:hover {
  border-bottom: 4px solid #77428D;
}

.Save_Load_top_button.active {
  border-bottom: 4px solid #77428D;
  background-color: rgba(119, 66, 141, 0.05);
}

.Save_Load_top_button_text {
  font-size: 51.2px;
  color: rgba(0, 0, 0, 0.5);
  text-align: center;
  width: 100%;
  padding: 0px 0px 3px 0px;
  border-left: 2px solid rgba(0, 0, 0, 0.1);
  transition: color 0.33s;
}

.Save_Load_top_button:hover .Save_Load_top_button_text {
  color: #77428D;
  font-weight: bold;
}

.Save_Load_top_button.active .Save_Load_top_button_text {
  font-weight: bold;
  color: #77428D;
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
  animation: Save_Grid_Elements_in 1s ease-out forwards, Save_Grid_Elements_in_transform 1s ease-out;
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

.Save_Load_content_element_top {
  width: 100%;
  height: 12%;
  display: flex;
  font-family: "资源圆体", serif;
}

.Save_Load_content_element_top_index {
  text-align: center;
  height: 100%;
  width: 20%;
  padding: 0px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #B28FCE;
}

.Save_Load_content_element_top_index_text {
  color: #ffffff;
  font-size: 39.68px;
}

.Save_Load_content_element_top_date {
  padding: 12.51px 0px 0px 14.72px;
  height: 100%;
  width: 80%;
  box-sizing: border-box;
  background-color: #77428D;
}

.Save_Load_content_element_top_date_text {
  font-family: "WebgalUI", serif;
  letter-spacing: 0.1em;
  font-size: 29.44px;
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
  width: 100%;
  height: 40%;
  background: linear-gradient(-45deg, rgba(255, 255, 255, 0.75) 0%, rgba(255, 255, 255, 1) 100%);
  display: flex;
  flex-flow: column;
  justify-content: flex-start;
  align-items: flex-start;
}

.Save_Load_content_speaker {
  font-size: 30.72px;
  letter-spacing: 0.05em;
  font-weight: bold;
  color: #77428D;
  padding: 10.75px 24.58px 7.68px 24.58px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  width: 100%;
  box-sizing: border-box;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.Save_Load_content_text_padding {
  font-size: 30.72px;
  letter-spacing: 0.05em;
  color: #373C38;
  width: 100%;
  padding: 6.14px 23.04px;
  box-sizing: border-box;
  overflow: hidden;
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

export function SaveGrid2x5Screen(props: SaveScreenProps) {
  const { visible, slPage, savesByIndex, t, playSe, onSelectPage, onLoadRange, onSlotAction } = props;
  const { rootProps } = useScreenParts('save', SAVE_GRID_PARTS, SAVE_GRID_DEFAULT_CSS);

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
    <div {...rootProps} className={`${rootProps.className} Save_Load_backdrop`}>
      <div className="Save_Load_main">
        <div className="Save_Load_top">
          <div className="Save_Load_title">
            <div className="Save_title_text">{t('menu.saving.title')}</div>
          </div>
          <div className="Save_Load_top_buttonList">
            {pages.map((page) => {
              const isActive = page === safePage;
              return (
                <button
                  key={page}
                  type="button"
                  className={`Save_Load_top_button${isActive ? ' active' : ''}`}
                  onMouseEnter={playSe.enter}
                  onClick={() => {
                    playSe.pageChange();
                    onSelectPage(page);
                  }}
                >
                  <div className="Save_Load_top_button_text">{page}</div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="Save_Load_content" key={`save-grid-page-${safePage}`}>
          {slots.map((slotIndex, order) => {
            const save = savesByIndex[slotIndex];
            return (
              <button
                key={slotIndex}
                type="button"
                className="Save_Load_content_element"
                style={{ animationDelay: `${(order + 1) * 30}ms` }}
                onMouseEnter={playSe.enter}
                onClick={() => onSlotAction(slotIndex)}
              >
                {save ? (
                  <>
                    <div className="Save_Load_content_element_top">
                      <div className="Save_Load_content_element_top_index">
                        <span className="Save_Load_content_element_top_index_text">{save.index}</span>
                      </div>
                      <div className="Save_Load_content_element_top_date">
                        <span className="Save_Load_content_element_top_date_text">{save.saveTime}</span>
                      </div>
                    </div>
                    <div className="Save_Load_content_miniPic">
                      <img
                        className="Save_Load_content_miniPic_img"
                        src={resolveScreenAssetUrl(save.previewImage)}
                        alt="preview"
                      />
                    </div>
                    <div className="Save_Load_content_text">
                      <div className="Save_Load_content_speaker">
                        {save.nowStageState.showName === ''
                          ? '\u00A0'
                          : renderRichText(save.nowStageState.showName, { replaceSpaceWithNbsp: true })}
                      </div>
                      <div className="Save_Load_content_text_padding">
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

export const SAVE_GRID_2X5_VARIANT: BuiltInScreenVariant<SaveScreenProps> = {
  screen: 'save',
  variantId: 'grid-2x5',
  name: '经典双列网格',
  component: SaveGrid2x5Screen,
  parts: SAVE_GRID_PARTS,
  defaultCssText: SAVE_GRID_DEFAULT_CSS,
};
