import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { useSetBg } from '@/Components/Stage/MainStage/useSetBg';
import { useSetFigure } from '@/Components/Stage/MainStage/useSetFigure';
import { useSetUI } from '@/Components/Stage/MainStage/useSetUI';
import { setStageObjectEffects } from '@/Components/Stage/MainStage/useSetEffects';

export function MainStage() {
  const stageState = useSelector((state: RootState) => state.stage);
  useSetBg(stageState);
  useSetFigure(stageState);
  useSetUI(stageState);
  setStageObjectEffects(stageState);
  return <div style={{ display: 'none' }} />;
}
