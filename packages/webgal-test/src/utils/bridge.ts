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

async function waitForPredicate<T>(
  read: () => Promise<T>,
  predicate: (value: T) => boolean,
  description: string,
  timeout = 10_000,
  pollInterval = 50,
): Promise<T> {
  const deadline = Date.now() + timeout;
  let lastValue: T | undefined;
  while (Date.now() < deadline) {
    lastValue = await read();
    if (predicate(lastValue)) return lastValue;
    await delay(pollInterval);
  }
  throw new Error(`${description} within ${timeout}ms. Last value: ${JSON.stringify(lastValue)}`);
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

export async function clickStage(page: Page): Promise<void> {
  await page.dispatchEvent('#FullScreenClick', 'click');
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

export async function callJumpFromBacklog(page: Page, index: number, refetchScene = true): Promise<void> {
  await page.evaluate(([i, refetch]) => window.webgalTest!.controllers.jumpFromBacklog(i, refetch), [
    index,
    refetchScene,
  ] as const);
}

export async function callGenerateCurrentStageData(page: Page, index: number, savePreviewImage = false): Promise<unknown> {
  return page.evaluate(([i, preview]) => {
    const data = window.webgalTest!.controllers.generateCurrentStageData(i, preview);
    return JSON.parse(JSON.stringify(data));
  }, [index, savePreviewImage] as const);
}

export async function callLoadGameFromStageData(page: Page, stageData: unknown): Promise<void> {
  await page.evaluate((data) => window.webgalTest!.controllers.loadGameFromStageData(data), stageData);
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

export async function callSyncWithOrigine(
  page: Page,
  sceneName: string,
  sentenceId: number,
  experimental = false,
): Promise<void> {
  await page.evaluate(
    ([name, id, exp]) => window.webgalTest!.controllers.syncWithOrigine(name, id, exp),
    [sceneName, sentenceId, experimental] as const,
  );
}

// ═══════════════════════════════════════════════
// 场景注入（测试专用）
// ═══════════════════════════════════════════════

export async function routeScene(page: Page, sceneName: string, rawSceneText: string): Promise<void> {
  await page.route(`**/game/scene/${sceneName}`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'text/plain; charset=utf-8',
      body: rawSceneText,
    });
  });
}

/**
 * 注入原始脚本文本为测试场景（仅设置，不执行）
 */
export async function injectScene(
  page: Page,
  rawSceneText: string,
  sceneName = '__test__',
  sceneUrl?: string,
): Promise<void> {
  await page.evaluate(
    ([text, name, url]) => window.webgalTest!.sceneTools.injectScene(text, name, url),
    [rawSceneText, sceneName, sceneUrl],
  );
}

/**
 * 注入原始脚本文本为测试场景并开始执行
 */
export async function injectSceneAndRun(
  page: Page,
  rawSceneText: string,
  sceneName = '__test__',
  sceneUrl?: string,
): Promise<void> {
  await page.evaluate(
    ([text, name, url]) => window.webgalTest!.sceneTools.injectSceneAndRun(text, name, url),
    [rawSceneText, sceneName, sceneUrl],
  );
}

export async function resetRuntime(page: Page): Promise<void> {
  await page.evaluate(() => window.webgalTest!.testTools.resetRuntime());
}

export async function settleText(page: Page): Promise<void> {
  await page.evaluate(() => window.webgalTest!.testTools.settleText());
}

export async function settleAnimations(page: Page): Promise<void> {
  await page.evaluate(() => window.webgalTest!.testTools.settleAnimations());
}

