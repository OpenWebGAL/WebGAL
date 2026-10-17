import { logger } from '../../util/logger';
import { sceneFetcher } from '../scene/sceneFetcher';
import { sceneParser } from '../../parser/sceneParser';
import { IEffect, IRunPerform, IStageState } from '@/Core/Modules/stage/stageInterface';
import { webgalStore } from '@/store/store';
import { setVisibility } from '@/store/GUIReducer';
import { runScript } from '@/Core/controller/gamePlay/runScript';
import { stopAllPerform } from '@/Core/controller/gamePlay/stopAllPerform';
import cloneDeep from 'lodash/cloneDeep';

import { WebGAL } from '@/Core/WebGAL';
import { stageStateManager } from '@/Core/Modules/stage/stageStateManager';
import { commandType } from '@/Core/controller/scene/sceneInterface';
import { getBooleanArgByKey } from '@/Core/util/getSentenceArg';
import { createSayPerform } from '@/Core/gameScripts/say/createSayPerform';
import { parseTempAnimation } from '@/Core/gameScripts/setTempAnimation';
import { isRelativeAnimation } from '@/Core/Modules/animationFunctions';

/**
 * 恢复演出的方式：
 * - rerun：重新执行语句（默认）
 * - rerunFromBase：先把目标恢复为动画执行前的变换，再重新执行语句
 * - rebuildSayPerform：只重建对话演出，不重新执行语句
 * - skip：不恢复
 */
type RestoreMode = 'rerun' | 'rerunFromBase' | 'rebuildSayPerform' | 'skip';

/**
 * 需要特殊处理的演出，以及如何处理。不在表中的演出按 rerun 处理
 */
const specialRestorePerforms: Array<{ isMatch: (perform: IRunPerform) => boolean; mode: RestoreMode }> = [
  // 正文和分段已经在存档中，只重建演出，不能重跑 say 再追加一次 concat
  {
    isMatch: ({ script }) => script.command === commandType.say,
    mode: 'rebuildSayPerform',
  },
  // 相对动画的结果依赖执行前的变换，而存档中只有终态，因此以记录的基准变换重放
  {
    isMatch: (perform) => perform.animationBase !== undefined,
    mode: 'rerunFromBase',
  },
  // 旧存档没有记录基准变换，相对动画重新执行会在终态上再叠加一次，因此不重播
  {
    isMatch: ({ script }) => script.command === commandType.setTempAnimation && parseTempAnimation(script).relative,
    mode: 'skip',
  },
  {
    isMatch: ({ script }) => script.command === commandType.setAnimation && isRelativeAnimation(script.content),
    mode: 'skip',
  },
];

function getRestoreMode(perform: IRunPerform): RestoreMode {
  return specialRestorePerforms.find((item) => item.isMatch(perform))?.mode ?? 'rerun';
}

/**
 * 直接替换演算状态中目标的变换，不与已有变换合并
 */
function replaceEffect(effect: IEffect) {
  stageStateManager.removeEffectByTargetId(effect.target);
  stageStateManager.getCalculationStageState().effects.push(cloneDeep(effect));
}

/**
 * 恢复演出
 */
export const restorePerform = (skipAnimation = false) => {
  const stageState = stageStateManager.getCalculationStageState();
  const performToRestore = cloneDeep(stageState.PerformList);
  // 存档中的变换已是所有动画叠加后的终态，重放动画只为恢复画面，结束后还原
  const savedEffects = cloneDeep(stageState.effects);
  // 清除状态表中演出序列
  stageStateManager.removeAllPerform();
  WebGAL.gameplay.performController.beginCollectingPerforms();
  try {
    performToRestore.forEach((e) => {
      const restoreMode = getRestoreMode(e);
      if (restoreMode === 'skip') {
        return;
      }
      if (restoreMode === 'rerunFromBase') {
        replaceEffect(e.animationBase!);
        runScript(e.script);
        return;
      }
      if (restoreMode === 'rebuildSayPerform') {
        if (stageState.isDialogNotend === undefined) {
          stageStateManager.setStage('isDialogNotend', getBooleanArgByKey(e.script, 'notend') ?? false);
        }
        WebGAL.gameplay.performController.arrangeNewPerform(createSayPerform(e.script), e.script);
        return;
      }
      runScript(e.script);
    });
  } finally {
    WebGAL.gameplay.performController.endCollectingPerforms();
  }
  stageStateManager.setStage('effects', savedEffects);
  stageStateManager.commit({ applyPixiEffects: false, skipAnimation });
  WebGAL.gameplay.performController.commitPendingPerforms();
  stageStateManager.applyCommittedPixiEffects();
};

/**
 * 从 backlog 跳转至一个先前的状态
 * @param index
 * @param refetchScene
 */
export const jumpFromBacklog = (index: number, refetchScene = true) => {
  const dispatch = webgalStore.dispatch;
  // 获得存档文件
  const backlogFile = WebGAL.backlogManager.getBacklog()[index];
  logger.debug('读取的backlog数据', backlogFile);
  // 重新获取并同步场景状态
  if (refetchScene)
    sceneFetcher(backlogFile.saveScene.sceneUrl).then((rawScene) => {
      WebGAL.sceneManager.sceneData.currentScene = sceneParser(
        rawScene,
        backlogFile.saveScene.sceneName,
        backlogFile.saveScene.sceneUrl,
      );
      WebGAL.sceneManager.settledScenes.add(WebGAL.sceneManager.sceneData.currentScene.sceneUrl); // 放入已加载场景列表，避免递归加载相同场景
    });
  WebGAL.sceneManager.sceneData.currentSentenceId = backlogFile.saveScene.currentSentenceId;
  WebGAL.sceneManager.sceneData.sceneStack = cloneDeep(backlogFile.saveScene.sceneStack);
  WebGAL.sceneManager.sceneData.currentLocals = cloneDeep(backlogFile.saveScene.currentLocals ?? {}); // 旧存档没有此字段

  // 强制停止所有演出
  stopAllPerform();

  // 弹出backlog项目到指定状态
  for (let i = WebGAL.backlogManager.getBacklog().length - 1; i > index; i--) {
    WebGAL.backlogManager.getBacklog().pop();
  }

  // 要记录本句 Backlog
  WebGAL.backlogManager.isSaveBacklogNext = true;

  // 恢复舞台状态
  const newStageState: IStageState = cloneDeep(backlogFile.currentStageState);

  // 确保原先未读的文本在使用 backlog 时能正确显示为已读文本
  newStageState.isRead = true;

  stageStateManager.replaceCalculationStageState(newStageState);

  // 恢复演出
  restorePerform();

  // 关闭backlog界面
  dispatch(setVisibility({ component: 'showBacklog', visibility: false }));

  // 重新显示 TextBox
  dispatch(setVisibility({ component: 'showTextBox', visibility: true }));

  // 重新渲染
  WebGAL.gameplay.pixiStage?.requestRender();
};
