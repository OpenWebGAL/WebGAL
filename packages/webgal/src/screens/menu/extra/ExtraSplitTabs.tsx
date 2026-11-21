import { useMemo, useState, type CSSProperties } from 'react';
import { CloseSmall, GoEnd, GoStart, Left, Music, Picture, PlayOne, Right, SquareSmall } from '@icon-park/react';
import type { BuiltInScreenVariant, ExtraScreenProps, ScreenPartDefinition } from '@/screens/contracts';
import { resolveScreenAssetUrl, useScreenParts } from '@/sdk/globalUiSdk';

const CG_PER_PAGE = 8;

const EXTRA_SPLIT_PARTS: ScreenPartDefinition[] = [
  { id: 'main', name: '鉴赏页面容器', selector: '.Extra_Split_main', kind: 'container', allowLayoutEdit: true },
  { id: 'top', name: '顶部切换栏', selector: '.Extra_Split_top', kind: 'container', allowLayoutEdit: true },
  { id: 'title', name: '顶部标题文字', selector: '.Extra_Split_title', kind: 'text', allowLayoutEdit: false },
  { id: 'tabButton', name: '分类切换按钮', selector: '.Extra_Split_tab', kind: 'container', allowLayoutEdit: false },
  {
    id: 'tabButtonText',
    name: '分类切换文字',
    selector: '.Extra_Split_tabText',
    kind: 'text',
    stateHostSelector: '.Extra_Split_tab',
    allowLayoutEdit: false,
  },
  {
    id: 'cgPageButton',
    name: 'CG 分页按钮',
    selector: '.Extra_Split_pageBtn',
    kind: 'container',
    allowLayoutEdit: false,
  },
  {
    id: 'cgPageButtonText',
    name: 'CG 分页文字',
    selector: '.Extra_Split_pageBtn_text',
    kind: 'text',
    stateHostSelector: '.Extra_Split_pageBtn',
    allowLayoutEdit: false,
  },
  { id: 'cgGrid', name: 'CG 画廊区', selector: '.Extra_Split_cgGrid', kind: 'container', allowLayoutEdit: true },
  { id: 'cgCard', name: 'CG 卡片', selector: '.Extra_Split_cgCard', kind: 'container', allowLayoutEdit: false },
  { id: 'bgmPanel', name: '音乐厅区域', selector: '.Extra_Split_bgmPanel', kind: 'container', allowLayoutEdit: true },
  { id: 'bgmNow', name: '当前曲目文字', selector: '.Extra_Split_bgmNow', kind: 'text', allowLayoutEdit: false },
  { id: 'bgmItem', name: '曲目列表项', selector: '.Extra_Split_bgmItem', kind: 'container', allowLayoutEdit: false },
  {
    id: 'bgmItemText',
    name: '曲目列表文字',
    selector: '.Extra_Split_bgmItem_text',
    kind: 'text',
    stateHostSelector: '.Extra_Split_bgmItem',
    allowLayoutEdit: false,
  },
];

