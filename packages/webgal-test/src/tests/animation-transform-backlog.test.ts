/**
 * 复杂变换、动画终态与 backlog 测试
 *
 * 覆盖内部变换 effects、Pixi 动画锁、点击终止动画、backlog 跳转恢复同一终态。
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { Page } from 'playwright';
import {
  clickStage,
  closeBrowser,
  createTestPage,
  flushBrowserTasks,
  getBacklog,
  getCurrentSentenceId,
  getLockedTargets,
  getStageEffect,
  getStageObjectByKey,
  injectSceneAndRun,
  callJumpFromBacklog,
  setOptionData,
  waitForActiveAnimationOnTarget,
  waitForNoActiveAnimationOnTarget,
  waitForNoTransientPerforms,
  waitForSentenceAdvance,
} from '../utils';

async function waitForShownText(page: Page, text: string): Promise<void> {
  await page.waitForFunction(
    (expectedText) => window.webgalTest!.store.getState().stage.showText.includes(expectedText),
    text,
    { timeout: 10_000 },
  );
}

function transformOf(effect: Awaited<ReturnType<typeof getStageEffect>>): Record<string, any> {
  expect(effect).not.toBeNull();
  return effect!.transform as Record<string, any>;
}

describe('Animation Transform Backlog', () => {
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

  it('should settle transform animation to end state before the next click advances', async () => {
    await setOptionData(page, 'textSpeed', 20);

    const enterTransform =
      '{"position":{"x":-160,"y":30},"scale":{"x":0.85,"y":0.85},"alpha":0.6,"rotation":0.08,"blur":2,"brightness":1.1,"contrast":1.05,"saturation":1.2}';
    const movedTransform =
      '{"position":{"x":280,"y":-40},"scale":{"x":1.2,"y":1.2},"alpha":0.75,"rotation":0.18,"blur":6,"brightness":1.35,"contrast":1.2,"saturation":1.4,"bloom":0.7,"bloomBrightness":1.3,"bloomBlur":8}';
    const resetTransform =
      '{"position":{"x":-60,"y":10},"scale":{"x":0.9,"y":0.9},"alpha":1,"rotation":0,"blur":0,"brightness":1,"contrast":1,"saturation":1}';

    await injectSceneAndRun(
      page,
      [
        'changeBg:bg.webp -next -duration=300 -transform={"position":{"x":40,"y":-20},"scale":{"x":1.1,"y":1.1},"alpha":0.8};',
        `changeFigure:stand.webp -left -id=hero -next -duration=400 -transform=${enterTransform};`,
        '演出一：复杂进入动画后，文字仍然应遵守先终止再推进;',
        `setTransform:${movedTransform} -target=hero -duration=900;`,
        '演出二：上一句动画的终态必须写入内部变换和 backlog;',
        `setTransform:${resetTransform} -target=hero -duration=300;`,
        '演出三：如果能看到这里，说明已经越过第二个终态;',
      ].join('\n'),
      'animation-transform-backlog',
    );

    await waitForShownText(page, '演出一');
    await flushBrowserTasks(page, 50);

    await clickStage(page);
    await waitForNoTransientPerforms(page);
    const firstDialogueId = await getCurrentSentenceId(page);

    await clickStage(page);
    await waitForActiveAnimationOnTarget(page, 'hero');
    const idWhileTransforming = await getCurrentSentenceId(page);
    expect(idWhileTransforming).toBeGreaterThan(firstDialogueId);
    expect(await getLockedTargets(page)).toContain('hero');

    const effectWhileTransforming = transformOf(await getStageEffect(page, 'hero'));
    expect(effectWhileTransforming.position.x).toBe(280);
    expect(effectWhileTransforming.position.y).toBe(-40);
    expect(effectWhileTransforming.blur).toBe(6);
    expect(effectWhileTransforming.bloom).toBe(0.7);

    await clickStage(page);
    await waitForNoActiveAnimationOnTarget(page, 'hero');
    await waitForNoTransientPerforms(page);
    const idAfterSettleClick = await getCurrentSentenceId(page);
    expect(idAfterSettleClick).toBe(idWhileTransforming);

    const heroAfterSettle = await getStageObjectByKey(page, 'hero');
    expect(heroAfterSettle?.transform?.x).toBeCloseTo(280, 0);
    expect(heroAfterSettle?.transform?.y).toBeCloseTo(-40, 0);
    expect(heroAfterSettle?.transform?.alpha).toBeCloseTo(0.75, 2);

    await clickStage(page);
    await waitForSentenceAdvance(page, idAfterSettleClick);
    await waitForShownText(page, '演出二');
    await flushBrowserTasks(page, 100);

    const backlogAfterSecondDialogue = await getBacklog(page);
    const secondDialogueBacklogIndex = backlogAfterSecondDialogue.length - 1;
    expect(secondDialogueBacklogIndex).toBeGreaterThanOrEqual(0);

    await clickStage(page);
    await waitForNoTransientPerforms(page);
    const idBeforeResetTransform = await getCurrentSentenceId(page);

    await clickStage(page);
    await waitForActiveAnimationOnTarget(page, 'hero');
    await clickStage(page);
    await waitForNoActiveAnimationOnTarget(page, 'hero');
    const resetEffect = transformOf(await getStageEffect(page, 'hero'));
    expect(resetEffect.position.x).toBe(-60);

    await callJumpFromBacklog(page, secondDialogueBacklogIndex, false);
    await flushBrowserTasks(page, 200);
    await waitForShownText(page, '演出二');

    const restoredEffect = transformOf(await getStageEffect(page, 'hero'));
    expect(restoredEffect.position.x).toBe(280);
    expect(restoredEffect.position.y).toBe(-40);
    expect(restoredEffect.blur).toBe(6);
    expect(await getCurrentSentenceId(page)).toBeGreaterThanOrEqual(idBeforeResetTransform);
  });
});
