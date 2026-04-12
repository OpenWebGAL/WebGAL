/**
 * WebGAL 测试工具 - 浏览器桥接层
 *
 * 在 playwright Page 上下文中执行 window.webgalTest 调用
 */
import type { Page } from 'playwright';

// ═══════════════════════════════════════════════
// 基础等待
// ═══════════════════════════════════════════════

/**
 * 等待 WebGAL 测试 API 可用
 */
export async function waitForTestAPI(page: Page, timeout = 30_000): Promise<void> {
  await page.waitForFunction(() => window.webgalTest != null, { timeout });
}

/**
 * 等待指定毫秒
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 等待句子 ID 变化
 */
export async function waitForSentenceAdvance(
  page: Page,
  currentId: number,
  timeout = 10_000,
  pollInterval = 100,
): Promise<number> {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    const newId = await getCurrentSentenceId(page);
    if (newId !== currentId) return newId;
    await delay(pollInterval);
  }
  throw new Error(`Sentence did not advance from ${currentId} within ${timeout}ms`);
}

// ═══════════════════════════════════════════════
// 游戏流程控制
// ═══════════════════════════════════════════════

export async function callNextSentence(page: Page): Promise<void> {
  await page.evaluate(() => window.webgalTest!.controllers.nextSentence());
}

export async function callStartGame(page: Page): Promise<void> {
  await page.evaluate(() => window.webgalTest!.controllers.startGame());
}

export async function callContinueGame(page: Page): Promise<void> {
  await page.evaluate(() => window.webgalTest!.controllers.continueGame());
}

export async function callScriptExecutor(page: Page): Promise<void> {
  await page.evaluate(() => window.webgalTest!.controllers.scriptExecutor());
}

// ═══════════════════════════════════════════════
// 自动/快进模式
// ═══════════════════════════════════════════════

export async function callSwitchAuto(page: Page): Promise<void> {
  await page.evaluate(() => window.webgalTest!.controllers.switchAuto());
}

export async function callStopAuto(page: Page): Promise<void> {
  await page.evaluate(() => window.webgalTest!.controllers.stopAuto());
}

export async function callSwitchFast(page: Page): Promise<void> {
  await page.evaluate(() => window.webgalTest!.controllers.switchFast());
}

export async function callStopFast(page: Page): Promise<void> {
  await page.evaluate(() => window.webgalTest!.controllers.stopFast());
}

export async function callStopAll(page: Page): Promise<void> {
  await page.evaluate(() => window.webgalTest!.controllers.stopAll());
}

// ═══════════════════════════════════════════════
// 存档/读档
// ═══════════════════════════════════════════════

export async function callSaveGame(page: Page, index: number): Promise<void> {
  await page.evaluate((i) => window.webgalTest!.controllers.saveGame(i), index);
}

export async function callLoadGame(page: Page, index: number): Promise<void> {
  await page.evaluate((i) => window.webgalTest!.controllers.loadGame(i), index);
}

export async function callJumpFromBacklog(page: Page, index: number): Promise<void> {
  await page.evaluate((i) => window.webgalTest!.controllers.jumpFromBacklog(i), index);
}

export async function callGenerateCurrentStageData(page: Page, index: number): Promise<unknown> {
  return page.evaluate((i) => {
    const data = window.webgalTest!.controllers.generateCurrentStageData(i);
    return JSON.parse(JSON.stringify(data));
  }, index);
}

// ═══════════════════════════════════════════════
// 舞台控制
// ═══════════════════════════════════════════════

export async function callResetStage(page: Page, resetBacklog = true, resetSceneAndVar = true): Promise<void> {
  await page.evaluate(
    ([rb, rs]) => window.webgalTest!.controllers.resetStage(rb, rs),
    [resetBacklog, resetSceneAndVar] as const,
  );
}

export async function callPlayBgm(page: Page, url: string, enter = 0, volume = 100): Promise<void> {
  await page.evaluate(([u, e, v]) => window.webgalTest!.controllers.playBgm(u, e, v), [url, enter, volume] as const);
}

// ═══════════════════════════════════════════════
// 场景管理
// ═══════════════════════════════════════════════

export async function callChangeScene(page: Page, sceneUrl: string, sceneName: string): Promise<void> {
  await page.evaluate(([url, name]) => window.webgalTest!.controllers.changeScene(url, name), [sceneUrl, sceneName]);
}

export async function callCallScene(page: Page, sceneUrl: string, sceneName: string): Promise<void> {
  await page.evaluate(([url, name]) => window.webgalTest!.controllers.callScene(url, name), [sceneUrl, sceneName]);
}

// ═══════════════════════════════════════════════
// 场景注入（测试专用）
// ═══════════════════════════════════════════════

/**
 * 注入原始脚本文本为测试场景（仅设置，不执行）
 */
export async function injectScene(page: Page, rawSceneText: string, sceneName = '__test__'): Promise<void> {
  await page.evaluate(
    ([text, name]) => window.webgalTest!.sceneTools.injectScene(text, name),
    [rawSceneText, sceneName],
  );
}

/**
 * 注入原始脚本文本为测试场景并开始执行
 */
