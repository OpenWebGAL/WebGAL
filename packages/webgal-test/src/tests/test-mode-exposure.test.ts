/**
 * 测试模式暴露与构建产物校验
 *
 * 这些断言验证当前浏览器实际加载的是 build:test 产物，而不是陈旧的普通生产 dist。
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { Page } from 'playwright';
import {
  closeBrowser,
  createTestPage,
  getActiveAnimations,
  getLockedTargets,
  getTestMetadata,
  getTextState,
  resetRuntime,
  takeSnapshot,
} from '../utils';

describe('Test Mode Exposure', () => {
  let page: Page;

  beforeAll(async () => {
    page = await createTestPage();
  });

  afterAll(async () => {
    if (page) {
      await page.context().close();
    }
    await closeBrowser();
  });

  it('should expose the test kernel from the built bundle', async () => {
    const metadata = await getTestMetadata(page);

    expect(metadata.testMode).toBe(true);
    expect(metadata.apiVersion).toBeGreaterThanOrEqual(2);
    expect(metadata.locationHref).toContain('localhost');
  });

  it('should expose runtime observability helpers', async () => {
    await resetRuntime(page);

    const snapshot = await takeSnapshot(page);
    const textState = await getTextState(page);
    const activeAnimations = await getActiveAnimations(page);
    const lockedTargets = await getLockedTargets(page);

    expect(snapshot.metadata.testMode).toBe(true);
    expect(snapshot.pixiState).not.toBeNull();
    expect(snapshot.textState.pendingElements).toBe(textState.pendingElements);
    expect(activeAnimations).toEqual([]);
    expect(lockedTargets).toEqual([]);
  });
});
