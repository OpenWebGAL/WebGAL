import { WebgalCore } from '@/Core/webgalCore';
import { Live2DCore } from '@/Core/live2DCore';

export const WebGAL = new WebgalCore();
export const Live2D = new Live2DCore();

// 调试，不调试给去掉
// @ts-ignore
// window.WebGAL = WebGAL;
