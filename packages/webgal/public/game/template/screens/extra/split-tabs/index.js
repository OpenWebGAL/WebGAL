const __WEBGAL_SDK__ = globalThis.__WEBGAL_UI_SDK__;
if (!__WEBGAL_SDK__) {
  throw new Error("WebGAL UI SDK is not initialized.");
}
const { jsx: _jsx, jsxs: _jsxs, Fragment: _Fragment } = __WEBGAL_SDK__.jsxRuntime;
const { useMemo, useState } = __WEBGAL_SDK__.react;
const { CloseSmall, GoEnd, GoStart, Left, Music, Picture, PlayOne, Right, SquareSmall } = __WEBGAL_SDK__.icons;
const { resolveScreenAssetUrl, useScreenParts } = __WEBGAL_SDK__;
const CG_PER_PAGE = 8;
const EXTRA_SPLIT_PARTS = [
    { id: 'main', name: '鉴赏页面容器', selector: '.Extra_Split_main', allowLayoutEdit: true },
    { id: 'top', name: '顶部切换栏', selector: '.Extra_Split_top', allowLayoutEdit: true },
    { id: 'cgGrid', name: 'CG 画廊区', selector: '.Extra_Split_cgGrid', allowLayoutEdit: true },
    { id: 'cgCard', name: 'CG 卡片', selector: '.Extra_Split_cgCard', allowLayoutEdit: false },
    { id: 'bgmPanel', name: '音乐厅区域', selector: '.Extra_Split_bgmPanel', allowLayoutEdit: true },
    { id: 'bgmItem', name: '曲目列表项', selector: '.Extra_Split_bgmItem', allowLayoutEdit: false },
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
  font-size: 36px;
  font-weight: bold;
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

.Extra_Split_tab:hover,
.Extra_Split_tab.Extra_Split_tab_active {
  background: rgba(255, 255, 255, 0.85);
  color: #005CAF;
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
  font-size: 40px;
  padding: 6px 40px;
  border-radius: 7px;
  border: none;
  background: rgba(255, 255, 255, 0.5);
  color: #666666;
  cursor: pointer;
  transition: color 0.3s, background-color 0.3s;
}

.Extra_Split_pageBtn:hover,
.Extra_Split_pageBtn.Extra_Split_pageBtn_active {
  background: rgba(255, 255, 255, 0.78);
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
  font-size: 32px;
  padding: 18px 32px;
  cursor: pointer;
  color: #ffffff;
  border: none;
  border-radius: 5px;
  text-align: left;
  box-sizing: border-box;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: background-color 0.5s, color 0.5s;
}

.Extra_Split_bgmItem:hover {
  background-color: rgba(255, 255, 255, 0.65);
  color: #666666;
}

.Extra_Split_bgmItem.Extra_Split_bgmItem_active {
  background-color: rgba(255, 255, 255, 0.85);
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
function isVideoUrl(url) {
    const ext = url.split('.').pop()?.toLowerCase() ?? '';
    return ext === 'mp4' || ext === 'webm' || ext === 'mkv';
}
function isImageUrl(url) {
    const ext = url.split('.').pop()?.toLowerCase() ?? '';
    return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(ext);
}
function getDeterministicTiltDeg(index) {
    return ((index * 7 + 3) % 11) - 5;
}
function renderCgMedia(url) {
    const resolved = resolveScreenAssetUrl(url);
    if (isVideoUrl(url)) {
        return _jsx("video", { className: "Extra_Split_cgMediaVideo", src: resolved, autoPlay: true, loop: true, muted: true, playsInline: true });
    }
    return _jsx("div", { className: "Extra_Split_cgMediaBg", style: { backgroundImage: `url('${resolved}')` } });
}
export function ExtraSplitTabsScreen(props) {
    const { visible, cgGroups, bgmList, currentBgmUrl, isBgmPlaying, t, playSe, onSelectBgm, onToggleBgmPlay, onPrevBgm, onNextBgm, onClose, } = props;
    const { rootProps } = useScreenParts('extra', EXTRA_SPLIT_PARTS, EXTRA_SPLIT_DEFAULT_CSS);
    const [activeTab, setActiveTab] = useState('cg');
    const [cgPage, setCgPage] = useState(1);
    const [activeGroupKey, setActiveGroupKey] = useState(null);
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
    if (!visible)
        return null;
    return (_jsxs("div", { ...rootProps, className: `${rootProps.className} Extra_Split_main`, children: [_jsxs("div", { className: "Extra_Split_top", children: [_jsx("button", { type: "button", className: "Extra_Split_close", onMouseEnter: playSe.click, onClick: () => {
                            playSe.click();
                            onClose();
                        }, children: _jsx(CloseSmall, { theme: "outline", size: 92, fill: "#fff", strokeWidth: 3 }) }), _jsx("div", { className: "Extra_Split_title", children: t('extra.title') }), _jsxs("div", { className: "Extra_Split_tabs", children: [_jsxs("button", { type: "button", className: `Extra_Split_tab${activeTab === 'cg' ? ' Extra_Split_tab_active' : ''}`, onMouseEnter: playSe.enter, onClick: () => {
                                    playSe.switch();
                                    setActiveTab('cg');
                                }, children: [_jsx("span", { className: "Extra_Split_tabIcon", children: _jsx(Picture, { theme: "outline", size: 34, fill: "currentColor" }) }), _jsx("span", { children: "CG" })] }), _jsxs("button", { type: "button", className: `Extra_Split_tab${activeTab === 'bgm' ? ' Extra_Split_tab_active' : ''}`, onMouseEnter: playSe.enter, onClick: () => {
                                    playSe.switch();
                                    setActiveTab('bgm');
                                }, children: [_jsx("span", { className: "Extra_Split_tabIcon", children: _jsx(Music, { theme: "outline", size: 34, fill: "currentColor" }) }), _jsx("span", { children: "BGM" })] })] })] }), _jsx("div", { className: "Extra_Split_body", children: activeTab === 'cg' ? (_jsxs(_Fragment, { children: [cgGroups.length > 0 && (_jsx("div", { className: "Extra_Split_pages", children: Array.from({ length: pageCount }, (_, i) => i + 1).map((page) => (_jsx("button", { type: "button", className: `Extra_Split_pageBtn${safePage === page ? ' Extra_Split_pageBtn_active' : ''}`, onMouseEnter: playSe.enter, onClick: () => {
                                    playSe.pageChange();
                                    setCgPage(page);
                                }, children: page }, page))) })), _jsx("div", { className: "Extra_Split_cgGrid", children: pageGroups.map((group, idx) => {
                                const asset = group.resources[0];
                                if (!asset)
                                    return null;
                                const isStackPreview = group.resources.length > 1 && isImageUrl(asset.url);
                                const animationDelay = 100 + idx * 100;
                                const tiltDeg = getDeterministicTiltDeg(idx);
                                const stackResources = isStackPreview ? [...group.resources].reverse() : [];
                                return (_jsx("button", { type: "button", title: group.name, className: "Extra_Split_cgCard", style: { animationDelay: `${animationDelay}ms` }, onMouseEnter: playSe.enter, onClick: () => {
                                        playSe.click();
                                        setFullIndex(0);
                                        setActiveGroupKey(group.key);
                                    }, children: isStackPreview ? (stackResources.map((resource, stackIdx) => {
                                        const offset = stackIdx - (stackResources.length - 1) / 2;
                                        return (_jsx("div", { className: "Extra_Split_cgStackItem", style: {
                                                zIndex: stackIdx,
                                                animationDelay: `${animationDelay + stackIdx * 140}ms`,
                                                '--cg-stack-start-transform': `translate(${offset * 1.5}%, ${offset * -0.8}%) rotate(${offset * 2}deg)`,
                                                '--cg-stack-end-transform': `translate(${offset * 5.5}%, ${offset * -2.8}%) rotate(${offset * 5.5}deg)`,
                                            }, children: renderCgMedia(resource.url) }, `${resource.url}_${stackIdx}`));
                                    })) : (_jsx("div", { className: "Extra_Split_cgFrame", style: { '--cg-tilt': `${tiltDeg}deg` }, children: renderCgMedia(asset.url) })) }, group.key));
                            }) }, `split-cg-page-${safePage}`)] })) : (_jsxs("div", { className: "Extra_Split_bgmPanel", children: [_jsxs("div", { className: "Extra_Split_bgmPlayer", children: [_jsx("button", { type: "button", className: "Extra_Split_bgmCtrl", onMouseEnter: playSe.enter, onClick: () => {
                                        playSe.click();
                                        onPrevBgm();
                                    }, children: _jsx(GoStart, { theme: "filled", size: 39, fill: "#fff", strokeWidth: 3, strokeLinejoin: "miter" }) }), _jsx("button", { type: "button", className: "Extra_Split_bgmCtrl", onMouseEnter: playSe.enter, onClick: () => {
                                        playSe.click();
                                        if (!isBgmPlaying)
                                            onToggleBgmPlay();
                                    }, children: _jsx(PlayOne, { theme: "filled", size: 39, fill: "#fff", strokeWidth: 3, strokeLinejoin: "miter" }) }), _jsx("button", { type: "button", className: "Extra_Split_bgmCtrl", onMouseEnter: playSe.enter, onClick: () => {
                                        playSe.click();
                                        onNextBgm();
                                    }, children: _jsx(GoEnd, { theme: "filled", size: 39, fill: "#fff", strokeWidth: 3, strokeLinejoin: "miter" }) }), _jsx("button", { type: "button", className: "Extra_Split_bgmCtrl", onMouseEnter: playSe.enter, onClick: () => {
                                        playSe.click();
                                        if (isBgmPlaying)
                                            onToggleBgmPlay();
                                    }, children: _jsx(SquareSmall, { theme: "filled", size: 39, fill: "#fff", strokeWidth: 3, strokeLinejoin: "miter" }) }), _jsx("div", { className: "Extra_Split_bgmNow", children: currentTrackName })] }), _jsx("div", { className: "Extra_Split_bgmList", children: bgmList.map((bgm, idx) => (_jsx("button", { type: "button", className: `Extra_Split_bgmItem${bgm.url === currentBgmUrl ? ' Extra_Split_bgmItem_active' : ''}`, onMouseEnter: playSe.enter, onClick: () => {
                                    playSe.click();
                                    onSelectBgm(bgm.url);
                                }, children: bgm.name }, `${bgm.url}-${idx}`))) })] })) }), activeGroup && activeAsset && (_jsxs("div", { className: "Extra_Split_modal", onClick: () => {
                    playSe.click();
                    setActiveGroupKey(null);
                    setFullIndex(0);
                }, children: [activeGroup.resources.length > 1 && (_jsx("button", { type: "button", className: "Extra_Split_modalStep", onClick: (e) => {
                            e.stopPropagation();
                            playSe.click();
                            setFullIndex((i) => (i - 1 + activeGroup.resources.length) % activeGroup.resources.length);
                        }, children: _jsx(Left, { theme: "outline", size: 44, fill: "#fff", strokeWidth: 3 }) })), _jsx("div", { className: "Extra_Split_modalCard", onClick: (e) => {
                            e.stopPropagation();
                            playSe.click();
                            if (fullIndex >= activeGroup.resources.length - 1) {
                                setActiveGroupKey(null);
                                setFullIndex(0);
                            }
                            else {
                                setFullIndex((i) => i + 1);
                            }
                        }, children: isVideoUrl(activeAsset.url) ? (_jsx("video", { src: resolveScreenAssetUrl(activeAsset.url), autoPlay: true, loop: true, muted: true, playsInline: true })) : (_jsx("img", { src: resolveScreenAssetUrl(activeAsset.url), alt: activeGroup.name })) }), activeGroup.resources.length > 1 && (_jsx("button", { type: "button", className: "Extra_Split_modalStep", onClick: (e) => {
                            e.stopPropagation();
                            playSe.click();
                            setFullIndex((i) => (i + 1) % activeGroup.resources.length);
                        }, children: _jsx(Right, { theme: "outline", size: 44, fill: "#fff", strokeWidth: 3 }) }))] }))] }));
}
export const EXTRA_SPLIT_TABS_VARIANT = {
    screen: 'extra',
    variantId: 'split-tabs',
    name: '双页签独立视图',
    component: ExtraSplitTabsScreen,
    parts: EXTRA_SPLIT_PARTS,
    defaultCssText: EXTRA_SPLIT_DEFAULT_CSS,
};

export { EXTRA_SPLIT_PARTS as parts, EXTRA_SPLIT_DEFAULT_CSS as defaultCssText, ExtraSplitTabsScreen as Screen };
export default ExtraSplitTabsScreen;
