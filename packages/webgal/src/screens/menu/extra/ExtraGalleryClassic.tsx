import { useMemo, useState, type CSSProperties } from 'react';
import { CloseSmall, GoEnd, GoStart, MusicList, PlayOne, SquareSmall } from '@icon-park/react';
import type { BuiltInScreenVariant, ExtraScreenProps, ScreenPartDefinition } from '@/screens/contracts';
import { resolveScreenAssetUrl, useScreenParts } from '@/sdk/globalUiSdk';

const CG_PER_PAGE = 8;

const EXTRA_CLASSIC_PARTS: ScreenPartDefinition[] = [
  { id: 'main', name: '鉴赏页面容器', selector: '.Extra_main', kind: 'container', allowLayoutEdit: true },
  { id: 'top', name: '顶部标题栏', selector: '.extra_top', kind: 'container', allowLayoutEdit: true },
  { id: 'title', name: '顶部标题文字', selector: '.extra_title', kind: 'text', allowLayoutEdit: false },
  { id: 'cgNav', name: 'CG 分页栏', selector: '.cgShowDiv', kind: 'container', allowLayoutEdit: true },
  { id: 'cgNavButton', name: 'CG 分页按钮', selector: '.cgNav', kind: 'container', allowLayoutEdit: false },
  {
    id: 'cgNavButtonText',
    name: 'CG 分页文字',
    selector: '.cgNav_text',
    kind: 'text',
    stateHostSelector: '.cgNav',
    allowLayoutEdit: false,
  },
  { id: 'cgGrid', name: 'CG 网格区', selector: '.cgContainer', kind: 'container', allowLayoutEdit: true },
  { id: 'cgCard', name: 'CG 卡片', selector: '.cgElement', kind: 'container', allowLayoutEdit: false },
  { id: 'bgmBar', name: '底部音乐条', selector: '.bgmContainer', kind: 'container', allowLayoutEdit: true },
  { id: 'bgmName', name: '当前曲目文字', selector: '.bgmName', kind: 'text', allowLayoutEdit: false },
  { id: 'bgmItem', name: '曲目按钮', selector: '.bgmElement', kind: 'container', allowLayoutEdit: false },
  {
    id: 'bgmItemText',
    name: '曲目按钮文字',
    selector: '.bgmElement_text',
    kind: 'text',
    stateHostSelector: '.bgmElement',
    allowLayoutEdit: false,
  },
];

