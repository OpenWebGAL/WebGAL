/**
 * 存档/读档一致性测试
 *
 * 验证：
 * 1. 任意步骤保存后读取，核心状态完全一致
 * 2. 从读档点继续推进与不读档继续推进后再读档，最终到达同一步骤时状态一致
 * 3. 多个存档槽位互不干扰
 * 4. 存档数据包含正确的 backlog 和 scene 信息
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { Page } from 'playwright';
import {
  createTestPage,
  startGameAndWait,
  closeBrowser,
  callNextSentence,
  callStopAll,
  callSaveGame,
  callLoadGame,
  callGenerateCurrentStageData,
  injectSceneAndRun,
  takeSnapshot,
  getCurrentSentenceId,
  getBacklogLength,
  delay,
  compareSnapshots,
  generateTestScene,
} from '../utils';

/** 推进 N 步（每步双击模式：第一次完成动画，第二次推进） */
async function advanceSteps(page: Page, steps: number): Promise<void> {
  for (let i = 0; i < steps; i++) {
    await callNextSentence(page);
    await delay(200);
    await callNextSentence(page);
    await delay(300);
  }
}

describe('Save/Load Consistency Test', () => {
  let page: Page;

  beforeAll(async () => {
    page = await createTestPage();
    await startGameAndWait(page);
    await injectSceneAndRun(page, generateTestScene(100, '存档'), 'save-test');
    await delay(500);
  });

  afterAll(async () => {
    if (page) {
      await callStopAll(page).catch(() => {});
      await page.context().close();
    }
    await closeBrowser();
  });

  it('should save and load with identical core state', async () => {
    await advanceSteps(page, 5);

    const snapshotBeforeSave = await takeSnapshot(page);
    await callSaveGame(page, 90);
    await delay(500);

    await advanceSteps(page, 5);

    const snapshotAfterAdvance = await takeSnapshot(page);
    expect(snapshotAfterAdvance.sceneState.currentSentenceId).not.toBe(
      snapshotBeforeSave.sceneState.currentSentenceId,
    );

    await callLoadGame(page, 90);
    await delay(2000);

    const snapshotAfterLoad = await takeSnapshot(page);
    const { match, diffs } = compareSnapshots(snapshotBeforeSave, snapshotAfterLoad);
    expect(diffs).toEqual([]);
    expect(match).toBe(true);
  });

  it('should produce consistent state when replaying from a save point', async () => {
    await advanceSteps(page, 3);

    await callSaveGame(page, 91);
    await delay(500);
    const savedSnapshot = await takeSnapshot(page);

    const STEPS = 4;
    await advanceSteps(page, STEPS);
    const targetSnapshot = await takeSnapshot(page);

    await callLoadGame(page, 91);
    await delay(2000);

    await advanceSteps(page, STEPS);
    const replaySnapshot = await takeSnapshot(page);

    expect(replaySnapshot.sceneState.currentSentenceId).toBe(
      targetSnapshot.sceneState.currentSentenceId,
    );
    expect(replaySnapshot.sceneState.sceneName).toBe(targetSnapshot.sceneState.sceneName);
  });

  it('should support multiple save slots independently', async () => {
    await advanceSteps(page, 2);
    const snapshotA = await takeSnapshot(page);
    await callSaveGame(page, 92);
    await delay(500);

    await advanceSteps(page, 4);
    const snapshotB = await takeSnapshot(page);
    await callSaveGame(page, 93);
    await delay(500);

    await callLoadGame(page, 92);
    await delay(2000);
    const loadedA = await takeSnapshot(page);
    const resultA = compareSnapshots(snapshotA, loadedA);
    expect(resultA.diffs).toEqual([]);

    await callLoadGame(page, 93);
    await delay(2000);
    const loadedB = await takeSnapshot(page);
    const resultB = compareSnapshots(snapshotB, loadedB);
    expect(resultB.diffs).toEqual([]);
  });

  it('should preserve backlog and scene data in save', async () => {
    await advanceSteps(page, 5);

    const backlogBefore = await getBacklogLength(page);
    const sentenceIdBefore = await getCurrentSentenceId(page);

    await callSaveGame(page, 94);
    await delay(500);

    const saveData = (await callGenerateCurrentStageData(page, 94)) as Record<string, unknown>;
    expect(saveData).toHaveProperty('nowStageState');
    expect(saveData).toHaveProperty('backlog');
    expect(saveData).toHaveProperty('sceneData');

    await advanceSteps(page, 3);

    await callLoadGame(page, 94);
    await delay(2000);

    const backlogAfter = await getBacklogLength(page);
    const sentenceIdAfter = await getCurrentSentenceId(page);

    expect(backlogAfter).toBe(backlogBefore);
    expect(sentenceIdAfter).toBe(sentenceIdBefore);
  });
});
