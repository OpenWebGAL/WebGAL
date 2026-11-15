import React from 'react';
import ReactDOM from 'react-dom';
import * as jsxRuntime from 'react/jsx-runtime';
import { css, cx, injectGlobal, keyframes } from '@emotion/css';
import { __INFO } from '@/config/info';
import type { ScreenPartDefinition, UiScreenId } from '@/screens/contracts';
import { parseRichTextLines, renderRichText, renderRichTextLines } from './richTextRenderer';
import { resolveScreenAssetUrl, useScreenParts } from './styleRuntime';
import { UI_SDK_ICONS, type UiSdkIcons } from './uiIcons';

export interface WebgalUiSdk {
  version: string;
  react: typeof React;
  reactDom: typeof ReactDOM;
  jsxRuntime: typeof jsxRuntime;
  emotion: {
    css: typeof css;
    cx: typeof cx;
    keyframes: typeof keyframes;
    injectGlobal: typeof injectGlobal;
  };
  icons: Readonly<UiSdkIcons>;
  resolveAssetUrl: (relativePath: string, screenBaseUrl?: string | null) => string;
  resolveScreenAssetUrl: (relativePath: string, screenBaseUrl?: string | null) => string;
  renderRichText: typeof renderRichText;
  renderRichTextLines: typeof renderRichTextLines;
  parseRichTextLines: typeof parseRichTextLines;
  useScreenParts: (
    screen: UiScreenId,
    parts: ScreenPartDefinition[],
    defaultCssText: string,
  ) => { rootProps: { 'data-webgal-screen': UiScreenId; className: string } };
}

declare global {
  interface Window {
    __WEBGAL_UI_SDK__?: WebgalUiSdk;
  }
  // eslint-disable-next-line no-var
  var __WEBGAL_UI_SDK__: WebgalUiSdk | undefined;
}

export function createWebgalUiSdk(): WebgalUiSdk {
  return Object.freeze({
    version: __INFO.version,
    react: React,
    reactDom: ReactDOM,
    jsxRuntime,
    emotion: Object.freeze({ css, cx, keyframes, injectGlobal }),
    icons: Object.freeze(UI_SDK_ICONS),
    resolveAssetUrl: resolveScreenAssetUrl,
    resolveScreenAssetUrl,
    renderRichText,
    renderRichTextLines,
    parseRichTextLines,
    useScreenParts,
  });
}

export function installGlobalUiSdk(): WebgalUiSdk {
  if (typeof window === 'undefined') {
    return createWebgalUiSdk();
  }
  const existing = window.__WEBGAL_UI_SDK__;
  if (existing) {
    return existing;
  }
  const sdk = createWebgalUiSdk();
  Object.defineProperty(window, '__WEBGAL_UI_SDK__', {
    value: sdk,
    writable: false,
    configurable: false,
    enumerable: true,
  });
  return sdk;
}

export { useScreenParts, resolveScreenAssetUrl, renderRichText, renderRichTextLines, parseRichTextLines };
export type { RichTextToken, RichTextParseOptions, RichTextRenderOptions } from './richTextRenderer';