export async function flushBrowserTasks(page: Page, ms = 0): Promise<void> {
  await page.evaluate((delayMs) => window.webgalTest!.testTools.flushBrowserTasks(delayMs), ms);
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

export async function getTestMetadata(page: Page): Promise<TestMetadata> {
  return page.evaluate(() => JSON.parse(JSON.stringify(window.webgalTest!.metadata)));
}

export async function getTextState(page: Page): Promise<TextRuntimeSnapshot> {
  return page.evaluate(() => JSON.parse(JSON.stringify(window.webgalTest!.testTools.getTextState())));
}

export async function waitForTextPending(page: Page, timeout = 10_000): Promise<TextRuntimeSnapshot> {
  return waitForPredicate(
    () => getTextState(page),
    (state) => state.pendingElements > 0,
    'Text did not enter pending reveal state',
    timeout,
  );
}

export async function waitForTextSettled(page: Page, timeout = 10_000): Promise<TextRuntimeSnapshot> {
  return waitForPredicate(
    () => getTextState(page),
    (state) => state.pendingElements === 0 && state.totalElements > 0,
    'Text did not settle',
    timeout,
  );
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
      skipNextCollect: p.skipNextCollect ?? false,
    })),
  );
}

export async function waitForNoTransientPerforms(page: Page, timeout = 10_000): Promise<PerformSnapshot[]> {
  return waitForPredicate(
    () => getPerformList(page),
    (performs) => performs.every((perform) => perform.isHoldOn || perform.skipNextCollect),
    'Transient performs did not settle',
    timeout,
  );
}

