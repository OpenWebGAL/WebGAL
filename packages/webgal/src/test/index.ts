/**
 * WebGAL 测试模式入口
 *
 * 当 __WEBGAL_TEST__ 编译标志启用时，暴露内核 API 到 window 供 vitest 调用
 */
import { exposeTestAPI } from '@/test/exposeTestAPI';

export function initTestFramework(): void {
  if (document.readyState === 'complete') {
    setTimeout(exposeTestAPI, 100);
  } else {
    window.addEventListener('load', () => {
      setTimeout(exposeTestAPI, 100);
    });
  }
}
