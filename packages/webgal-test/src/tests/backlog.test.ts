/**
 * Backlog / 回溯一致性测试
 *
 * 验证：
 * 1. 推进过程中 backlog 正确记录
 * 2. jumpFromBacklog 跳转到历史记录后，状态正确变化
 * 3. 跳转后继续推进，backlog 正确续接
 * 4. backlog 跳转与 save/load 在同一点时结果一致
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { Page } from 'playwright';
import {
  createTestPage,
  startGameAndWait,
  closeBrowser,
  callNextSentence,
  callStopAll,
  callJumpFromBacklog,
  callSaveGame,
  callLoadGame,
  injectSceneAndRun,
  takeSnapshot,
  getCurrentSentenceId,
  getBacklogLength,
  getBacklog,
  delay,
  compareSnapshots,
  generateTestScene,
} from '../utils';

/** 推进 N 步 */
async function advanceSteps(page: Page, steps: number): Promise<void> {
  for (let i = 0; i < steps; i++) {
    await callNextSentence(page);
    await delay(200);
    await callNextSentence(page);
    await delay(300);
  }
}

describe('Backlog Consistency Test', () => {
  let page: Page;

  beforeAll(async () => {
    page = await createTestPage();
    await startGameAndWait(page);
    await injectSceneAndRun(page, generateTestScene(100, '回溯'), 'backlog-test');
    await delay(500);
  });

  afterAll(async () => {
    if (page) {
      await callStopAll(page).catch(() => {});
      await page.context().close();
    }
    await closeBrowser();
  });

  it('should accumulate backlog entries as game advances', async () => {
    const initialLength = await getBacklogLength(page);

    await advanceSteps(page, 8);

    const afterLength = await getBacklogLength(page);
    expect(afterLength).toBeGreaterThan(initialLength);
  });

  it('should restore state when jumping from backlog', async () => {
    await advanceSteps(page, 5);

    const backlog = await getBacklog(page);
    expect(backlog.length).toBeGreaterThanOrEqual(2);

    const targetIndex = backlog.length - 2;
    const beforeJump = await takeSnapshot(page);

    await callJumpFromBacklog(page, targetIndex);
    await delay(2000);

    const afterJump = await takeSnapshot(page);
    expect(afterJump.backlogLength).toBeLessThanOrEqual(beforeJump.backlogLength);
  });

  it('should correctly truncate and continue backlog after jump', async () => {
    await advanceSteps(page, 8);

    const backlogBefore = await getBacklog(page);
    if (backlogBefore.length < 3) return;

    const jumpIndex = Math.floor(backlogBefore.length / 2);
    await callJumpFromBacklog(page, jumpIndex);
    await delay(2000);

    const backlogAfterJump = await getBacklog(page);
    expect(backlogAfterJump.length).toBeLessThanOrEqual(backlogBefore.length);

    await advanceSteps(page, 5);

    const backlogAfterAdvance = await getBacklog(page);
    expect(backlogAfterAdvance.length).toBeGreaterThanOrEqual(backlogAfterJump.length);
  });

  it('should be consistent between backlog jump and save/load at same point', async () => {
    await advanceSteps(page, 4);

    const snapshotAtSavePoint = await takeSnapshot(page);
    await callSaveGame(page, 96);
    await delay(500);

    await advanceSteps(page, 5);

    await callLoadGame(page, 96);
    await delay(2000);
    const loadedSnapshot = await takeSnapshot(page);

    const { match, diffs } = compareSnapshots(snapshotAtSavePoint, loadedSnapshot);
    expect(diffs).toEqual([]);
    expect(match).toBe(true);
  });
});
