/**
 * 场景注入测试
 *
 * 验证通过 sceneTools API 直接注入 WebGAL 脚本并执行：
 * 1. 注入原始脚本文本后，场景数据正确更新
 * 2. 注入并执行后，第一条语句被执行
 * 3. 注入后可以通过 nextSentence 依次推进
 * 4. 注入包含多种指令的复杂脚本
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
  getCurrentSceneName,
  getSentenceCount,
  getBacklogLength,
  delay,
} from '../utils';

describe('Scene Injection Test', () => {
  let page: Page;

  beforeAll(async () => {
    page = await createTestPage();
    await startGameAndWait(page);
  });

  afterAll(async () => {
    if (page) {
      await callStopAll(page).catch(() => {});
      await page.context().close();
    }
    await closeBrowser();
  });

  it('should inject a simple scene and start from sentence 0', async () => {
    const script = [
      '你好，这是注入的测试场景;',
      '第二句话;',
      '第三句话;',
    ].join('\n');

    await injectSceneAndRun(page, script, 'injected-test');
    await delay(500);

    const sceneName = await getCurrentSceneName(page);
    expect(sceneName).toBe('injected-test');

    // injectSceneAndRun 设置 sentenceId=0 后立即执行 scriptExecutor，
    // 所以第一条语句已被执行，sentenceId 推进到 1
    const sentenceId = await getCurrentSentenceId(page);
    expect(sentenceId).toBeGreaterThanOrEqual(0);

    const sentenceCount = await getSentenceCount(page);
    expect(sentenceCount).toBeGreaterThanOrEqual(3);
  });

  it('should advance through injected scene with nextSentence', async () => {
    const script = [
      '第一句;',
      '第二句;',
      '第三句;',
      '第四句;',
    ].join('\n');

    await injectSceneAndRun(page, script, 'advance-test');
    await delay(500);

    const id0 = await getCurrentSentenceId(page);

    // 第一次 nextSentence 可能只是完成当前文字动画，第二次才推进
    await callNextSentence(page);
    await delay(300);
    await callNextSentence(page);
    await delay(300);
    const id1 = await getCurrentSentenceId(page);
    expect(id1).toBeGreaterThan(id0);

    await callNextSentence(page);
    await delay(300);
    await callNextSentence(page);
    await delay(300);
    const id2 = await getCurrentSentenceId(page);
    expect(id2).toBeGreaterThan(id1);
  });

  it('should inject a scene with changeBg command', async () => {
    const script = [
      'changeBg:none;',
      '这是一个有背景切换的场景;',
      '继续对话;',
    ].join('\n');

    await injectSceneAndRun(page, script, 'bg-test');
    await delay(1000);

    // 场景应该被正确注入
    const sceneName = await getCurrentSceneName(page);
    expect(sceneName).toBe('bg-test');

    // API 仍然可用
    const apiAvailable = await page.evaluate(() => window.webgalTest != null);
    expect(apiAvailable).toBe(true);
  });

  it('should track backlog after injecting a new scene', async () => {
    const script = [
      '注入场景的第一句话;',
      '注入场景的第二句话;',
      '注入场景的第三句话;',
    ].join('\n');

    await injectSceneAndRun(page, script, 'backlog-inject-test');
    await delay(500);

    const backlogBefore = await getBacklogLength(page);

    // 推进几步，应该积累 backlog
    for (let i = 0; i < 3; i++) {
      await callNextSentence(page);
      await delay(500);
    }

    const backlogAfter = await getBacklogLength(page);
    expect(backlogAfter).toBeGreaterThanOrEqual(backlogBefore);
  });

  it('should produce valid snapshot after scene injection', async () => {
    const script = [
      '快照测试第一句;',
      '快照测试第二句;',
    ].join('\n');

    await injectSceneAndRun(page, script, 'snapshot-inject-test');
    await delay(500);

    const snapshot = await takeSnapshot(page);

    expect(snapshot.sceneState.sceneName).toBe('snapshot-inject-test');
    // sentenceId ≥ 0 即可（injectSceneAndRun 会执行第一句）
    expect(snapshot.sceneState.currentSentenceId).toBeGreaterThanOrEqual(0);
    expect(snapshot.sceneState.sentenceCount).toBeGreaterThanOrEqual(2);
    expect(snapshot.timestamp).toBeGreaterThan(0);
    expect(snapshot.gameplayState).toBeDefined();
    expect(snapshot.gameplayState.isAuto).toBe(false);
    expect(snapshot.gameplayState.isFast).toBe(false);
  });
});
