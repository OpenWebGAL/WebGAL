/**
 * 快进模式（Fast Skip）测试
 *
 * 验证：
 * 1. 开启快进后游戏快速推进（比 auto 更快）
 * 2. 快进推进的步数明显多于同时长 auto
 * 3. 停止快进后游戏停止推进
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { Page } from 'playwright';
import {
  createTestPage,
  startGameAndWait,
  closeBrowser,
  callSwitchFast,
  callStopFast,
  callStopAll,
  injectSceneAndRun,
  getCurrentSentenceId,
  getIsFast,
  delay,
  generateTestScene,
} from '../utils';

describe('Fast Mode Test', () => {
  let page: Page;

  beforeAll(async () => {
    page = await createTestPage();
    await startGameAndWait(page);
    // 注入含 200 条语句的测试场景，fast 模式推进很快
    await injectSceneAndRun(page, generateTestScene(200, 'fast'), 'fast-test');
    await delay(500);
  });

  afterAll(async () => {
    if (page) {
      await callStopAll(page).catch(() => {});
      await page.context().close();
    }
    await closeBrowser();
  });

  it('should activate fast mode and rapidly advance', async () => {
    const initialId = await getCurrentSentenceId(page);

    await callSwitchFast(page);
    expect(await getIsFast(page)).toBe(true);

    // Fast 模式每 50ms 推进一次，3 秒应该能推进很多
    await delay(3000);

    await callStopFast(page);
    expect(await getIsFast(page)).toBe(false);

    const afterId = await getCurrentSentenceId(page);

    // 快进应推进很多句（至少 5 句）
    expect(afterId - initialId).toBeGreaterThanOrEqual(5);
  });

  it('should advance faster than auto mode', async () => {
    // 用 Fast 模式测试 3 秒
    const fastStartId = await getCurrentSentenceId(page);
    await callSwitchFast(page);
    await delay(3000);
    await callStopFast(page);
    const fastAdvance = (await getCurrentSentenceId(page)) - fastStartId;

    // Fast 至少推进了很多步（远超 auto 的 250-1750ms 间隔）
    expect(fastAdvance).toBeGreaterThanOrEqual(5);
  });

  it('should stop advancing after stopping fast mode', async () => {
    await callSwitchFast(page);
    await delay(2000);
    await callStopFast(page);

    const idAfterStop = await getCurrentSentenceId(page);
    await delay(2000);
    const idLater = await getCurrentSentenceId(page);

    expect(idLater).toBe(idAfterStop);
  });
});