const EXTRA_SPLIT_DEFAULT_CSS = `
@keyframes Extra_Split_cgSoftIn {
  0% {
    opacity: 0;
    transform: scale(1.15, 1.15) translate(-50px, -125px) rotateX(-25deg) rotateY(25deg);
  }
  70% {
    opacity: 1;
    transform: scale(1, 1) translate3d(0px, 0px, 0px);
  }
  100% {
    opacity: 1;
    transform: scale(1, 1) translate3d(0px, 0px, 0px);
  }
}

@keyframes Extra_Split_cgStackIn {
  0% {
    opacity: 0;
    transform: var(--cg-stack-start-transform, translate(0px, 0px));
  }
  20% {
    opacity: 1;
  }
  100% {
    opacity: 1;
    transform: var(--cg-stack-end-transform, translate(0px, 0px));
  }
}

@keyframes Extra_Split_fullCgIn {
  0% {
    opacity: 0;
    transform: scale(1.05, 1.05) translate(-25px, -50px) rotateX(-10deg) rotateY(10deg);
  }
  100% {
    opacity: 1;
    transform: scale(1, 1) translate3d(0px, 0px, 0px);
  }
}

.Extra_Split_main {
  position: absolute;
  left: 0px;
  top: 0px;
  width: 2560px;
  height: 1440px;
  z-index: 14;
  background-image: linear-gradient(135deg, #93a5cf 0%, #e4efe9 100%);
  box-sizing: border-box;
  padding: 51.2px 96px;
  display: flex;
  flex-direction: column;
  cursor: default;
}

.Extra_Split_top {
  height: 124px;
  display: flex;
  align-items: center;
  gap: 20px;
  flex-shrink: 0;
}

.Extra_Split_close {
  cursor: pointer;
  padding: 15.36px;
  border-radius: 1000px;
  border: none;
  background: transparent;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 0;
  transition: background 0.33s;
}

.Extra_Split_close > span {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 0;
}

.Extra_Split_close:hover {
  background: rgba(0, 0, 0, 0.25);
}

.Extra_Split_title {
  font-family: "思源宋体", serif;
  font-size: 83.2px;
  font-weight: bold;
  color: transparent;
  background: linear-gradient(150deg, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 1) 75%, #51A8DD 100%);
  -webkit-background-clip: text;
  background-clip: text;
  letter-spacing: 0.06em;
}

.Extra_Split_tabs {
  margin-left: auto;
  display: flex;
  gap: 20px;
}

.Extra_Split_tab {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 16px 40px;
  border-radius: 7px;
  border: none;
  background: rgba(255, 255, 255, 0.5);
  color: #556270;
  line-height: 1;
  cursor: pointer;
  transition: background-color 0.25s, color 0.25s, transform 0.2s;
}

.Extra_Split_tabIcon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 0;
}

.Extra_Split_tabIcon > span {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 0;
}

.Extra_Split_tab:hover {
  background: rgba(255, 255, 255, 0.85);
  color: #005CAF;
}

.Extra_Split_tab.active {
  background: rgba(255, 255, 255, 0.85);
  color: #005CAF;
}

.Extra_Split_tabText {
  font-size: 36px;
  font-weight: bold;
  line-height: 1;
}

.Extra_Split_body {
  flex: 1;
  min-height: 0px;
  padding-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.Extra_Split_pages {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.Extra_Split_pageBtn {
  padding: 6px 40px;
  border-radius: 7px;
  border: none;
  background: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: background-color 0.3s;
}

.Extra_Split_pageBtn:hover {
  background: rgba(255, 255, 255, 0.78);
}

.Extra_Split_pageBtn.active {
  background: rgba(255, 255, 255, 0.78);
}

.Extra_Split_pageBtn_text {
  font-size: 40px;
  color: #666666;
  transition: color 0.3s;
}

.Extra_Split_pageBtn:hover .Extra_Split_pageBtn_text,
.Extra_Split_pageBtn.active .Extra_Split_pageBtn_text {
  color: #005CAF;
}

.Extra_Split_cgGrid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 56px 48px;
  align-content: start;
  padding: 40px 16px 24px 16px;
  box-sizing: border-box;
}

.Extra_Split_cgCard {
  width: 100%;
  aspect-ratio: 16 / 9;
  padding: 0px;
  border: none;
  background: transparent;
  cursor: pointer;
  position: relative;
  opacity: 0;
  animation: Extra_Split_cgSoftIn 1.5s ease-out forwards;
}

.Extra_Split_cgCard:hover {
  z-index: 2;
}

.Extra_Split_cgFrame {
  position: absolute;
  inset: 0px;
  background-color: rgba(255, 255, 255, 0.85);
  box-shadow: 0px 0px 15px 5px rgba(0, 0, 0, 0.28);
  padding: 19.2px;
  box-sizing: border-box;
  transform: rotate(var(--cg-tilt, 0deg));
  transition: transform 0.33s, background-color 0.33s, box-shadow 0.33s;
}

.Extra_Split_cgCard:hover .Extra_Split_cgFrame {
  background-color: #ffffff;
  box-shadow: 0px 6px 24px 6px rgba(0, 0, 0, 0.32);
  transform: scale(1.04) rotate(0deg);
}

.Extra_Split_cgStackItem {
  position: absolute;
  inset: 0px;
  background-color: rgba(255, 255, 255, 0.85);
  box-shadow: 0px 0px 15px 5px rgba(0, 0, 0, 0.28);
  padding: 19.2px;
  box-sizing: border-box;
  transform-origin: center 70%;
  opacity: 0;
  animation: Extra_Split_cgStackIn 1.5s ease-out both;
  transition: background-color 0.33s, box-shadow 0.33s;
}

.Extra_Split_cgCard:hover .Extra_Split_cgStackItem {
  background-color: #ffffff;
  box-shadow: 0px 6px 24px 6px rgba(0, 0, 0, 0.32);
}

.Extra_Split_cgMediaBg {
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
}

.Extra_Split_cgMediaVideo {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.Extra_Split_bgmPanel {
  flex: 1;
  min-height: 0px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.Extra_Split_bgmPlayer {
  display: flex;
  align-items: center;
  padding: 25.6px 51.2px;
  border-radius: 4px;
  background-image: linear-gradient(315deg, rgba(163, 189, 237, 0.95) 0%, rgba(105, 145, 199, 0.95) 100%);
  color: #ffffff;
}

.Extra_Split_bgmCtrl {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.5);
  padding: 12px 28px;
  margin: 0px 5px;
  cursor: pointer;
  border-radius: 4px;
  flex-shrink: 0;
  line-height: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.33s, color 0.33s, box-shadow 0.33s;
}

.Extra_Split_bgmCtrl > span {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 0;
}

.Extra_Split_bgmCtrl:hover {
  box-shadow: 0px 0px 10px 5px rgba(255, 255, 255, 0.35);
}

.Extra_Split_bgmNow {
  color: rgba(255, 255, 255, 0.85);
  font-family: "资源圆体", serif;
  font-size: 39.68px;
  font-weight: normal;
  margin: 0px 5px 0px 20px;
  padding: 0px;
  min-width: 0px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.Extra_Split_bgmList {
  flex: 1;
  min-height: 0px;
  overflow-y: auto;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 20px 28px;
  align-content: start;
  padding: 24px 32px;
  border-radius: 4px;
  background-image: linear-gradient(315deg, rgba(163, 189, 237, 0.55) 0%, rgba(105, 145, 199, 0.55) 100%);
  box-sizing: border-box;
}

.Extra_Split_bgmItem {
  font-family: "资源圆体", serif;
  background-color: rgba(0, 0, 0, 0.1);
  padding: 18px 32px;
  cursor: pointer;
  border: none;
  border-radius: 5px;
  text-align: left;
  box-sizing: border-box;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: background-color 0.5s;
}

.Extra_Split_bgmItem:hover {
  background-color: rgba(255, 255, 255, 0.65);
}

.Extra_Split_bgmItem.active {
  background-color: rgba(255, 255, 255, 0.85);
}

.Extra_Split_bgmItem_text {
  font-size: 32px;
  color: #ffffff;
  transition: color 0.5s;
}

.Extra_Split_bgmItem:hover .Extra_Split_bgmItem_text,
.Extra_Split_bgmItem.active .Extra_Split_bgmItem_text {
  color: #666666;
}

.Extra_Split_modal {
  position: fixed;
  z-index: 25;
  inset: 0px;
  width: 2560px;
  height: 1440px;
  padding: 96px;
  box-sizing: border-box;
  background: rgba(0, 0, 0, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 32px;
}

.Extra_Split_modalCard {
  width: 1920px;
  height: 1080px;
  background-color: rgba(255, 255, 255, 0.95);
  padding: 51.2px;
  cursor: pointer;
  box-sizing: border-box;
  box-shadow: 0px 0px 25px rgba(0, 0, 0, 0.35);
  animation: Extra_Split_fullCgIn 0.5s ease-out forwards;
  opacity: 0;
}

.Extra_Split_modalCard img,
.Extra_Split_modalCard video {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}

.Extra_Split_modalStep {
  width: 84px;
  height: 84px;
  border-radius: 999px;
  border: none;
  background: rgba(255, 255, 255, 0.22);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 0;
  cursor: pointer;
}

.Extra_Split_modalStep > span {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 0;
}

.Extra_Split_modalStep:hover {
  background: rgba(255, 255, 255, 0.4);
}
`.trim();