export async function injectSceneAndRun(page: Page, rawSceneText: string, sceneName = '__test__'): Promise<void> {
  await page.evaluate(
    ([text, name]) => window.webgalTest!.sceneTools.injectSceneAndRun(text, name),
    [rawSceneText, sceneName],
  );
}

// ═══════════════════════════════════════════════
// 状态快照
// ═══════════════════════════════════════════════

export async function takeSnapshot(page: Page): Promise<GameStateSnapshot> {
  return page.evaluate(() => {
    const snap = window.webgalTest!.takeSnapshot();
    return JSON.parse(JSON.stringify(snap));
  });
}

// ═══════════════════════════════════════════════
// 场景状态读取
// ═══════════════════════════════════════════════

export async function getCurrentSentenceId(page: Page): Promise<number> {
  return page.evaluate(() => window.webgalTest!.sceneManager.sceneData.currentSentenceId);
}

export async function getCurrentSceneName(page: Page): Promise<string> {
  return page.evaluate(() => window.webgalTest!.sceneManager.sceneData.currentScene.sceneName);
}

export async function getSceneStack(page: Page): Promise<unknown[]> {
  return page.evaluate(() => JSON.parse(JSON.stringify(window.webgalTest!.sceneManager.sceneData.sceneStack)));
}

export async function getSentenceCount(page: Page): Promise<number> {
  return page.evaluate(() => window.webgalTest!.sceneManager.sceneData.currentScene.sentenceList.length);
}

// ═══════════════════════════════════════════════
// Backlog 读取
// ═══════════════════════════════════════════════

export async function getBacklogLength(page: Page): Promise<number> {
  return page.evaluate(() => window.webgalTest!.backlogManager.getBacklog().length);
}

export async function getBacklog(page: Page): Promise<unknown[]> {
  return page.evaluate(() => JSON.parse(JSON.stringify(window.webgalTest!.backlogManager.getBacklog())));
}

// ═══════════════════════════════════════════════
// 游戏状态读取
// ═══════════════════════════════════════════════

export async function getIsAuto(page: Page): Promise<boolean> {
  return page.evaluate(() => window.webgalTest!.gameplay.isAuto);
}

export async function getIsFast(page: Page): Promise<boolean> {
  return page.evaluate(() => window.webgalTest!.gameplay.isFast);
}

// ═══════════════════════════════════════════════
// Redux 状态读取
// ═══════════════════════════════════════════════

export async function getStageState(page: Page): Promise<Record<string, unknown>> {
  return page.evaluate(() => JSON.parse(JSON.stringify(window.webgalTest!.store.getState().stage)));
}

export async function getGuiState(page: Page): Promise<Record<string, unknown>> {
  return page.evaluate(() => JSON.parse(JSON.stringify(window.webgalTest!.store.getState().GUI)));
}

// ═══════════════════════════════════════════════
// 演出管理器读取
// ═══════════════════════════════════════════════

export async function getPerformList(page: Page): Promise<PerformSnapshot[]> {
  return page.evaluate(() =>
    window.webgalTest!.performController.performList.map((p) => ({
      performName: p.performName,
      duration: p.duration,
      isHoldOn: p.isHoldOn,
      blockingNext: p.blockingNext(),
      blockingAuto: p.blockingAuto(),
      goNextWhenOver: p.goNextWhenOver ?? false,
    })),
  );
}

export async function removeAllPerforms(page: Page): Promise<void> {
  await page.evaluate(() => window.webgalTest!.performController.removeAllPerform());
}

// ═══════════════════════════════════════════════
// Pixi 舞台读取
// ═══════════════════════════════════════════════

export async function getFigureObjects(page: Page): Promise<FigureObjectSnapshot[]> {
  return page.evaluate(() => {
    const ps = window.webgalTest!.pixiStage;
    if (!ps) return [];
    return ps.figureObjects.map((obj) => ({
      uuid: obj.uuid,
      key: obj.key,
      sourceUrl: obj.sourceUrl,
      sourceExt: obj.sourceExt,
      sourceType: obj.sourceType,
      isExiting: obj.isExiting ?? false,
      transform: obj.pixiContainer
        ? {
            x: obj.pixiContainer.x,
            y: obj.pixiContainer.y,
            scaleX: obj.pixiContainer.scale.x,
            scaleY: obj.pixiContainer.scale.y,
            rotation: obj.pixiContainer.rotation,
            alpha: obj.pixiContainer.alpha,
            visible: obj.pixiContainer.visible,
            zIndex: obj.pixiContainer.zIndex,
          }
        : null,
    }));
  });
}

export async function getBackgroundObjects(page: Page): Promise<BackgroundObjectSnapshot[]> {
  return page.evaluate(() => {
    const ps = window.webgalTest!.pixiStage;
    if (!ps) return [];
    return ps.backgroundObjects.map((obj) => ({
      uuid: obj.uuid,
      key: obj.key,
      sourceUrl: obj.sourceUrl,
      sourceType: obj.sourceType,
      isExiting: obj.isExiting ?? false,
    }));
  });
}

// ═══════════════════════════════════════════════
// 配置读取
// ═══════════════════════════════════════════════

