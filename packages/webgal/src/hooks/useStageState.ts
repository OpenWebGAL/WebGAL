import { useEffect, useState } from 'react';
import { stageStateManager } from '@/Core/Modules/stage/stageStateManager';
import { IStageState } from '@/Core/Modules/stage/stageInterface';

export function useStageState(): IStageState {
  const [stageState, setStageState] = useState<IStageState>(() => stageStateManager.getViewStageState());

  useEffect(() => {
    return stageStateManager.subscribe((nextStageState) => {
      setStageState(nextStageState);
    });
  }, []);

  return stageState;
}
