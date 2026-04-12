/**
 * 暴露 WebGAL 内核到 window，供外部测试框架（vitest）调用
 *
 * 设计原则：尽可能把所有内部模块暴露出来，让外部测试框架能完全访问，
 * 以实现测试复杂流程、动画和舞台的目的。
 */
import { WebGAL, Live2D } from '@/Core/WebGAL';
import { webgalStore } from '@/store/store';

// ─── 游戏控制器 ───
import { nextSentence } from '@/Core/controller/gamePlay/nextSentence';
import { switchAuto, stopAuto } from '@/Core/controller/gamePlay/autoPlay';
import { switchFast, stopFast, stopAll } from '@/Core/controller/gamePlay/fastSkip';
import { startGame, continueGame } from '@/Core/controller/gamePlay/startContinueGame';
import { scriptExecutor } from '@/Core/controller/gamePlay/scriptExecutor';

// ─── 存储控制器 ───
import { saveGame, generateCurrentStageData } from '@/Core/controller/storage/saveGame';
import { loadGame, loadGameFromStageData } from '@/Core/controller/storage/loadGame';
import { jumpFromBacklog } from '@/Core/controller/storage/jumpFromBacklog';

// ─── 舞台控制器 ───
import { resetStage } from '@/Core/controller/stage/resetStage';
import { playBgm } from '@/Core/controller/stage/playBgm';

// ─── 场景管理 ───
import { changeScene } from '@/Core/controller/scene/changeScene';
import { callScene } from '@/Core/controller/scene/callScene';
import { restoreScene } from '@/Core/controller/scene/restoreScene';
import { sceneFetcher } from '@/Core/controller/scene/sceneFetcher';
import { sceneParser, WebgalParser } from '@/Core/parser/sceneParser';

// ─── Redux actions ───
import { setStage, resetStageState } from '@/store/stageReducer';
import { setVisibility } from '@/store/GUIReducer';

// ─── 配置 & 类型 ───
import { SYSTEM_CONFIG, PERFORM_CONFIG } from '@/config';

import cloneDeep from 'lodash/cloneDeep';
import type { IWebGALTestAPI, IGameStateSnapshot } from '@/test/types';

/**
 * 拍摄当前状态快照（包含完整的舞台、视觉、演出状态）
 */
function takeSnapshot(): IGameStateSnapshot {
  const state = webgalStore.getState();
  const pixiStage = WebGAL.gameplay.pixiStage;

  return {
    // Redux 状态
    stageState: cloneDeep(state.stage),
    guiState: cloneDeep(state.GUI),
    userData: cloneDeep(state.userData),

    // 场景状态
    sceneState: {
      currentSentenceId: WebGAL.sceneManager.sceneData.currentSentenceId,
      sceneName: WebGAL.sceneManager.sceneData.currentScene.sceneName,
      sceneUrl: WebGAL.sceneManager.sceneData.currentScene.sceneUrl,
      sentenceCount: WebGAL.sceneManager.sceneData.currentScene.sentenceList.length,
      sceneStackLength: WebGAL.sceneManager.sceneData.sceneStack.length,
      sceneStack: cloneDeep(WebGAL.sceneManager.sceneData.sceneStack),
    },

    // Backlog
    backlog: cloneDeep(WebGAL.backlogManager.getBacklog()),
    backlogLength: WebGAL.backlogManager.getBacklog().length,

    // 演出管理器
    performs: WebGAL.gameplay.performController.performList.map((p) => ({
      performName: p.performName,
      duration: p.duration,
      isHoldOn: p.isHoldOn,
      blockingNext: p.blockingNext(),
      blockingAuto: p.blockingAuto(),
      goNextWhenOver: p.goNextWhenOver ?? false,
    })),
    performListLength: WebGAL.gameplay.performController.performList.length,

    // Pixi 舞台视觉状态
    pixiState: pixiStage
      ? {
          figureObjects: pixiStage.figureObjects.map((obj) => ({
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
          })),
          backgroundObjects: pixiStage.backgroundObjects.map((obj) => ({
            uuid: obj.uuid,
            key: obj.key,
            sourceUrl: obj.sourceUrl,
            sourceType: obj.sourceType,
            isExiting: obj.isExiting ?? false,
          })),
          stageWidth: pixiStage.stageWidth,
          stageHeight: pixiStage.stageHeight,
        }
      : null,

    // 游戏播放状态
    gameplayState: {
      isAuto: WebGAL.gameplay.isAuto,
      isFast: WebGAL.gameplay.isFast,
    },

    // 用户自定义动画
    animations: WebGAL.animationManager.getAnimations().map((a) => ({
      name: a.name,
      frameCount: a.effects.length,
    })),

    timestamp: Date.now(),
  };
}

