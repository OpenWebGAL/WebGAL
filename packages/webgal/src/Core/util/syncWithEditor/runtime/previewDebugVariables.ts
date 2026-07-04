import { setGameVarFromExpression } from '@/Core/gameScripts/setVar';
import { stageStateManager } from '@/Core/Modules/stage/stageStateManager';
import type { IGameVar } from '@/Core/Modules/stage/stageInterface';
import { webgalStore } from '@/store/store';
import { setUserData } from '@/store/userDataReducer';
import type { DebugVariable } from '@/types/editorPreviewProtocol';

let debugStageVarKeys = new Set<string>();
let debugGlobalBackup: { globalGameVar: IGameVar; scriptManagedGlobalVar: string[] } | null = null;

function clearPreviewDebugVariables() {
  const stageVars = stageStateManager.getCalculationStageState().GameVar;
  debugStageVarKeys.forEach((key) => {
    delete stageVars[key];
  });
  debugStageVarKeys = new Set<string>();

  if (!debugGlobalBackup) {
    return;
  }
  webgalStore.dispatch(setUserData({ key: 'globalGameVar', value: debugGlobalBackup.globalGameVar }));
  webgalStore.dispatch(setUserData({ key: 'scriptManagedGlobalVar', value: debugGlobalBackup.scriptManagedGlobalVar }));
  debugGlobalBackup = null;
}

export function applyPreviewDebugVariables(debugVariables: DebugVariable[] = []) {
  clearPreviewDebugVariables();
  if (debugVariables.some((item) => item.isGlobal)) {
    const userData = webgalStore.getState().userData;
    debugGlobalBackup = {
      globalGameVar: { ...userData.globalGameVar },
      scriptManagedGlobalVar: [...userData.scriptManagedGlobalVar],
    };
  }

  debugVariables
    .filter((item) => item.key.trim())
    .forEach((item) => {
      setGameVarFromExpression({
        key: item.key,
        value: item.value,
        isGlobal: item.isGlobal,
        persistGlobal: false,
      });
      if (!item.isGlobal) {
        debugStageVarKeys.add(item.key.trim());
      }
    });
}
