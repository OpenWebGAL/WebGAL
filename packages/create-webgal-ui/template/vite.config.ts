import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

const SDK_VIRTUAL_PREFIX = '\0webgal-sdk:';

const SDK_ICON_NAMES = [
  'Acoustic',
  'AlignTextLeftOne',
  'Attention',
  'CheckOne',
  'Close',
  'CloseSmall',
  'ConnectionPointTwo',
  'DoubleDown',
  'DoubleRight',
  'DoubleUp',
  'Down',
  'FolderOpen',
  'FullScreen',
  'GoEnd',
  'GoStart',
  'HamburgerButton',
  'Home',
  'Info',
  'Left',
  'Lock',
  'Logout',
  'Music',
  'MusicList',
  'OffScreen',
  'PauseOne',
  'Picture',
  'Play',
  'PlayOne',
  'PreviewCloseOne',
  'PreviewOpen',
  'ReplayMusic',
  'Return',
  'Right',
  'Save',
  'SettingTwo',
  'SquareSmall',
  'Theme',
  'Translate',
  'TreeDiagram',
  'Unlock',
  'Up',
  'VolumeMute',
  'VolumeNotice',
  'VolumeSmall',
];

function webgalHostSdkExternalPlugin(): Plugin {
  const virtualModules: Record<string, string> = {
    react: `
const R = globalThis.__WEBGAL_UI_SDK__.react;
export default R;
export const {
  Children, Component, Fragment, PureComponent, StrictMode, Suspense,
  cloneElement, createContext, createElement, createRef, forwardRef,
  isValidElement, lazy, memo, useCallback, useContext, useEffect,
  useId, useImperativeHandle, useLayoutEffect, useMemo, useReducer,
  useRef, useState, useTransition, useDeferredValue
} = R;
`,
    'react-dom': `
const RD = globalThis.__WEBGAL_UI_SDK__.reactDom;
export default RD;
export const { createPortal, flushSync } = RD;
`,
    'react/jsx-runtime': `
const J = globalThis.__WEBGAL_UI_SDK__.jsxRuntime;
export const { Fragment, jsx, jsxs } = J;
export default J;
`,
    '@emotion/css': `
const E = globalThis.__WEBGAL_UI_SDK__.emotion;
export const { css, cx, keyframes, injectGlobal } = E;
`,
    '@icon-park/react': `
const I = globalThis.__WEBGAL_UI_SDK__.icons;
export default I;
export const { ${SDK_ICON_NAMES.join(', ')} } = I;
`,
    '@webgal/ui-sdk': `
const SDK = globalThis.__WEBGAL_UI_SDK__;
export default SDK;
export const {
  useScreenParts,
  resolveAssetUrl,
  resolveScreenAssetUrl,
  renderRichText,
  renderRichTextLines,
  parseRichTextLines,
  emotion,
  icons,
  version
} = SDK;
`,
  };

  return {
    name: 'webgal-host-sdk-external',
    enforce: 'pre',
    resolveId(id) {
      if (id in virtualModules) {
        return `${SDK_VIRTUAL_PREFIX}${id}`;
      }
      return null;
    },
    load(id) {
      if (!id.startsWith(SDK_VIRTUAL_PREFIX)) return null;
      return virtualModules[id.slice(SDK_VIRTUAL_PREFIX.length)] ?? null;
    },
  };
}

export default defineConfig({
  plugins: [webgalHostSdkExternalPlugin(), react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    lib: {
      entry: 'src/index.tsx',
      formats: ['es'],
      fileName: () => 'index.js',
    },
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
  },
});