const EXTRA_CLASSIC_DEFAULT_CSS = `
@keyframes Extra_cg_softIn {
  0% {
    opacity: 0;
    transform: scale(1.15, 1.15) translate(-50px, -125px) rotateX(-25deg) rotateY(25deg) rotate(calc(var(--cg-tilt, 0deg) * -2));
  }
  70% {
    opacity: 1;
    transform: scale(1, 1) translate3d(0px, 0px, 0px) rotate(calc(var(--cg-tilt, 0deg) * 1.4));
  }
  100% {
    opacity: 1;
    transform: scale(1, 1) translate3d(0px, 0px, 0px) rotate(var(--cg-tilt, 0deg));
  }
}

@keyframes Extra_cg_stackIn {
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

@keyframes Extra_fullCgIn {
  0% {
    opacity: 0;
    transform: scale(1.05, 1.05) translate(-25px, -50px) rotateX(-10deg) rotateY(10deg);
  }
  100% {
    opacity: 1;
    transform: scale(1, 1) translate3d(0px, 0px, 0px);
  }
}

.Extra_main {
  position: absolute;
  left: 0px;
  top: 0px;
  width: 2560px;
  height: 1440px;
  z-index: 14;
  background-image: linear-gradient(135deg, #93a5cf 0%, #e4efe9 100%);
  box-sizing: border-box;
  padding: 51.2px;
  cursor: default;
}

.extra_top {
  width: 100%;
  height: 10%;
  display: flex;
  align-items: flex-start;
}

.extra_top_icon {
  cursor: pointer;
  padding: 15.36px 15.36px 0px 15.36px;
  border-radius: 1000px;
  border: none;
  background: transparent;
  transform: translate(0px, -13px);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: background 0.33s;
}

.extra_top_icon:hover {
  background: rgba(0, 0, 0, 0.25);
}

.extra_title {
  font-family: "思源宋体", serif;
  height: 100%;
  line-height: 100%;
  font-size: 83.2px;
  font-weight: bold;
  color: transparent;
  background: linear-gradient(150deg, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 1) 75%, #51A8DD 100%);
  -webkit-background-clip: text;
  background-clip: text;
}

.mainContainer {
  padding: 0px 51.2px;
  height: 92%;
  display: flex;
  flex-flow: column;
  box-sizing: border-box;
}

.cgMain {
  height: 88%;
  width: 100%;
}

.cgShowDiv {
  height: 8%;
  width: 100%;
  display: flex;
  flex-flow: row;
  justify-content: center;
  align-items: flex-end;
}

.cgShowDivWrapper {
  display: flex;
  flex-flow: row;
  justify-content: flex-start;
  align-items: flex-end;
  border-radius: 7px;
  padding: 12px 15px;
  width: 100%;
  max-width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  flex-wrap: nowrap;
}

.cgNav {
  margin: 0px 10.88px;
  cursor: pointer;
  background-color: rgba(255, 255, 255, 0.5);
  padding: 5.22px 43.52px;
  border-radius: 7px;
  border: none;
  flex-shrink: 0;
  transition: background-color 0.5s;
}

.cgNav:first-child {
  margin-left: 0px;
}

.cgNav:last-child {
  margin-right: 0px;
}

.cgNav:hover {
  background-color: rgba(255, 255, 255, 0.6);
}

.cgNav.active {
  background-color: rgba(255, 255, 255, 0.7);
}

.cgNav_text {
  font-size: 43.52px;
  font-weight: normal;
  color: #666666;
  transition: color 0.5s;
}

.cgNav:hover .cgNav_text,
.cgNav.active .cgNav_text {
  color: #005CAF;
}

.cgContainer {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  align-content: flex-start;
  height: 90%;
  width: 100%;
  padding: 102.4px 0px 0px 51.2px;
  box-sizing: border-box;
}

.cgElement {
  width: 22.5%;
  height: 37.5%;
  background-color: rgba(255, 255, 255, 0.75);
  box-shadow: 0px 0px 15px 5px rgba(0, 0, 0, 0.35);
  transition: transform 0.33s, background-color 0.33s, box-shadow 0.33s;
  padding: 19.2px;
  margin: 25.6px;
  cursor: pointer;
  position: relative;
  box-sizing: border-box;
  border: none;
  opacity: 0;
  animation: Extra_cg_softIn 1.5s ease-out forwards;
}

.cgElement:hover {
  z-index: 2;
  background-color: #ffffff;
}

.cgElement.cgElementStack {
  background-color: transparent;
  box-shadow: none;
  padding: 0px;
}

.cgElement.cgElementStack:hover {
  background-color: transparent;
  box-shadow: none;
}

.cgStackItem {
  position: absolute;
  inset: 15.36px;
  background-color: rgba(255, 255, 255, 0.85);
  box-shadow: 0px 0px 15px 5px rgba(0, 0, 0, 0.28);
  padding: 19.2px;
  box-sizing: border-box;
  transform-origin: center 70%;
  opacity: 0;
  animation: Extra_cg_stackIn 1.5s ease-out both;
  transition: background-color 0.33s, box-shadow 0.33s;
}

.cgElement.cgElementStack:hover .cgStackItem {
  background-color: #ffffff;
}

.cgMediaBg {
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
}

.cgMediaVideo {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.showFullContainer {
  position: absolute;
  z-index: 13;
  top: 0px;
  left: 0px;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(0, 0, 0, 0.1);
}

.showFullCgMain {
  width: 80%;
  height: 80%;
  background-color: rgba(255, 255, 255, 0.95);
  padding: 51.2px;
  cursor: pointer;
  box-sizing: border-box;
  animation: Extra_fullCgIn 0.5s ease-out forwards;
  opacity: 0;
}

.bgmContainer {
  position: absolute;
  left: 50px;
  right: 50px;
  bottom: 30px;
  z-index: 2;
  display: flex;
  flex-flow: column-reverse;
  align-content: center;
  background-image: linear-gradient(315deg, rgba(163, 189, 237, 0.95) 0%, rgba(105, 145, 199, 0.95) 100%);
  padding: 25.6px 51.2px;
  border-radius: 4px;
  color: #ffffff;
  transition: max-height 0.5s;
  overflow: auto;
  box-sizing: border-box;
}

.bgmPlayerMain {
  display: flex;
}

.bgmControlButton {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.5);
  padding: 15.36px 30.72px 5.12px 30.72px;
  margin: 0px 5px;
  cursor: pointer;
  border-radius: 4px;
  flex-shrink: 0;
  transition: background-color 0.33s, color 0.33s;
}

.bgmControlButton:hover {
  box-shadow: 0px 0px 10px 5px rgba(255, 255, 255, 0.35);
}

.bgmName {
  color: rgba(255, 255, 255, 0.8);
  font-family: "资源圆体", serif;
  font-size: 39.68px;
  font-weight: normal;
  margin: 5px 5px 0px 15px;
  padding: 0px;
  overflow: hidden;
}

.bgmListContainer {
  width: 100%;
  display: flex;
  flex: 1;
  flex-flow: row;
  justify-content: flex-start;
  align-items: flex-start;
  margin: 0px 0px 15px 0px;
  flex-wrap: wrap;
  overflow: auto;
  box-sizing: border-box;
}

.bgmElement {
  font-family: "资源圆体", serif;
  background-color: rgba(0, 0, 0, 0.1);
  width: 28%;
  padding: 16px 32px;
  margin: 16px 32px 16px 16px;
  cursor: pointer;
  border: none;
  border-radius: 5px;
  text-align: left;
  box-sizing: border-box;
  flex-shrink: 0;
  overflow: hidden;
  transition: background-color 0.5s;
}

.bgmElement:hover {
  background-color: rgba(255, 255, 255, 0.65);
}

.bgmElement.active {
  background-color: rgba(255, 255, 255, 0.85);
}

.bgmElement_text {
  font-size: 32px;
  color: #ffffff;
  transition: color 0.5s;
}

.bgmElement:hover .bgmElement_text,
.bgmElement.active .bgmElement_text {
  color: #666666;
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

function renderCgMedia(url: string) {
  const resolved = resolveScreenAssetUrl(url);
  if (isVideoUrl(url)) {
    return <video className="cgMediaVideo" src={resolved} autoPlay loop muted playsInline />;
  }
  return <div className="cgMediaBg" style={{ backgroundImage: `url('${resolved}')` }} />;
}

function getDeterministicTiltDeg(index: number): number {
  return ((index * 7 + 3) % 11) - 5;
}

export function ExtraGalleryClassicScreen(props: ExtraScreenProps) {
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

  const { rootProps } = useScreenParts('extra', EXTRA_CLASSIC_PARTS, EXTRA_CLASSIC_DEFAULT_CSS);
  const [currentPage, setCurrentPage] = useState(1);
  const [showBgmList, setShowBgmList] = useState(false);
  const [activeGroupKey, setActiveGroupKey] = useState<string | null>(null);
  const [fullIndex, setFullIndex] = useState(0);

  const pageCount = Math.max(1, Math.ceil(cgGroups.length / CG_PER_PAGE));
  const safePage = Math.min(currentPage, pageCount);
  const pageGroups = useMemo(() => {
    const start = (safePage - 1) * CG_PER_PAGE;
    return cgGroups.slice(start, start + CG_PER_PAGE);
  }, [cgGroups, safePage]);

  const activeFullGroup = activeGroupKey ? cgGroups.find((g) => g.key === activeGroupKey) : undefined;
  const activeFullAsset = activeFullGroup
    ? activeFullGroup.resources[fullIndex] ?? activeFullGroup.resources[0]
    : undefined;

  const currentTrackName = useMemo(() => {
    const matched = bgmList.find((item) => item.url === currentBgmUrl);
    return matched ? matched.name : 'Title_BGM';
  }, [bgmList, currentBgmUrl]);

  if (!visible) return null;

  return (
    <div {...rootProps} className={`${rootProps.className} Extra_main`}>
      <div className="extra_top">
        <button
          type="button"
          className="extra_top_icon"
          onMouseEnter={playSe.click}
          onClick={() => {
            playSe.click();
            onClose();
          }}
        >
          <CloseSmall theme="outline" size={102} fill="#fff" strokeWidth={3} />
        </button>
        <div className="extra_title">{t('extra.title')}</div>
      </div>

      <div className="mainContainer">
        <div className="cgMain">
          <div className="cgShowDiv">
            <div className="cgShowDivWrapper">
              {cgGroups.length > 0 &&
                Array.from({ length: pageCount }, (_, idx) => idx + 1).map((page) => (
                  <button
                    key={page}
                    type="button"
                    className={`cgNav${safePage === page ? ' active' : ''}`}
                    onMouseEnter={playSe.enter}
                    onClick={() => {
                      playSe.click();
                      setCurrentPage(page);
                    }}
                  >
                    <span className="cgNav_text">{page}</span>
                  </button>
                ))}
            </div>
          </div>

          <div className="cgContainer" key={`cg-page-${safePage}`}>
            {pageGroups.map((group, idx) => {
              const previewAsset = group.resources[0];
              if (!previewAsset) return null;
              const isStackPreview = group.resources.length > 1 && isImageUrl(previewAsset.url);
              const animationDelay = 100 + idx * 100;
              const tiltDeg = isStackPreview ? 0 : getDeterministicTiltDeg(idx);
              const stackResources = isStackPreview ? [...group.resources].reverse() : [];

              return (
                <button
                  key={group.key}
                  type="button"
                  className={`cgElement${isStackPreview ? ' cgElementStack' : ''}`}
                  style={
                    {
                      animationDelay: `${animationDelay}ms`,
                      '--cg-tilt': `${tiltDeg}deg`,
                    } as CSSProperties
                  }
                  onMouseEnter={playSe.enter}
                  onClick={() => {
                    playSe.click();
                    setFullIndex(0);
                    setActiveGroupKey(group.key);
                  }}
                >
                  {isStackPreview
                    ? stackResources.map((resource, stackIdx) => {
                        const offset = stackIdx - (stackResources.length - 1) / 2;
                        return (
                          <div
                            key={`${resource.url}_${stackIdx}`}
                            className="cgStackItem"
                            style={
                              {
                                zIndex: stackIdx,
                                animationDelay: `${animationDelay + stackIdx * 140}ms`,
                                '--cg-stack-start-transform': `translate(${offset * 1.5}%, ${offset * -0.8}%) rotate(${
                                  offset * 2
                                }deg)`,
                                '--cg-stack-end-transform': `translate(${offset * 6}%, ${offset * -3}%) rotate(${
                                  offset * 6
                                }deg)`,
                              } as CSSProperties
                            }
                          >
                            {renderCgMedia(resource.url)}
                          </div>
                        );
                      })
                    : renderCgMedia(previewAsset.url)}
                </button>
              );
            })}
          </div>
        </div>

        {bgmList.length > 0 && (
          <div className="bgmContainer" style={{ maxHeight: showBgmList ? '80%' : '10%' }}>
            <div className="bgmPlayerMain">
              <button
                type="button"
                className="bgmControlButton"
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
                className="bgmControlButton"
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
                className="bgmControlButton"
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
                className="bgmControlButton"
                onMouseEnter={playSe.enter}
                onClick={() => {
                  playSe.click();
                  if (isBgmPlaying) onToggleBgmPlay();
                }}
              >
                <SquareSmall theme="filled" size={39} fill="#fff" strokeWidth={3} strokeLinejoin="miter" />
              </button>
              <div className="bgmName">{currentTrackName}</div>
              <button
                type="button"
                className="bgmControlButton"
                style={{ marginLeft: 'auto' }}
                onMouseEnter={playSe.enter}
                onClick={() => {
                  playSe.click();
                  setShowBgmList((prev) => !prev);
                }}
              >
                <MusicList theme="filled" size={39} fill="#fff" strokeWidth={3} strokeLinejoin="miter" />
              </button>
            </div>

            {showBgmList && (
              <div className="bgmListContainer">
                {bgmList.map((bgm, idx) => (
                  <button
                    key={`${bgm.url}-${idx}`}
                    type="button"
                    className={`bgmElement${bgm.url === currentBgmUrl ? ' active' : ''}`}
                    onMouseEnter={playSe.enter}
                    onClick={() => {
                      playSe.click();
                      onSelectBgm(bgm.url);
                    }}
                  >
                    <span className="bgmElement_text">{bgm.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {activeFullGroup && activeFullAsset && (
        <div
          className="showFullContainer"
          onMouseEnter={playSe.enter}
          onClick={() => {
            playSe.click();
            setActiveGroupKey(null);
            setFullIndex(0);
          }}
        >
          <div
            className="showFullCgMain"
            onClick={(e) => {
              e.stopPropagation();
              playSe.click();
              if (fullIndex >= activeFullGroup.resources.length - 1) {
                setActiveGroupKey(null);
                setFullIndex(0);
              } else {
                setFullIndex((idx) => idx + 1);
              }
            }}
          >
            {renderCgMedia(activeFullAsset.url)}
          </div>
        </div>
      )}
    </div>
  );
}

export const EXTRA_GALLERY_CLASSIC_VARIANT: BuiltInScreenVariant<ExtraScreenProps> = {
  screen: 'extra',
  variantId: 'gallery-classic',
  name: '经典画廊底栏',
  component: ExtraGalleryClassicScreen,
  parts: EXTRA_CLASSIC_PARTS,
  defaultCssText: EXTRA_CLASSIC_DEFAULT_CSS,
};
