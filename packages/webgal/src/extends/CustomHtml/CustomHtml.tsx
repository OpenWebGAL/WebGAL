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
    const key =import React, { FC } from 'react';
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
      const sprite = fig.pixiContainer。children?.[0];
      if (sprite?.height) {
        spriteHeight = sprite.height;
      }
      // 获取 pixiContainer 的全局坐标
      const pos = fig.pixiContainer。toGlobal({ x: 0, y: 0 });
      // y 坐标减去一半高度（顶部对齐）
      return { left: pos.x， top: pos.y + spriteHeight / 6 };
    }
    return undefined;
  }

  return createPortal(
    <div className={styles.customHtmlContainer} data-testid="custom-html-container">
      {customHtml.map((item, index) => {
        const html = item.html;
        const feature = item._feature;

        // 使用从store中传入的style对象，如果不存在则创建默认样式
        let style: React.CSSProperties = {
          position: 'absolute',
          zIndex: 10000 + index,
          ...(item.style || {}),
        };

        if (feature) {
          const pos = getFigurePosition(feature);
          if (pos) {
            // 使用CSS的calc函数来处理偏移，而不是手动计算像素值
            if (item.style?.left !== undefined) {
              style.left = `calc(${pos.left}px + ${item.style.left})`;
            } else {
              style.left = `${pos.left}px`;
            }

            if (item.style?.top !== undefined) {
              style.top = `calc(${pos.top}px + ${item.style.top})`;
            } else {
              style.top = `${pos.top}px`;
            }

            style.transform = 'translate(-50%, -50%)';
            style.pointerEvents = 'none';
          }
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

        // 使用从store中传入的style对象，如果不存在则创建默认样式
        let style: React.CSSProperties = {
          position: 'absolute',
          zIndex: 10000 + index,
          ...(item.style || {}),
        };

        if (feature) {
          const pos = getFigurePosition(feature);
          if (pos) {
            // 使用CSS的calc函数来处理偏移，而不是手动计算像素值
            if (item.style?.left !== undefined) {
              style.left = `calc(${pos.left}px + ${item.style.left})`;
            } else {
              style.left = `${pos.left}px`;
            }

            if (item.style?.top !== undefined) {
              style.top = `calc(${pos.top}px + ${item.style.top})`;
            } else {
              style.top = `${pos.top}px`;
            }

            style.transform = 'translate(-50%, -50%)';
            style.pointerEvents = 'none';
          }
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