export async function waitForTransientPerform(page: Page, timeout = 10_000): Promise<PerformSnapshot[]> {
  return waitForPredicate(
    () => getPerformList(page),
    (performs) => performs.some((perform) => !perform.isHoldOn && !perform.skipNextCollect),
    'Transient perform did not start',
    timeout,
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

export async function getActiveAnimations(page: Page): Promise<RuntimeAnimationSnapshot[]> {
  return page.evaluate(() => JSON.parse(JSON.stringify(window.webgalTest!.testTools.getActiveAnimations())));
}

export async function waitForActiveAnimationOnTarget(
  page: Page,
  targetKey: string,
  timeout = 10_000,
): Promise<RuntimeAnimationSnapshot[]> {
  return waitForPredicate(
    () => getActiveAnimations(page),
    (animations) => animations.some((animation) => animation.targetKey === targetKey),
    `Animation on ${targetKey} did not start`,
    timeout,
  );
}

export async function waitForNoActiveAnimationOnTarget(
  page: Page,
  targetKey: string,
  timeout = 10_000,
): Promise<RuntimeAnimationSnapshot[]> {
  return waitForPredicate(
    () => getActiveAnimations(page),
    (animations) => animations.every((animation) => animation.targetKey !== targetKey),
    `Animation on ${targetKey} did not stop`,
    timeout,
  );
}

export async function waitForNoActiveAnimations(page: Page, timeout = 10_000): Promise<RuntimeAnimationSnapshot[]> {
  return waitForPredicate(
    () => getActiveAnimations(page),
    (animations) => animations.length === 0,
    'Active animations did not stop',
    timeout,
  );
}

export async function getLockedTargets(page: Page): Promise<string[]> {
  return page.evaluate(() => JSON.parse(JSON.stringify(window.webgalTest!.testTools.getLockedTargets())));
}

export async function getStageObjectByKey(
  page: Page,
  key: string,
): Promise<FigureObjectSnapshot | BackgroundObjectSnapshot | null> {
  return page.evaluate((targetKey) => {
    const obj = window.webgalTest!.testTools.getStageObjectByKey(targetKey);
    return obj ? JSON.parse(JSON.stringify(obj)) : null;
  }, key);
}

export async function getStageEffect(page: Page, target: string): Promise<StageEffectSnapshot | null> {
  return page.evaluate((targetKey) => {
    const effect = window.webgalTest!.testTools.getEffectByTarget(targetKey);
    return effect ? JSON.parse(JSON.stringify(effect)) : null;
  }, target);
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

export async function setOptionData(page: Page, key: string, value: unknown): Promise<void> {
  await page.evaluate(([optionKey, optionValue]) => window.webgalTest!.testTools.setOptionData(optionKey, optionValue), [
    key,
    value,
  ] as const);
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
  skipNextCollect?: boolean;
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
  sourceExt: string;
  sourceType: string;
  isExiting: boolean;
  transform: FigureObjectSnapshot['transform'];
}

export interface RuntimeAnimationSnapshot {
  key: string;
  targetKey: string;
  type: 'common' | 'preset';
}

export interface TextRuntimeSnapshot {
  shownText: string;
  shownName: string;
  currentDialogKey: string;
  totalElements: number;
  pendingElements: number;
  settledElements: number;
  visibleText: string;
}

export interface TestMetadata {
  testMode: true;
  apiVersion: number;
  exposedAt: number;
  locationHref: string;
}

export interface StageEffectSnapshot {
  target: string;
  transform?: Record<string, unknown>;
}

export interface GameStateSnapshot {
  metadata: TestMetadata;
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
    allObjects: Array<FigureObjectSnapshot | BackgroundObjectSnapshot>;
    activeAnimations: RuntimeAnimationSnapshot[];
    lockedTargets: string[];
    stageWidth: number;
    stageHeight: number;
  } | null;
  textState: TextRuntimeSnapshot;
  gameplayState: {
    isAuto: boolean;
    isFast: boolean;
  };
  animations: Array<{ name: string; frameCount: number }>;
  timestamp: number;
}

export interface StableRuntimeSnapshot {
  scene: {
    currentSentenceId: number;
    sceneName: string;
    sceneUrl: string;
    sceneStackLength: number;
  };
  stage: {
    bgName: unknown;
    figName: unknown;
    figNameLeft: unknown;
    figNameRight: unknown;
    freeFigure: unknown;
    figureAssociatedAnimation: unknown;
    showText: unknown;
    showTextSize: unknown;
    showName: unknown;
    command: unknown;
    miniAvatar: unknown;
    bgm: unknown;
    GameVar: unknown;
    effects: unknown;
    bgTransform: unknown;
    bgFilter: unknown;
    enableFilm: unknown;
    isDisableTextbox: unknown;
    figureMetaData: unknown;
    animationSettings: unknown;
  };
  text: {
    shownText: string;
    shownName: string;
    pendingElements: number;
    totalElements: number;
  };
  pixi: {
    stageWidth: number;
    stageHeight: number;
    figureObjects: unknown;
    backgroundObjects: unknown;
    activeAnimations: RuntimeAnimationSnapshot[];
    lockedTargets: string[];
  } | null;
  performs: PerformSnapshot[];
  backlogLength: number;
  gameplayState: GameStateSnapshot['gameplayState'];
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

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(',')}]`;
  }
  if (value && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b));
    return `{${entries.map(([key, item]) => `${JSON.stringify(key)}:${stableStringify(item)}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

function roundNumber(value: number): number {
  return Math.round(value * 1000) / 1000;
}

function stableClone(value: unknown): unknown {
  if (typeof value === 'number') return roundNumber(value);
  if (Array.isArray(value)) return value.map((item) => stableClone(item));
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, item]) => [key, stableClone(item)]),
    );
  }
  return value;
}

function normalizeEffects(effects: unknown): unknown {
  if (!Array.isArray(effects)) return [];
  return effects
    .map((effect) => stableClone(effect))
    .sort((a, b) =>
      String((a as Record<string, unknown>).target ?? '').localeCompare(
        String((b as Record<string, unknown>).target ?? ''),
      ),
    );
}

function normalizeAnimationSettings(settings: unknown): unknown {
  if (!Array.isArray(settings)) return [];
  return settings
    .map((setting) => {
      const item = setting as Record<string, unknown>;
      return stableClone({
        target: item.target,
        enterDuration: item.enterDuration,
        exitDuration: item.exitDuration,
        hasEnterAnimation: Boolean(item.enterAnimationName),
        hasExitAnimation: Boolean(item.exitAnimationName),
      });
    })
    .sort((a, b) =>
      String((a as Record<string, unknown>).target ?? '').localeCompare(
        String((b as Record<string, unknown>).target ?? ''),
      ),
    );
}

function normalizeStageObjects(objects: unknown): unknown {
  if (!Array.isArray(objects)) return [];
  return objects
    .map((object) => {
      const item = object as FigureObjectSnapshot | BackgroundObjectSnapshot;
      return stableClone({
        key: item.key,
        sourceUrl: item.sourceUrl,
        sourceExt: item.sourceExt,
        sourceType: item.sourceType,
        isExiting: item.isExiting,
        transform: item.transform,
      });
    })
    .sort((a, b) => {
      const left = a as Record<string, unknown>;
      const right = b as Record<string, unknown>;
      return `${left.key}:${left.sourceUrl}:${left.isExiting}`.localeCompare(
        `${right.key}:${right.sourceUrl}:${right.isExiting}`,
      );
    });
}

export function toStableRuntimeSnapshot(snapshot: GameStateSnapshot): StableRuntimeSnapshot {
  const stage = snapshot.stageState;
  return {
    scene: {
      currentSentenceId: snapshot.sceneState.currentSentenceId,
      sceneName: snapshot.sceneState.sceneName,
      sceneUrl: snapshot.sceneState.sceneUrl,
      sceneStackLength: snapshot.sceneState.sceneStackLength,
    },
    stage: {
      bgName: stage.bgName,
      figName: stage.figName,
      figNameLeft: stage.figNameLeft,
      figNameRight: stage.figNameRight,
      freeFigure: stableClone(stage.freeFigure),
      figureAssociatedAnimation: stableClone(stage.figureAssociatedAnimation),
      showText: stage.showText,
      showTextSize: stage.showTextSize,
      showName: stage.showName,
      command: stage.command,
      miniAvatar: stage.miniAvatar,
      bgm: stableClone(stage.bgm),
      GameVar: stableClone(stage.GameVar),
      effects: normalizeEffects(stage.effects),
      bgTransform: stage.bgTransform,
      bgFilter: stage.bgFilter,
      enableFilm: stage.enableFilm,
      isDisableTextbox: stage.isDisableTextbox,
      figureMetaData: stableClone(stage.figureMetaData),
      animationSettings: normalizeAnimationSettings(stage.animationSettings),
    },
    text: {
      shownText: snapshot.textState.shownText,
      shownName: snapshot.textState.shownName,
      pendingElements: snapshot.textState.pendingElements,
      totalElements: snapshot.textState.totalElements,
    },
    pixi: snapshot.pixiState
      ? {
          stageWidth: snapshot.pixiState.stageWidth,
          stageHeight: snapshot.pixiState.stageHeight,
          figureObjects: normalizeStageObjects(snapshot.pixiState.figureObjects),
          backgroundObjects: normalizeStageObjects(snapshot.pixiState.backgroundObjects),
          activeAnimations: [...snapshot.pixiState.activeAnimations].sort((a, b) =>
            `${a.targetKey}:${a.type}`.localeCompare(`${b.targetKey}:${b.type}`),
          ),
          lockedTargets: [...snapshot.pixiState.lockedTargets].sort(),
        }
      : null,
    performs: snapshot.performs
      .filter((perform) => !perform.isHoldOn && !perform.skipNextCollect)
      .map((perform) => ({
        ...perform,
        duration: roundNumber(perform.duration),
      }))
      .sort((a, b) => a.performName.localeCompare(b.performName)),
    backlogLength: snapshot.backlogLength,
    gameplayState: snapshot.gameplayState,
  };
}

export function compareStableRuntimeSnapshots(
  a: GameStateSnapshot | StableRuntimeSnapshot,
  b: GameStateSnapshot | StableRuntimeSnapshot,
): { match: boolean; diffs: string[] } {
  const stableA = 'timestamp' in a ? toStableRuntimeSnapshot(a) : a;
  const stableB = 'timestamp' in b ? toStableRuntimeSnapshot(b) : b;
  const diffs: string[] = [];

  for (const key of Object.keys(stableA) as Array<keyof StableRuntimeSnapshot>) {
    const left = stableStringify(stableA[key]);
    const right = stableStringify(stableB[key]);
    if (left !== right) {
      diffs.push(`${String(key)} differs`);
    }
  }

  return { match: diffs.length === 0, diffs };
}

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
  const stageJsonA = stableStringify(stageA);
  const stageJsonB = stableStringify(stageB);
  if (stageJsonA !== stageJsonB) {
    diffs.push(`stageState differs (after excluding unstable fields)`);
  }

  return { match: diffs.length === 0, diffs };
}
