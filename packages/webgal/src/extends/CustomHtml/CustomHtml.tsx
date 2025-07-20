import React, { FC } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import styles from './customHtml.module.scss';
import { createPortal } from 'react-dom';

export const CustomHtml: FC = () => {
  const stageState = useSelector((state: RootState) => state.stage);
  const { customHtml } = stageState;
  if (!customHtml || customHtml.length === 0) {
    return null;
  }
  // 优先渲染到 #pixiContianer，否则 fallback 到 body
  const pixiContainer = typeof window !== 'undefined' ? document.getElementById('pixiContianer') : null;

  // 获取 fig-xxx 的舞台像素坐标
  function getFigurePosition(feature: string | undefined): { left?: number; top?: number } | undefined {
    if (!feature) return undefined;
    const key =
      feature === 'left'
        ? 'fig-left'
        : feature === 'center'
        ? 'fig-center'
        : feature === 'right'
        ? 'fig-right'
        : undefined;
    if (!key) return undefined;
    // 通过 window.PIXIapp 获取 PixiStage 实例
    const pixiApp: any = (window as any).PIXIapp;
    if (!pixiApp?.figureObjects) return undefined;
    const fig = pixiApp.figureObjects.find((f: any) => f.key === key);
    if (fig?.pixiContainer && typeof fig.pixiContainer.toGlobal === 'function') {
      // 获取精灵（Sprite）高度
      let spriteHeight = 0;
      const sprite = fig.pixiContainer.children?.[0];
      if (sprite?.height) {
        spriteHeight = sprite.height;
      }
      // 获取 pixiContainer 的全局坐标
      const pos = fig.pixiContainer.toGlobal({ x: 0, y: 0 });
      // y 坐标减去一半高度（顶部对齐）
      return { left: pos.x, top: pos.y + spriteHeight / 6 };
    }
    return undefined;
  }

  return createPortal(
    <div className={styles.customHtmlContainer} data-testid="custom-html-container">
      {customHtml.map((item, index) => {
        const html = item.html;
        const feature = item._feature;
        // 解析 style 字符串，提取 left/top 偏移
        let leftOffset = 0;
        let topOffset = 0;
        const styleMatch = html.match(/style\s*=\s*"([^"]*)"/);
        if (styleMatch) {
          const styleStr = styleMatch[1];
          // 支持单位 px/vh/vw/%，这里只处理 px 和无单位（可自行扩展）
          const leftMatch = styleStr.match(/left\s*:\s*([\-\d.]+)(px)?/);
          const topMatch = styleStr.match(/top\s*:\s*([\-\d.]+)(px)?/);
          if (leftMatch) leftOffset = parseFloat(leftMatch[1]);
          if (topMatch) topOffset = parseFloat(topMatch[1]);
        }
        let style: React.CSSProperties = { position: 'absolute', zIndex: 10000 + index };
        if (feature) {
          const pos = getFigurePosition(feature);
          if (pos) {
            style.left = (pos.left ?? 0) + leftOffset;
            style.top = (pos.top ?? 0) + topOffset;
            style.transform = 'translate(-50%, -50%)';
            style.pointerEvents = 'none';
          }
        } else {
          // 没有 feature，直接用 left/top 绝对定位
          if (!isNaN(leftOffset)) style.left = leftOffset;
          if (!isNaN(topOffset)) style.top = topOffset;
        }
        return (
          <div
            key={`custom-html-${index}`}
            className={styles.customHtmlItem}
            data-testid={`custom-html-item-${index}`}
            dangerouslySetInnerHTML={{ __html: html }}
            style={style}
          />
        );
      })}
    </div>,
    pixiContainer || document.body,
  );
};
