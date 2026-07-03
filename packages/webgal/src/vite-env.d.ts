/// <reference types="vite/client" />
/// <reference types="unplugin-info/client" />

declare const __WEBGAL_TEST__: boolean;

interface Window {
  __WEBGAL_DEVICE_INFO__?: {
    isIOS?: boolean;
  };
  webgalTest?: import('@/test/types').IWebGALTestAPI;
  /** Pixi 调试引用（由 PixiController 设置） */
  __PIXI_APP__?: unknown;
  PIXIapp?: unknown;
}
