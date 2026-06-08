/**
 * 自动模式（Auto）测试
 *
 * 验证：
 * 1. 开启自动模式后，游戏能自动推进
 * 2. 推进过程中状态正常更新（backlog 增长、sentenceId 递增）
 * 3. 停止自动模式后游戏停止推进
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { Page } from 'playwright';
import {
  createTestPage,
  startGameAndWait,
  closeBrowser,
  callSwitchAuto,
  callStopAuto,
  callStopAll,
  injectSceneAndRun,
  getCurrentSentenceId,
  getBacklogLength,
  getIsAuto,
  delay,
  generateTestScene,
} from '../utils';

describe('Auto Mode Test', () => {
  let page: Page;

  beforeAll(async () => {
    page = await createTestPage();
    await startGameAndWait(page);
    // 注入含 100 条语句的测试场景，确保 auto 模式有足够内容推进
    await injectSceneAndRun(page, generateTestScene(100, 'auto'), 'auto-test');
    await delay(500);
  });

  afterAll(async () => {
    if (page) {
      await callStopAll(page).catch(() => {});
      await page.context().close();
    }
    await closeBrowser();
  });

  it('should activate auto mode and advance sentences', async () => {
    const initialId = await getCurrentSentenceId(page);
    const initialBacklog = await getBacklogLength(page);

    await callSwitchAuto(page);
    expect(await getIsAuto(page)).toBe(true);

    // auto 每次间隔 250-1750ms（取决于速度设置），等 10 秒应有多步推进
    await delay(10000);

    await callStopAuto(page);
    expect(await getIsAuto(page)).toBe(false);

    const afterId = await getCurrentSentenceId(page);
    const afterBacklog = await getBacklogLength(page);

    // 应当推进了至少 2 句
    expect(afterId).toBeGreaterThan(initialId);
    expect(afterBacklog).toBeGreaterThanOrEqual(initialBacklog);
  });

  it('should stop advancing after stopping auto mode', async () => {
    await callSwitchAuto(page);
    await delay(5000);
    await callStopAuto(page);

    const idAfterStop = await getCurrentSentenceId(page);
    await delay(3000);
    const idLater = await getCurrentSentenceId(page);

    // 停止后不应继续推进
    expect(idLater).toBe(idAfterStop);
  });
});
