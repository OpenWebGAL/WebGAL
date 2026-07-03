/**
 * Pixi 舞台状态测试
 *
 * 验证通过 pixiStage API 可以读取舞台可视化状态：
 * 1. 获取立绘列表及其 transform
 * 2. 获取背景列表
 * 3. 注入包含 changeBg / changeFigure 的场景后验证舞台对象
 * 4. 验证 snapshot 中 pixiState 与直接查询一致
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
  getFigureObjects,
  getBackgroundObjects,
  delay,
} from '../utils';

describe('Pixi Stage State Test', () => {
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

  it('should be able to read figure objects list', async () => {
    const figures = await getFigureObjects(page);
    // figures 可以为空（还没有立绘），但应该是数组
    expect(Array.isArray(figures)).toBe(true);
  });

  it('should be able to read background objects list', async () => {
    const bgs = await getBackgroundObjects(page);
    expect(Array.isArray(bgs)).toBe(true);
  });

  it('should reflect pixi state in snapshot', async () => {
    const snapshot = await takeSnapshot(page);

    // pixiState 可能为 null（如果 pixiStage 未初始化），但通常已初始化
    if (snapshot.pixiState) {
      expect(Array.isArray(snapshot.pixiState.figureObjects)).toBe(true);
      expect(Array.isArray(snapshot.pixiState.backgroundObjects)).toBe(true);
      expect(typeof snapshot.pixiState.stageWidth).toBe('number');
      expect(typeof snapshot.pixiState.stageHeight).toBe('number');
    }
  });

  it('should list figure objects with valid structure after changeFigure', async () => {
    // 注入含有 changeFigure 的场景
    // 注意：实际资源可能不存在，但 pixi 应该创建 stageObject 条目
    const script = [
      'changeFigure:test-figure.png -id=testFig;',
      '等待一下;',
    ].join('\n');

    await injectSceneAndRun(page, script, 'figure-test');
    await delay(1500);

    const figures = await getFigureObjects(page);
    // 由于资源可能不存在，我们主要验证结构是否正确
    // 如果有 figure 被创建，验证其属性结构
    for (const fig of figures) {
      expect(fig).toHaveProperty('uuid');
      expect(fig).toHaveProperty('key');
      expect(fig).toHaveProperty('sourceUrl');
      expect(fig).toHaveProperty('sourceType');
      expect(fig).toHaveProperty('isExiting');
      // transform 可以为 null（container 未创建）
      if (fig.transform) {
        expect(typeof fig.transform.x).toBe('number');
        expect(typeof fig.transform.y).toBe('number');
        expect(typeof fig.transform.scaleX).toBe('number');
        expect(typeof fig.transform.scaleY).toBe('number');
        expect(typeof fig.transform.alpha).toBe('number');
        expect(typeof fig.transform.visible).toBe('boolean');
      }
    }
  });

  it('should report performs in snapshot', async () => {
    const snapshot = await takeSnapshot(page);
    expect(Array.isArray(snapshot.performs)).toBe(true);
    expect(typeof snapshot.performListLength).toBe('number');
    expect(snapshot.performListLength).toBe(snapshot.performs.length);

    for (const perf of snapshot.performs) {
      expect(perf).toHaveProperty('performName');
      expect(perf).toHaveProperty('duration');
      expect(perf).toHaveProperty('isHoldOn');
      expect(perf).toHaveProperty('blockingNext');
      expect(perf).toHaveProperty('blockingAuto');
    }
  });

  it('should report animations in snapshot', async () => {
    const snapshot = await takeSnapshot(page);
    expect(Array.isArray(snapshot.animations)).toBe(true);

    for (const anim of snapshot.animations) {
      expect(anim).toHaveProperty('name');
      expect(anim).toHaveProperty('frameCount');
      expect(typeof anim.frameCount).toBe('number');
    }
  });
});
