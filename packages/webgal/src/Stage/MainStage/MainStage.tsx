import { useSetBg } from '@/Stage/MainStage/useSetBg';
import { useSetFigure } from '@/Stage/MainStage/useSetFigure';
import { setStageObjectEffects } from '@/Stage/MainStage/useSetEffects';
import { useStageState } from '@/hooks/useStageState';

export function MainStage() {
  const stageState = useStageState();
  useSetBg(stageState);
  useSetFigure(stageState);
  setStageObjectEffects(stageState);
  return <div style={{ display: 'none' }} />;
}
