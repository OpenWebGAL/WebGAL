/**
 * 鼠标点击推进哲学测试
 *
 * Galgame 常见语义：当前句子还有演出或文字渐显时，第一次点击只把当前状态推到终态；
 * 当前状态已经终态时，再次点击才进入下一句。
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { Page } from 'playwright';
import {
  clickStage,
  closeBrowser,
  createTestPage,
  getCurrentSentenceId,
  getStageState,
  injectSceneAndRun,
  setOptionData,
  waitForSentenceAdvance,
  waitForTextPending,
  waitForTextSettled,
  waitForNoTransientPerforms,
  waitForTransientPerform,
} from '../utils';

describe('Click To Settle Semantics', () => {
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

  it('should settle a revealing dialogue before advancing to the next sentence', async () => {
    await setOptionData(page, 'textSpeed', 0);
    await injectSceneAndRun(
      page,
      [
        '第一句很长很长很长很长很长很长很长很长很长，用来确保文字仍在渐显;',
        '第二句只有在第一句终态后再次点击才应该出现;',
      ].join('\n'),
      'click-settle-dialogue',
    );

    await waitForTransientPerform(page);
    const pendingText = await waitForTextPending(page);
    const sentenceIdWhileRevealing = await getCurrentSentenceId(page);
    expect(pendingText.shownText).toContain('第一句');

    await clickStage(page);
    await waitForNoTransientPerforms(page);
    const settledText = await waitForTextSettled(page);
    const sentenceIdAfterSettleClick = await getCurrentSentenceId(page);
    const stageAfterSettleClick = await getStageState(page);

    expect(sentenceIdAfterSettleClick).toBe(sentenceIdWhileRevealing);
    expect(settledText.pendingElements).toBe(0);
    expect(stageAfterSettleClick.showText).toContain('第一句');

    await clickStage(page);
    await waitForSentenceAdvance(page, sentenceIdAfterSettleClick);
    const stageAfterAdvanceClick = await getStageState(page);

    expect(stageAfterAdvanceClick.showText).toContain('第二句');
  });
});
