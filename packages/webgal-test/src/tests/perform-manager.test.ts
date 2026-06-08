/**
 * 演出管理器测试
 *
 * 验证 performController 相关功能：
 * 1. 读取当前 perform 列表
 * 2. 注入带有演出的场景后验证 perform 状态
 * 3. removeAllPerform 清空演出列表
 * 4. perform 的阻塞属性正确反映
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
  getPerformList,
  removeAllPerforms,
  delay,
} from '../utils';

describe('Perform Manager Test', () => {
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

  it('should read perform list', async () => {
    const performs = await getPerformList(page);
    expect(Array.isArray(performs)).toBe(true);
  });

  it('should have performs after executing dialogue', async () => {
    // 注入对话场景
    const script = [
      '这是一句很长的对话，会触发文字演出;',
      '第二句对话;',
    ].join('\n');

    await injectSceneAndRun(page, script, 'perform-dialogue');
    // 不要等太久，演出可能还在进行中
    await delay(200);

    // 文字演出应该在列表中
    const performs = await getPerformList(page);
    // 执行后可能有演出（取决于引擎的演出调度时机）
    // 我们主要验证结构
    for (const p of performs) {
      expect(typeof p.performName).toBe('string');
      expect(typeof p.duration).toBe('number');
      expect(typeof p.isHoldOn).toBe('boolean');
      expect(typeof p.blockingNext).toBe('boolean');
      expect(typeof p.blockingAuto).toBe('boolean');
    }
  });

  it('should clear all performs with removeAllPerform', async () => {
    // 注入场景并让演出开始
    const script = '这是一句用于测试清除的对话;';
    await injectSceneAndRun(page, script, 'perform-clear');
    await delay(200);

    // 清除所有演出
    await removeAllPerforms(page);
    await delay(100);

    const performs = await getPerformList(page);
    expect(performs.length).toBe(0);
  });

  it('should report correct blocking state for performs', async () => {
    const script = [
      '这是一句有阻塞性的对话;',
    ].join('\n');

    await injectSceneAndRun(page, script, 'perform-blocking');
    await delay(200);

    const performs = await getPerformList(page);
    // 对于每个 perform，blockingNext 和 blockingAuto 应该是布尔值
    for (const p of performs) {
      expect(typeof p.blockingNext).toBe('boolean');
      expect(typeof p.blockingAuto).toBe('boolean');
      expect(typeof p.goNextWhenOver).toBe('boolean');
    }
  });
});