/**
 * 注入测试场景：直接用原始脚本文本创建场景并执行
 */
function injectScene(rawSceneText: string, sceneName = '__test__'): void {
  const parsed = sceneParser(rawSceneText, sceneName, `memory://${sceneName}`);
  WebGAL.sceneManager.sceneData.currentScene = parsed;
  WebGAL.sceneManager.sceneData.currentSentenceId = 0;
}

/**
 * 注入测试场景并开始执行
 */
function injectSceneAndRun(rawSceneText: string, sceneName = '__test__'): void {
  // 先停止当前所有演出
  WebGAL.gameplay.performController.removeAllPerform();
  injectScene(rawSceneText, sceneName);
  nextSentence();
}

/**
 * 注入测试场景（使用 ISentence 数组直接注入，跳过解析）
 */
function injectParsedScene(sentenceList: unknown[], sceneName = '__test__'): void {
  WebGAL.sceneManager.sceneData.currentScene = {
    sceneName,
    sceneUrl: `memory://${sceneName}`,
    sentenceList: sentenceList as any[],
    assetsList: [],
    subSceneList: [],
  };
  WebGAL.sceneManager.sceneData.currentSentenceId = 0;
}

export function exposeTestAPI(): void {
  const api: IWebGALTestAPI = {
    // ═══ 核心实例（完整的内部访问） ═══
    core: WebGAL,
    live2d: Live2D,
    store: webgalStore,

    // ═══ Pixi 舞台（直接引用，可深度操控） ═══
    get pixiStage() {
      return WebGAL.gameplay.pixiStage;
    },
    get pixiApp() {
      return WebGAL.gameplay.pixiStage?.currentApp ?? null;
    },

    // ═══ 子模块快捷访问 ═══
    get sceneManager() {
      return WebGAL.sceneManager;
    },
    get backlogManager() {
      return WebGAL.backlogManager;
    },
    get animationManager() {
      return WebGAL.animationManager;
    },
    get performController() {
      return WebGAL.gameplay.performController;
    },
    get gameplay() {
      return WebGAL.gameplay;
    },
    get events() {
      return WebGAL.events;
    },

    // ═══ 控制器函数 ═══
    controllers: {
      // 游戏流程
      nextSentence,
      scriptExecutor,
      switchAuto,
      stopAuto,
      switchFast,
      stopFast,
      stopAll,
      startGame,
      continueGame,

      // 存档/读档
      saveGame,
      loadGame,
      loadGameFromStageData,
      jumpFromBacklog,
      generateCurrentStageData,

      // 舞台
      resetStage,
      playBgm,

      // 场景
      changeScene,
      callScene,
      restoreScene,
    },

    // ═══ 场景解析 & 注入 ═══
    sceneTools: {
      sceneParser,
      sceneFetcher,
      webgalParser: WebgalParser,
      injectScene,
      injectSceneAndRun,
      injectParsedScene,
    },

    // ═══ Redux dispatch helpers ═══
    dispatch: {
      setStage: (key: string, value: unknown) => webgalStore.dispatch(setStage({ key, value } as any)),
      resetStageState: (state: unknown) => webgalStore.dispatch(resetStageState(state as any)),
      setVisibility: (component: string, visibility: boolean) =>
        webgalStore.dispatch(setVisibility({ component, visibility } as any)),
      raw: (action: unknown) => webgalStore.dispatch(action as any),
    },

    // ═══ 配置 ═══
    config: {
      SYSTEM_CONFIG,
      PERFORM_CONFIG,
    },

    // ═══ 状态快照 ═══
    takeSnapshot,

    // ═══ 工具 ═══
    utils: {
      cloneDeep,
    },
  };

  window.webgalTest = api;

  console.log(
    '%c🧪 WebGAL Test Mode Active',
    'color: #E91E63; font-weight: bold; font-size: 1.5em;',
  );
  console.log(
    '%cFull API exposed at window.webgalTest',
    'color: #9C27B0; font-style: italic;',
  );
  console.log(
    '%cModules: core, live2d, pixiStage, pixiApp, sceneManager, backlogManager, ' +
      'animationManager, performController, gameplay, events, controllers, sceneTools, dispatch, config',
    'color: #607D8B; font-size: 0.9em;',
  );
}
