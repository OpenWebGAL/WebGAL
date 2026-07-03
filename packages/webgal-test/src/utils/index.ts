export {
  // 基础等待
  waitForTestAPI,
  delay,
  waitForSentenceAdvance,
  clickStage,
  // 流程控制
  callNextSentence,
  callStartGame,
  callContinueGame,
  callScriptExecutor,
  // 自动/快进
  callSwitchAuto,
  callStopAuto,
  callSwitchFast,
  callStopFast,
  callStopAll,
  // 存档/读档
  callSaveGame,
  callLoadGame,
  callLoadGameFromStageData,
  callJumpFromBacklog,
  callGenerateCurrentStageData,
  // 舞台控制
  callResetStage,
  callPlayBgm,
  // 场景管理
  callChangeScene,
  callCallScene,
  callSyncWithOrigine,
  // 场景注入
  routeScene,
  injectScene,
  injectSceneAndRun,
  resetRuntime,
  settleText,
  settleAnimations,
  flushBrowserTasks,
  // 状态快照
  takeSnapshot,
  compareSnapshots,
  compareStableRuntimeSnapshots,
  toStableRuntimeSnapshot,
  getTestMetadata,
  getTextState,
  waitForTextPending,
  waitForTextSettled,
  // 场景状态
  getCurrentSentenceId,
  getCurrentSceneName,
  getSceneStack,
  getSentenceCount,
  // Backlog
  getBacklogLength,
  getBacklog,
  // 游戏状态
  getIsAuto,
  getIsFast,
  // Redux 状态
  getStageState,
  getGuiState,
  // 演出管理
  getPerformList,
  removeAllPerforms,
  waitForNoTransientPerforms,
  waitForTransientPerform,
  // Pixi 舞台
  getFigureObjects,
  getBackgroundObjects,
  getActiveAnimations,
  waitForActiveAnimationOnTarget,
  waitForNoActiveAnimationOnTarget,
  waitForNoActiveAnimations,
  getLockedTargets,
  getStageObjectByKey,
  getStageEffect,
  // 配置
  getSystemConfig,
  // Redux dispatch
  dispatchSetStage,
  dispatchSetVisibility,
  setOptionData,
  // 场景生成
  generateTestScene,
  // 类型
  type GameStateSnapshot,
  type PerformSnapshot,
  type FigureObjectSnapshot,
  type BackgroundObjectSnapshot,
  type RuntimeAnimationSnapshot,
  type TextRuntimeSnapshot,
  type TestMetadata,
  type StageEffectSnapshot,
  type StableRuntimeSnapshot,
} from './bridge';

export {
  getBrowser,
  createTestPage,
  startGameAndWait,
  closeBrowser,
} from './fixture';
