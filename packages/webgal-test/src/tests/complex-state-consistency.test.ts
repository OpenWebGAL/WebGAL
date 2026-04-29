/**
 * 复杂演出状态收敛测试
 *
 * 同一段多立绘、多动画、多变换的演出，到达同一个 checkpoint 后，
 * 手动点击、快进、自动播放、编辑器快速同步、stageData 读入、存读档和回溯都应恢复一致的稳定舞台/Pixi 状态。
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { Page } from 'playwright';
import {
  callGenerateCurrentStageData,
  callJumpFromBacklog,
  callLoadGame,
  callLoadGameFromStageData,
  callSaveGame,
  callStopAll,
  callStopAuto,
  callStopFast,
  callSwitchAuto,
  callSwitchFast,
  callSyncWithOrigine,
  clickStage,
  closeBrowser,
  compareStableRuntimeSnapshots,
  createTestPage,
  flushBrowserTasks,
  getActiveAnimations,
  getBacklog,
  getCurrentSentenceId,
  getPerformList,
  getStageEffect,
  getStageObjectByKey,
  getTextState,
  injectSceneAndRun,
  resetRuntime,
  routeScene,
  setOptionData,
  settleAnimations,
  settleText,
  takeSnapshot,
  toStableRuntimeSnapshot,
  waitForNoActiveAnimations,
  waitForNoTransientPerforms,
  waitForTextSettled,
  type StableRuntimeSnapshot,
} from '../utils';

const SCENE_NAME = 'complex-state-consistency.txt';
const SCENE_URL = `./game/scene/${SCENE_NAME}`;
const CHECKPOINT_TEXT = '复杂状态检查点：所有路径应该收敛到同一舞台';
const AFTER_CHECKPOINT_TEXT = '检查点之后：用于证明读档和回溯确实回退';

const bgEnter =
  '{"position":{"x":60,"y":-28},"scale":{"x":1.12,"y":1.12},"alpha":0.82,"rotation":0.03,"blur":2,"brightness":1.08,"contrast":1.06,"saturation":1.18}';
const heroEnter =
  '{"position":{"x":-320,"y":30},"scale":{"x":0.82,"y":0.82},"alpha":0.7,"rotation":-0.08,"blur":1,"brightness":1.12,"contrast":1.08,"saturation":1.16}';
const rivalEnter =
  '{"position":{"x":320,"y":10},"scale":{"x":0.88,"y":0.88},"alpha":0.72,"rotation":0.08,"blur":2,"brightness":0.96,"contrast":1.16,"saturation":0.9}';
const allyEnter =
  '{"position":{"x":0,"y":120},"scale":{"x":0.78,"y":0.78},"alpha":0.65,"rotation":0,"blur":0,"brightness":1.18,"contrast":1.04,"saturation":1.1}';
const heroTemp =
  '[{"position":{"x":-320,"y":30},"scale":{"x":0.82,"y":0.82},"alpha":0.7,"rotation":-0.08,"duration":0},{"position":{"x":-80,"y":-30},"scale":{"x":1.08,"y":1.08},"alpha":1,"rotation":0.12,"blur":4,"duration":280},{"position":{"x":140,"y":-20},"scale":{"x":1.02,"y":1.02},"alpha":0.9,"rotation":-0.04,"blur":1,"duration":360}]';
const rivalMid =
  '{"position":{"x":-180,"y":24},"scale":{"x":1.04,"y":1.04},"alpha":0.86,"rotation":-0.18,"blur":5,"brightness":0.9,"contrast":1.24,"saturation":0.78,"bloom":0.45,"bloomBrightness":1.18,"bloomBlur":5}';
const allyMid =
  '{"position":{"x":60,"y":52},"scale":{"x":1.16,"y":1.16},"alpha":0.92,"rotation":0.06,"blur":3,"brightness":1.24,"contrast":1.1,"saturation":1.26}';
const bgMid =
  '{"position":{"x":-70,"y":36},"scale":{"x":1.2,"y":1.2},"alpha":0.88,"rotation":-0.02,"blur":4,"brightness":0.94,"contrast":1.22,"saturation":0.82,"oldFilm":0.2}';
const heroFinal =
  '{"position":{"x":220,"y":-60},"scale":{"x":1.1,"y":1.1},"alpha":0.95,"rotation":0.1,"blur":0,"brightness":1.18,"contrast":1.12,"saturation":1.24,"bloom":0.35,"bloomBrightness":1.14,"bloomBlur":4}';
const rivalFinal =
  '{"position":{"x":-260,"y":20},"scale":{"x":0.92,"y":0.92},"alpha":0.8,"rotation":-0.12,"blur":4,"brightness":0.88,"contrast":1.2,"saturation":0.75,"rgbFilm":0.18}';
const allyFinal =
  '{"position":{"x":0,"y":80},"scale":{"x":1.05,"y":1.05},"alpha":1,"rotation":0,"blur":0,"brightness":1.05,"contrast":1,"saturation":1.08}';
const bgFinal =
  '{"position":{"x":10,"y":-20},"scale":{"x":1.08,"y":1.08},"alpha":0.9,"rotation":0,"blur":1,"brightness":1.02,"contrast":1.04,"saturation":1.15}';
const postCheckpoint =
  '{"position":{"x":-360,"y":120},"scale":{"x":0.7,"y":0.7},"alpha":0.45,"rotation":-0.3,"blur":8,"brightness":0.7,"contrast":1.4,"saturation":0.5}';

const COMPLEX_SCENE_LINES = [
  'setVar:route=complex;',
  'setVar:checkpoint=0;',
  `changeBg:bg.webp -next -duration=520 -transform=${bgEnter};`,
  `changeFigure:stand.webp -left -id=hero -next -duration=480 -transform=${heroEnter} -zIndex=11;`,
  `changeFigure:stand2.webp -right -id=rival -next -duration=560 -transform=${rivalEnter} -zIndex=9;`,
  `changeFigure:stand.webp -center -id=ally -next -duration=440 -transform=${allyEnter} -zIndex=10;`,
  'miniAvatar:miniavatar.webp;',
  'filmMode:cinema;',
  'setTextbox:show -next;',
  '复杂演出开始：第一段对话用于生成 backlog;',
  `setTempAnimation:${heroTemp} -target=hero -next;`,
  `setTransform:${rivalMid} -target=rival -duration=620 -next;`,
  `setTransform:${allyMid} -target=ally -duration=580 -next;`,
  `setTransform:${bgMid} -target=bg-main -duration=540 -next;`,
  '复杂演出中段：多个目标动画正在交叠;',
  'setVar:checkpoint=1;',
  `setTransform:${heroFinal} -target=hero -duration=760 -next;`,
  `setTransform:${rivalFinal} -target=rival -duration=700 -next;`,
  `setTransform:${allyFinal} -target=ally -duration=680 -next;`,
  `setTransform:${bgFinal} -target=bg-main -duration=620 -next;`,
  `${CHECKPOINT_TEXT};`,
  `setTransform:${postCheckpoint} -target=hero -duration=300 -next;`,
  `${AFTER_CHECKPOINT_TEXT};`,
];

const COMPLEX_SCENE = COMPLEX_SCENE_LINES.join('\n');
const CHECKPOINT_SENTENCE_ID = COMPLEX_SCENE_LINES.findIndex((line) => line.includes(CHECKPOINT_TEXT)) + 1;

async function waitForShownText(page: Page, text: string, timeout = 20_000): Promise<void> {
  await page.waitForFunction(
    (expectedText) => window.webgalTest!.store.getState().stage.showText.includes(expectedText),
    text,
    { timeout, polling: 10 },
  );
}

async function waitForShownTextAndStopMode(
  page: Page,
  text: string,
  mode: 'auto' | 'fast',
  timeout = 20_000,
): Promise<void> {
  await page.waitForFunction(
    ([expectedText, stopMode]) => {
      const isShown = window.webgalTest!.store.getState().stage.showText.includes(expectedText);
      if (isShown) {
        if (stopMode === 'auto') window.webgalTest!.controllers.stopAuto();
        else window.webgalTest!.controllers.stopFast();
      }
      return isShown;
    },
    [text, mode] as const,
    { timeout, polling: 10 },
  );
}

async function isShownText(page: Page, text: string): Promise<boolean> {
  return page.evaluate((expectedText) => window.webgalTest!.store.getState().stage.showText.includes(expectedText), text);
}

async function settleCurrentPresentation(page: Page): Promise<void> {
  const [textState, performs, animations] = await Promise.all([
    getTextState(page),
    getPerformList(page),
    getActiveAnimations(page),
  ]);
  const hasTransientPerform = performs.some((perform) => !perform.isHoldOn && !perform.skipNextCollect);

  if (hasTransientPerform) {
    await clickStage(page);
  } else {
    if (textState.pendingElements > 0) {
      await settleText(page);
    }
    if (animations.length > 0) {
      await settleAnimations(page);
    }
  }

  await flushBrowserTasks(page, 150);
  await waitForNoTransientPerforms(page);
  await waitForNoActiveAnimations(page);
  await waitForTextSettled(page);
}

async function prepareComplexScene(page: Page): Promise<void> {
  await callStopAll(page).catch(() => {});
  await resetRuntime(page);
  await setOptionData(page, 'textSpeed', 25);
  await setOptionData(page, 'autoSpeed', 0);
  await injectSceneAndRun(page, COMPLEX_SCENE, SCENE_NAME, SCENE_URL);
  await flushBrowserTasks(page, 50);
}

async function driveManualToCheckpoint(page: Page): Promise<StableRuntimeSnapshot> {
  await prepareComplexScene(page);

  for (let i = 0; i < 120; i++) {
    if (await isShownText(page, CHECKPOINT_TEXT)) break;
    await clickStage(page);
    await flushBrowserTasks(page, 80);
  }

  await waitForShownText(page, CHECKPOINT_TEXT);
  return captureStableCheckpoint(page);
}

async function driveFastToCheckpoint(page: Page): Promise<StableRuntimeSnapshot> {
  await prepareComplexScene(page);
  await callSwitchFast(page);
  await waitForShownTextAndStopMode(page, CHECKPOINT_TEXT, 'fast');
  return captureStableCheckpoint(page);
}

async function driveAutoToCheckpoint(page: Page): Promise<StableRuntimeSnapshot> {
  await prepareComplexScene(page);
  await callSwitchAuto(page);
  await waitForShownTextAndStopMode(page, CHECKPOINT_TEXT, 'auto', 45_000);
  return captureStableCheckpoint(page);
}

async function driveEditorSyncToCheckpoint(page: Page): Promise<StableRuntimeSnapshot> {
  await callStopAll(page).catch(() => {});
  await resetRuntime(page);
  await setOptionData(page, 'textSpeed', 25);
  await callSyncWithOrigine(page, SCENE_NAME, CHECKPOINT_SENTENCE_ID, false);
  await waitForShownText(page, CHECKPOINT_TEXT);
  return captureStableCheckpoint(page);
}

async function captureStableCheckpoint(page: Page): Promise<StableRuntimeSnapshot> {
  await settleCurrentPresentation(page);
  expect(await getCurrentSentenceId(page)).toBe(CHECKPOINT_SENTENCE_ID);

  const snapshot = await takeSnapshot(page);
  const stable = toStableRuntimeSnapshot(snapshot);

  expect(stable.text.shownText).toContain(CHECKPOINT_TEXT);
  expect(stable.text.pendingElements).toBe(0);
  expect(stable.pixi?.activeAnimations).toEqual([]);
  expect(stable.pixi?.lockedTargets).toEqual([]);
  expect(stable.performs).toEqual([]);

  await expectTargetTransform(page, 'hero', 220, -60, 0.95);
  await expectTargetTransform(page, 'rival', -260, 20, 0.8);
  await expectTargetTransform(page, 'ally', 0, 80, 1);
  await expectTargetTransform(page, 'bg-main', 10, -20, 0.9);

  return stable;
}

async function expectTargetTransform(
  page: Page,
  target: string,
  expectedX: number,
  expectedY: number,
  expectedAlpha: number,
): Promise<void> {
  await page.waitForFunction((targetKey) => window.webgalTest!.testTools.getStageObjectByKey(targetKey) != null, target, {
    timeout: 10_000,
  });

  const effect = await getStageEffect(page, target);
  const transform = effect?.transform as { position?: { x: number; y: number }; alpha?: number } | undefined;
  expect(transform?.position?.x).toBe(expectedX);
  expect(transform?.position?.y).toBe(expectedY);
  expect(transform?.alpha).toBeCloseTo(expectedAlpha, 2);

  const object = await getStageObjectByKey(page, target);
  expect(object?.transform?.x).toBeCloseTo(expectedX, 0);
  expect(object?.transform?.y).toBeCloseTo(expectedY, 0);
  expect(object?.transform?.alpha).toBeCloseTo(expectedAlpha, 2);
}

async function advancePastCheckpoint(page: Page): Promise<void> {
  for (let i = 0; i < 20; i++) {
    if (await isShownText(page, AFTER_CHECKPOINT_TEXT)) break;
    await clickStage(page);
    await flushBrowserTasks(page, 80);
  }
  await waitForShownText(page, AFTER_CHECKPOINT_TEXT);
  await settleCurrentPresentation(page);
}

function expectStableMatch(expected: StableRuntimeSnapshot, actual: StableRuntimeSnapshot): void {
  const result = compareStableRuntimeSnapshots(expected, actual);
  expect(result.diffs).toEqual([]);
  expect(result.match).toBe(true);
}

describe('Complex State Consistency', () => {
  let page: Page;

  beforeAll(async () => {
    page = await createTestPage();
    await routeScene(page, SCENE_NAME, COMPLEX_SCENE);
  });

  afterAll(async () => {
    if (page) {
      await callStopAll(page).catch(() => {});
      await page.context().close();
    }
    await closeBrowser();
  });

  it('should converge to the same checkpoint through manual, fast, auto, editor sync, and stageData load', async () => {
    const manual = await driveManualToCheckpoint(page);

    const fast = await driveFastToCheckpoint(page);
    expectStableMatch(manual, fast);

    const auto = await driveAutoToCheckpoint(page);
    expectStableMatch(manual, auto);

    const editorSync = await driveEditorSyncToCheckpoint(page);
    expectStableMatch(manual, editorSync);

    await driveManualToCheckpoint(page);
    const stageData = await callGenerateCurrentStageData(page, 88, false);
    await resetRuntime(page);
    await callLoadGameFromStageData(page, stageData);
    await waitForShownText(page, CHECKPOINT_TEXT);
    const loadedFromStageData = await captureStableCheckpoint(page);
    expectStableMatch(manual, loadedFromStageData);
  });

  it('should restore the same checkpoint after save/load and backlog jump from a later complex state', async () => {
    const checkpoint = await driveManualToCheckpoint(page);
    const checkpointBacklogIndex = (await getBacklog(page)).length - 1;

    await callSaveGame(page, 89);
    await flushBrowserTasks(page, 300);

    await advancePastCheckpoint(page);
    expect(await isShownText(page, AFTER_CHECKPOINT_TEXT)).toBe(true);

    await callLoadGame(page, 89);
    await waitForShownText(page, CHECKPOINT_TEXT);
    const loaded = await captureStableCheckpoint(page);
    expectStableMatch(checkpoint, loaded);

    await advancePastCheckpoint(page);
    await callJumpFromBacklog(page, checkpointBacklogIndex, false);
    await waitForShownText(page, CHECKPOINT_TEXT);
    const restoredFromBacklog = await captureStableCheckpoint(page);
    expectStableMatch(checkpoint, restoredFromBacklog);
  });
});
