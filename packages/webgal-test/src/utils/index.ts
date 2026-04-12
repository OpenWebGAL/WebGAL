export {
  // 基础等待
  waitForTestAPI,
  delay,
  waitForSentenceAdvance,
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
  callJumpFromBacklog,
  callGenerateCurrentStageData,
  // 舞台控制
  callResetStage,
  callPlayBgm,
  // 场景管理
  callChangeScene,
  callCallScene,
  // 场景注入
  injectScene,
  injectSceneAndRun,
  // 状态快照
  takeSnapshot,
  compareSnapshots,
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
  // Pixi 舞台
  getFigureObjects,
  getBackgroundObjects,
  // 配置
  getSystemConfig,
  // Redux dispatch
  dispatchSetStage,
  dispatchSetVisibility,
  // 场景生成
  generateTestScene,
  // 类型
  type GameStateSnapshot,
  type PerformSnapshot,
  type FigureObjectSnapshot,
  type BackgroundObjectSnapshot,
} from './bridge';

export {
  getBrowser,
  createTestPage,
  startGameAndWait,
  closeBrowser,
} from './fixture';