export async function getSystemConfig(page: Page): Promise<{ backlog_size: number; fast_timeout: number }> {
  return page.evaluate(() => JSON.parse(JSON.stringify(window.webgalTest!.config.SYSTEM_CONFIG)));
}

// ═══════════════════════════════════════════════
// Redux dispatch
// ═══════════════════════════════════════════════

export async function dispatchSetStage(page: Page, key: string, value: unknown): Promise<void> {
  await page.evaluate(({ k, v }) => window.webgalTest!.dispatch.setStage(k, v), { k: key, v: value });
}

export async function dispatchSetVisibility(page: Page, component: string, visibility: boolean): Promise<void> {
  await page.evaluate(({ c, v }) => window.webgalTest!.dispatch.setVisibility(c, v), { c: component, v: visibility });
}

// ═══════════════════════════════════════════════
// 类型定义
// ═══════════════════════════════════════════════

export interface PerformSnapshot {
  performName: string;
  duration: number;
  isHoldOn: boolean;
  blockingNext: boolean;
  blockingAuto: boolean;
  goNextWhenOver: boolean;
}

export interface FigureObjectSnapshot {
  uuid: string;
  key: string;
  sourceUrl: string;
  sourceExt: string;
  sourceType: string;
  isExiting: boolean;
  transform: {
    x: number;
    y: number;
    scaleX: number;
    scaleY: number;
    rotation: number;
    alpha: number;
    visible: boolean;
    zIndex: number;
  } | null;
}

export interface BackgroundObjectSnapshot {
  uuid: string;
  key: string;
  sourceUrl: string;
  sourceType: string;
  isExiting: boolean;
}

export interface GameStateSnapshot {
  stageState: Record<string, unknown>;
  guiState: Record<string, unknown>;
  userData: Record<string, unknown>;
  sceneState: {
    currentSentenceId: number;
    sceneName: string;
    sceneUrl: string;
    sentenceCount: number;
    sceneStackLength: number;
    sceneStack: Array<{ sceneName: string; sceneUrl: string; continueLine: number }>;
  };
  backlog: unknown[];
  backlogLength: number;
  performs: PerformSnapshot[];
  performListLength: number;
  pixiState: {
    figureObjects: FigureObjectSnapshot[];
    backgroundObjects: BackgroundObjectSnapshot[];
    stageWidth: number;
    stageHeight: number;
  } | null;
  gameplayState: {
    isAuto: boolean;
    isFast: boolean;
  };
  animations: Array<{ name: string; frameCount: number }>;
  timestamp: number;
}

/**
 * 不稳定字段，在快照比较时需要排除
 */
const UNSTABLE_STAGE_FIELDS = [
  'PerformList',
  'currentDialogKey',
  'playVocal',
  'currentPerformRuntime',
  'live2dMotion',
  'live2dExpression',
];

/**
 * 生成包含 N 条 say 语句的测试脚本
 */
export function generateTestScene(count: number, prefix = '测试语句'): string {
  return Array.from({ length: count }, (_, i) => `${prefix}${i + 1};`).join('\n');
}

/**
 * 比较两个快照的核心状态是否一致（排除不稳定字段）
 */
export function compareSnapshots(
  a: GameStateSnapshot,
  b: GameStateSnapshot,
): { match: boolean; diffs: string[] } {
  const diffs: string[] = [];

  // 比较 scene state
  if (a.sceneState.currentSentenceId !== b.sceneState.currentSentenceId) {
    diffs.push(`sceneState.currentSentenceId: ${a.sceneState.currentSentenceId} vs ${b.sceneState.currentSentenceId}`);
  }
  if (a.sceneState.sceneName !== b.sceneState.sceneName) {
    diffs.push(`sceneState.sceneName: ${a.sceneState.sceneName} vs ${b.sceneState.sceneName}`);
  }
  if (a.sceneState.sceneUrl !== b.sceneState.sceneUrl) {
    diffs.push(`sceneState.sceneUrl: ${a.sceneState.sceneUrl} vs ${b.sceneState.sceneUrl}`);
  }
  if (a.sceneState.sceneStackLength !== b.sceneState.sceneStackLength) {
    diffs.push(`sceneState.sceneStackLength: ${a.sceneState.sceneStackLength} vs ${b.sceneState.sceneStackLength}`);
  }

  // 比较 backlog 长度
  if (a.backlogLength !== b.backlogLength) {
    diffs.push(`backlogLength: ${a.backlogLength} vs ${b.backlogLength}`);
  }

  // 比较 stage state（排除不稳定字段）
  const stageA = { ...a.stageState };
  const stageB = { ...b.stageState };
  for (const field of UNSTABLE_STAGE_FIELDS) {
    delete stageA[field];
    delete stageB[field];
  }
  const stageJsonA = JSON.stringify(stageA, Object.keys(stageA).sort());
  const stageJsonB = JSON.stringify(stageB, Object.keys(stageB).sort());
  if (stageJsonA !== stageJsonB) {
    diffs.push(`stageState differs (after excluding unstable fields)`);
  }

  return { match: diffs.length === 0, diffs };
}
