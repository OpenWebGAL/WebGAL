const __WEBGAL_SDK__ = globalThis.__WEBGAL_UI_SDK__;
if (!__WEBGAL_SDK__) {
  throw new Error("WebGAL UI SDK is not initialized.");
}
const { jsx: _jsx, jsxs: _jsxs, Fragment: _Fragment } = __WEBGAL_SDK__.jsxRuntime;
const { useMemo, useState } = __WEBGAL_SDK__.react;
const { CloseSmall, GoEnd, GoStart, Left, Music, PauseOne, Picture, PlayOne, Right } = __WEBGAL_SDK__.icons;
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
  gap: 32px;
  flex-shrink: 0;
}

.Extra_Split_close {
  cursor: pointer;
  padding: 6px;
  border-radius: 100%;
  border: none;
  background: transparent;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: background 0.3s;
}

.Extra_Split_close:hover {
  background: rgba(0, 0, 0, 0.2);
}

.Extra_Split_title {
  font-family: "思源宋体", serif;
  font-size: 80px;
  font-weight: bold;
  color: transparent;
  background: linear-gradient(135deg, #ffffff 0%, #51A8DD 100%);
  -webkit-background-clip: text;
  background-clip: text;
  letter-spacing: 0.1em;
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
  cursor: pointer;
  transition: background-color 0.25s, color 0.25s, transform 0.2s;
}

.Extra_Split_tab:hover,
.Extra_Split_tab.Extra_Split_tab_active {
  background: rgba(255, 255, 255, 0.85);
  color: #005CAF;
}

.Extra_Split_body {
  flex: 1;
  min-height: 0px;
  padding-top: 32px;
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
  font-size: 38px;
  padding: 6px 36px;
  border-radius: 7px;
  border: none;
  background: rgba(255, 255, 255, 0.5);
  color: #666666;
  font-weight: bold;
  cursor: pointer;
}

.Extra_Split_pageBtn:hover,
.Extra_Split_pageBtn.Extra_Split_pageBtn_active {
  background: rgba(255, 255, 255, 0.8);
  color: #005CAF;
}

.Extra_Split_cgGrid {
  flex: 1;
  min-height: 0px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 36px;
}

.Extra_Split_cgCard {
  background: rgba(255, 255, 255, 0.8);
  box-shadow: 0px 8px 22px rgba(0, 0, 0, 0.2);
  padding: 18px;
  border: none;
  display: flex;
  flex-direction: column;
  gap: 12px;
  cursor: pointer;
  transition: transform 0.25s, background-color 0.25s;
}

.Extra_Split_cgCard:hover {
  transform: translateY(-6px);
  background: #ffffff;
}

.Extra_Split_cgThumb {
  flex: 1;
  min-height: 0px;
  width: 100%;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.05);
}

.Extra_Split_cgThumb img,
.Extra_Split_cgThumb video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.Extra_Split_cgCaption {
  font-size: 28px;
  font-weight: bold;
  color: #005CAF;
  display: flex;
  justify-content: space-between;
}