function isVideoUrl(url: string): boolean {
  const ext = url.split('.').pop()?.toLowerCase() ?? '';
  return ext === 'mp4' || ext === 'webm' || ext === 'mkv';
}

function isImageUrl(url: string): boolean {
  const ext = url.split('.').pop()?.toLowerCase() ?? '';
  return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(ext);
}

function getDeterministicTiltDeg(index: number): number {
  return ((index * 7 + 3) % 11) - 5;
}

function renderCgMedia(url: string) {
  const resolved = resolveScreenAssetUrl(url);
  if (isVideoUrl(url)) {
    return <video className="Extra_Split_cgMediaVideo" src={resolved} autoPlay loop muted playsInline />;
  }
  return <div className="Extra_Split_cgMediaBg" style={{ backgroundImage: `url('${resolved}')` }} />;
}

export function ExtraSplitTabsScreen(props: ExtraScreenProps) {
  const {
    visible,
    cgGroups,
    bgmList,
    currentBgmUrl,
    isBgmPlaying,
    t,
    playSe,
    onSelectBgm,
    onToggleBgmPlay,
    onPrevBgm,
    onNextBgm,
    onClose,
  } = props;

  const { rootProps } = useScreenParts('extra', EXTRA_SPLIT_PARTS, EXTRA_SPLIT_DEFAULT_CSS);
  const [activeTab, setActiveTab] = useState<'cg' | 'bgm'>('cg');
  const [cgPage, setCgPage] = useState(1);
  const [activeGroupKey, setActiveGroupKey] = useState<string | null>(null);
  const [fullIndex, setFullIndex] = useState(0);

  const pageCount = Math.max(1, Math.ceil(cgGroups.length / CG_PER_PAGE));
  const safePage = Math.min(cgPage, pageCount);
  const pageGroups = useMemo(() => {
    const start = (safePage - 1) * CG_PER_PAGE;
    return cgGroups.slice(start, start + CG_PER_PAGE);
  }, [cgGroups, safePage]);

  const activeGroup = activeGroupKey ? cgGroups.find((g) => g.key === activeGroupKey) : undefined;
  const activeAsset = activeGroup ? activeGroup.resources[fullIndex] ?? activeGroup.resources[0] : undefined;
  const currentTrackName = bgmList.find((item) => item.url === currentBgmUrl)?.name ?? 'Title_BGM';

  if (!visible) return null;

  return (
    <div {...rootProps} className={`${rootProps.className} Extra_Split_main`}>
      <div className="Extra_Split_top">
        <button
          type="button"
          className="Extra_Split_close"
          onMouseEnter={playSe.click}
          onClick={() => {
            playSe.click();
            onClose();
          }}
        >
          <CloseSmall theme="outline" size={92} fill="#fff" strokeWidth={3} />
        </button>
        <div className="Extra_Split_title">{t('extra.title')}</div>
        <div className="Extra_Split_tabs">
          <button
            type="button"
            className={`Extra_Split_tab${activeTab === 'cg' ? ' active' : ''}`}
            onMouseEnter={playSe.enter}
            onClick={() => {
              playSe.switch();
              setActiveTab('cg');
            }}
          >
            <span className="Extra_Split_tabIcon">
              <Picture theme="outline" size={34} fill="currentColor" />
            </span>
            <span className="Extra_Split_tabText">CG</span>
          </button>
          <button
            type="button"
            className={`Extra_Split_tab${activeTab === 'bgm' ? ' active' : ''}`}
            onMouseEnter={playSe.enter}
            onClick={() => {
              playSe.switch();
              setActiveTab('bgm');
            }}
          >
            <span className="Extra_Split_tabIcon">
              <Music theme="outline" size={34} fill="currentColor" />
            </span>
            <span className="Extra_Split_tabText">BGM</span>
          </button>
        </div>
      </div>

      <div className="Extra_Split_body">
        {activeTab === 'cg' ? (
          <>
            {cgGroups.length > 0 && (
              <div className="Extra_Split_pages">
                {Array.from({ length: pageCount }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    type="button"
                    className={`Extra_Split_pageBtn${safePage === page ? ' active' : ''}`}
                    onMouseEnter={playSe.enter}
                    onClick={() => {
                      playSe.pageChange();
                      setCgPage(page);
                    }}
                  >
                    <span className="Extra_Split_pageBtn_text">{page}</span>
                  </button>
                ))}
              </div>
            )}
            <div className="Extra_Split_cgGrid" key={`split-cg-page-${safePage}`}>
              {pageGroups.map((group, idx) => {
                const asset = group.resources[0];
                if (!asset) return null;
                const isStackPreview = group.resources.length > 1 && isImageUrl(asset.url);
                const animationDelay = 100 + idx * 100;
                const tiltDeg = getDeterministicTiltDeg(idx);
                const stackResources = isStackPreview ? [...group.resources].reverse() : [];

                return (
                  <button
                    key={group.key}
                    type="button"
                    title={group.name}
                    className="Extra_Split_cgCard"
                    style={{ animationDelay: `${animationDelay}ms` }}
                    onMouseEnter={playSe.enter}
                    onClick={() => {
                      playSe.click();
                      setFullIndex(0);
                      setActiveGroupKey(group.key);
                    }}
                  >
                    {isStackPreview ? (
                      stackResources.map((resource, stackIdx) => {
                        const offset = stackIdx - (stackResources.length - 1) / 2;
                        return (
                          <div
                            key={`${resource.url}_${stackIdx}`}
                            className="Extra_Split_cgStackItem"
                            style={
                              {
                                zIndex: stackIdx,
                                animationDelay: `${animationDelay + stackIdx * 140}ms`,
                                '--cg-stack-start-transform': `translate(${offset * 1.5}%, ${offset * -0.8}%) rotate(${
                                  offset * 2
                                }deg)`,
                                '--cg-stack-end-transform': `translate(${offset * 5.5}%, ${offset * -2.8}%) rotate(${
                                  offset * 5.5
                                }deg)`,
                              } as CSSProperties
                            }
                          >
                            {renderCgMedia(resource.url)}
                          </div>
                        );
                      })
                    ) : (
                      <div className="Extra_Split_cgFrame" style={{ '--cg-tilt': `${tiltDeg}deg` } as CSSProperties}>
                        {renderCgMedia(asset.url)}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          <div className="Extra_Split_bgmPanel">
            <div className="Extra_Split_bgmPlayer">
              <button
                type="button"
                className="Extra_Split_bgmCtrl"
                onMouseEnter={playSe.enter}
                onClick={() => {
                  playSe.click();
                  onPrevBgm();
                }}
              >
                <GoStart theme="filled" size={39} fill="#fff" strokeWidth={3} strokeLinejoin="miter" />
              </button>
              <button
                type="button"
                className="Extra_Split_bgmCtrl"
                onMouseEnter={playSe.enter}
                onClick={() => {
                  playSe.click();
                  if (!isBgmPlaying) onToggleBgmPlay();
                }}
              >
                <PlayOne theme="filled" size={39} fill="#fff" strokeWidth={3} strokeLinejoin="miter" />
              </button>
              <button
                type="button"
                className="Extra_Split_bgmCtrl"
                onMouseEnter={playSe.enter}
                onClick={() => {
                  playSe.click();
                  onNextBgm();
                }}
              >
                <GoEnd theme="filled" size={39} fill="#fff" strokeWidth={3} strokeLinejoin="miter" />
              </button>
              <button
                type="button"
                className="Extra_Split_bgmCtrl"
                onMouseEnter={playSe.enter}
                onClick={() => {
                  playSe.click();
                  if (isBgmPlaying) onToggleBgmPlay();
                }}
              >
                <SquareSmall theme="filled" size={39} fill="#fff" strokeWidth={3} strokeLinejoin="miter" />
              </button>
              <div className="Extra_Split_bgmNow">{currentTrackName}</div>
            </div>

            <div className="Extra_Split_bgmList">
              {bgmList.map((bgm, idx) => (
                <button
                  key={`${bgm.url}-${idx}`}
                  type="button"
                  className={`Extra_Split_bgmItem${bgm.url === currentBgmUrl ? ' active' : ''}`}
                  onMouseEnter={playSe.enter}
                  onClick={() => {
                    playSe.click();
                    onSelectBgm(bgm.url);
                  }}
                >
                  <span className="Extra_Split_bgmItem_text">{bgm.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {activeGroup && activeAsset && (
        <div
          className="Extra_Split_modal"
          onClick={() => {
            playSe.click();
            setActiveGroupKey(null);
            setFullIndex(0);
          }}
        >
          {activeGroup.resources.length > 1 && (
            <button
              type="button"
              className="Extra_Split_modalStep"
              onClick={(e) => {
                e.stopPropagation();
                playSe.click();
                setFullIndex((i) => (i - 1 + activeGroup.resources.length) % activeGroup.resources.length);
              }}
            >
              <Left theme="outline" size={44} fill="#fff" strokeWidth={3} />
            </button>
          )}
          <div
            className="Extra_Split_modalCard"
            onClick={(e) => {
              e.stopPropagation();
              playSe.click();
              if (fullIndex >= activeGroup.resources.length - 1) {
                setActiveGroupKey(null);
                setFullIndex(0);
              } else {
                setFullIndex((i) => i + 1);
              }
            }}
          >
            {isVideoUrl(activeAsset.url) ? (
              <video src={resolveScreenAssetUrl(activeAsset.url)} autoPlay loop muted playsInline />
            ) : (
              <img src={resolveScreenAssetUrl(activeAsset.url)} alt={activeGroup.name} />
            )}
          </div>
          {activeGroup.resources.length > 1 && (
            <button
              type="button"
              className="Extra_Split_modalStep"
              onClick={(e) => {
                e.stopPropagation();
                playSe.click();
                setFullIndex((i) => (i + 1) % activeGroup.resources.length);
              }}
            >
              <Right theme="outline" size={44} fill="#fff" strokeWidth={3} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export const EXTRA_SPLIT_TABS_VARIANT: BuiltInScreenVariant<ExtraScreenProps> = {
  screen: 'extra',
  variantId: 'split-tabs',
  name: '双页签独立视图',
  component: ExtraSplitTabsScreen,
  parts: EXTRA_SPLIT_PARTS,
  defaultCssText: EXTRA_SPLIT_DEFAULT_CSS,
};
