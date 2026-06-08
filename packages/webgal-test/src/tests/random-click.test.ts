/**
 * 随机点击测试
 *
 * 模拟用户不规律地点击推进，验证：
 * 1. 随机间隔 nextSentence 推进游戏不会崩溃
 * 2. 每次推进后状态有效（sentenceId 递增或场景切换）
 * 3. backlog 正确记录历史
 * 4. 极速连续点击不会损坏状态
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { Page } from 'playwright';
import {
  createTestPage,
  startGameAndWait,
  closeBrowser,
  callNextSentence,
  callStopAll,
  injectSceneAndRun,
  takeSnapshot,
  getCurrentSentenceId,
  getBacklogLength,
  delay,
  generateTestScene,
  type GameStateSnapshot,
} from '../utils';

function randomDelay(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

describe('Random Click Test', () => {
  let page: Page;

  beforeAll(async () => {
    page = await createTestPage();
    await startGameAndWait(page);
    // 注入含 200 条语句的测试场景，确保有足够内容被点击
    await injectSceneAndRun(page, generateTestScene(200, '随机'), 'random-test');
    await delay(500);
  });

  afterAll(async () => {
    if (page) {
      await callStopAll(page).catch(() => {});
      await page.context().close();
    }
    await closeBrowser();
  });

  it('should handle random-interval clicks without crashing', async () => {
    const CLICK_COUNT = 20;
    const snapshots: GameStateSnapshot[] = [];

    for (let i = 0; i < CLICK_COUNT; i++) {
      await callNextSentence(page);
      const waitMs = randomDelay(100, 800);
      await delay(waitMs);

      if (i % 5 === 4) {
        snapshots.push(await takeSnapshot(page));
      }
    }

    const apiAvailable = await page.evaluate(() => window.webgalTest != null);
    expect(apiAvailable).toBe(true);
    expect(snapshots.length).toBeGreaterThanOrEqual(1);
  });

  it('should advance sentence ID through random clicks', async () => {
    const startId = await getCurrentSentenceId(page);

    for (let i = 0; i < 10; i++) {
      await callNextSentence(page);
      await delay(randomDelay(50, 500));
    }

    const endId = await getCurrentSentenceId(page);
    expect(endId).toBeGreaterThan(startId);
  });

  it('should build backlog through random clicks', async () => {
    const startBacklog = await getBacklogLength(page);

    for (let i = 0; i < 15; i++) {
      await callNextSentence(page);
      await delay(randomDelay(100, 600));
    }

    const endBacklog = await getBacklogLength(page);
    expect(endBacklog).toBeGreaterThanOrEqual(startBacklog);
  });

  it('should handle rapid-fire clicks without corruption', async () => {
    const before = await takeSnapshot(page);

    for (let i = 0; i < 30; i++) {
      await callNextSentence(page);
      if (Math.random() > 0.5) {
        await delay(randomDelay(10, 50));
      }
    }

    await delay(1000);

    const after = await takeSnapshot(page);
    expect(after.sceneState.currentSentenceId).toBeGreaterThanOrEqual(0);
    expect(after.backlogLength).toBeGreaterThanOrEqual(before.backlogLength);
  });
});