.Extra_Split_bgmPanel {
  flex: 1;
  min-height: 0px;
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.Extra_Split_bgmPlayer {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 28px 44px;
  border-radius: 8px;
  background-image: linear-gradient(315deg, rgba(163, 189, 237, 0.95) 0%, rgba(105, 145, 199, 0.95) 100%);
  box-shadow: 0px 10px 26px rgba(0, 0, 0, 0.2);
  color: #ffffff;
}

.Extra_Split_bgmCtrl {
  border: none;
  background: rgba(255, 255, 255, 0.16);
  border-radius: 999px;
  width: 72px;
  height: 72px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.Extra_Split_bgmCtrl:hover {
  background: rgba(255, 255, 255, 0.32);
}

.Extra_Split_bgmNow {
  margin-left: 16px;
  font-size: 42px;
  font-weight: bold;
}

.Extra_Split_bgmList {
  flex: 1;
  min-height: 0px;
  overflow-y: auto;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  align-content: start;
}

.Extra_Split_bgmItem {
  padding: 24px 32px;
  border: none;
  border-left: 6px solid transparent;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.65);
  color: #364f6b;
  font-size: 34px;
  text-align: left;
  cursor: pointer;
  transition: background-color 0.22s, color 0.22s, border-color 0.22s;
}

.Extra_Split_bgmItem:hover,
.Extra_Split_bgmItem.Extra_Split_bgmItem_active {
  background: rgba(255, 255, 255, 0.92);
  color: #005CAF;
  font-weight: bold;
  border-left-color: #005CAF;
}

.Extra_Split_modal {
  position: fixed;
  z-index: 25;
  inset: 0px;
  width: 2560px;
  height: 1440px;
  padding: 96px;
  box-sizing: border-box;
  background: rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(25px);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 32px;
}

.Extra_Split_modalCard {
  width: 1920px;
  height: 1080px;
  background: rgba(255, 255, 255, 0.95);
  padding: 36px;
  box-sizing: border-box;
  box-shadow: 0px 0px 25px rgba(0, 0, 0, 0.35);
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
  cursor: pointer;
}

.Extra_Split_modalStep:hover {
  background: rgba(255, 255, 255, 0.4);
}
`.trim();
function isVideoUrl(url) {
    const ext = url.split('.').pop()?.toLowerCase() ?? '';
    return ext === 'mp4' || ext === 'webm' || ext === 'mkv';
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
                        }, children: _jsx(CloseSmall, { theme: "outline", size: 84, fill: "#fff", strokeWidth: 3 }) }), _jsx("div", { className: "Extra_Split_title", children: t('extra.title') }), _jsxs("div", { className: "Extra_Split_tabs", children: [_jsxs("button", { type: "button", className: `Extra_Split_tab${activeTab === 'cg' ? ' Extra_Split_tab_active' : ''}`, onMouseEnter: playSe.enter, onClick: () => {
                                    playSe.switch();
                                    setActiveTab('cg');
                                }, children: [_jsx(Picture, { theme: "outline", size: 34, fill: "currentColor" }), _jsx("span", { children: "CG" })] }), _jsxs("button", { type: "button", className: `Extra_Split_tab${activeTab === 'bgm' ? ' Extra_Split_tab_active' : ''}`, onMouseEnter: playSe.enter, onClick: () => {
                                    playSe.switch();
                                    setActiveTab('bgm');
                                }, children: [_jsx(Music, { theme: "outline", size: 34, fill: "currentColor" }), _jsx("span", { children: "BGM" })] })] })] }), _jsx("div", { className: "Extra_Split_body", children: activeTab === 'cg' ? (_jsxs(_Fragment, { children: [cgGroups.length > 0 && (_jsx("div", { className: "Extra_Split_pages", children: Array.from({ length: pageCount }, (_, i) => i + 1).map((page) => (_jsx("button", { type: "button", className: `Extra_Split_pageBtn${safePage === page ? ' Extra_Split_pageBtn_active' : ''}`, onMouseEnter: playSe.enter, onClick: () => {
                                    playSe.pageChange();
                                    setCgPage(page);
                                }, children: page }, page))) })), _jsx("div", { className: "Extra_Split_cgGrid", children: pageGroups.map((group) => {
                                const asset = group.resources[0];
                                if (!asset)
                                    return null;
                                const url = resolveScreenAssetUrl(asset.url);
                                return (_jsxs("button", { type: "button", className: "Extra_Split_cgCard", onMouseEnter: playSe.enter, onClick: () => {
                                        playSe.click();
                                        setFullIndex(0);
                                        setActiveGroupKey(group.key);
                                    }, children: [_jsx("div", { className: "Extra_Split_cgThumb", children: isVideoUrl(asset.url) ? (_jsx("video", { src: url, autoPlay: true, loop: true, muted: true, playsInline: true })) : (_jsx("img", { src: url, alt: group.name })) }), _jsxs("div", { className: "Extra_Split_cgCaption", children: [_jsx("span", { children: group.name }), _jsxs("span", { children: ["1 / ", group.resources.length] })] })] }, group.key));
                            }) })] })) : (_jsxs("div", { className: "Extra_Split_bgmPanel", children: [_jsxs("div", { className: "Extra_Split_bgmPlayer", children: [_jsx("button", { type: "button", className: "Extra_Split_bgmCtrl", onMouseEnter: playSe.enter, onClick: () => {
                                        playSe.click();
                                        onPrevBgm();
                                    }, children: _jsx(GoStart, { theme: "filled", size: 38, fill: "#fff", strokeWidth: 3, strokeLinejoin: "miter" }) }), _jsx("button", { type: "button", className: "Extra_Split_bgmCtrl", onMouseEnter: playSe.enter, onClick: () => {
                                        playSe.click();
                                        onToggleBgmPlay();
                                    }, children: isBgmPlaying ? (_jsx(PauseOne, { theme: "filled", size: 38, fill: "#fff", strokeWidth: 3, strokeLinejoin: "miter" })) : (_jsx(PlayOne, { theme: "filled", size: 38, fill: "#fff", strokeWidth: 3, strokeLinejoin: "miter" })) }), _jsx("button", { type: "button", className: "Extra_Split_bgmCtrl", onMouseEnter: playSe.enter, onClick: () => {
                                        playSe.click();
                                        onNextBgm();
                                    }, children: _jsx(GoEnd, { theme: "filled", size: 38, fill: "#fff", strokeWidth: 3, strokeLinejoin: "miter" }) }), _jsx("div", { className: "Extra_Split_bgmNow", children: currentTrackName })] }), _jsx("div", { className: "Extra_Split_bgmList", children: bgmList.map((bgm, idx) => (_jsx("button", { type: "button", className: `Extra_Split_bgmItem${bgm.url === currentBgmUrl ? ' Extra_Split_bgmItem_active' : ''}`, onMouseEnter: playSe.enter, onClick: () => {
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
