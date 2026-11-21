import { loadGameFromStageData } from '@/Core/controller/storage/loadGame';
import { WebGAL } from '@/Core/WebGAL';
import useSoundEffect from '@/hooks/useSoundEffect';
import { MENU_BUILTIN_SCREENS } from '@/screens/menu';
import { registerBuiltInScreens } from '@/screens/screenRegistry';
import { ScreenSlotRenderer } from '@/screens/ScreenSlotRenderer';
import { useUiCommonProps } from '@/screens/stage/shared';
import { getMockFlowcharts, useUiMockDataEnabled } from '@/sdk/mockData';
import { setVisibility } from '@/store/GUIReducer';
import { RootState } from '@/store/store';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

registerBuiltInScreens(MENU_BUILTIN_SCREENS);

type LockedNodeVisibility = 'all' | 'node' | 'none';

function normalizeLockedNodeVisibility(value: unknown): LockedNodeVisibility {
  return value === 'all' || value === 'none' ? value : 'node';
}

export interface FlowchartConnectorProps {
  visible?: boolean;
}

export const Flowchart = ({ visible = true }: FlowchartConnectorProps) => {
  const { playSeClick } = useSoundEffect();
  const dispatch = useDispatch();
  const mockDataEnabled = useUiMockDataEnabled();
  const uiCommon = useUiCommonProps();
  const lockedNodeVisibility = useSelector((state: RootState) =>
    normalizeLockedNodeVisibility(state.userData.globalGameVar.Flowchart_Locked_Node_Visibility),
  );
  const [version, setVersion] = useState(0);
  const flowcharts = WebGAL.flowchartManager.getVisibleFlowcharts();

  useEffect(() => {
    const update = () => setVersion((v) => v + 1);
    window.addEventListener(WebGAL.flowchartManager.getEventName(), update);
    return () => window.removeEventListener(WebGAL.flowchartManager.getEventName(), update);
  }, []);

  const unlockedNodeKeys = useMemo(() => {
    const keys: string[] = [];
    for (const fc of flowcharts) {
      for (const node of fc.nodes) {
        if (WebGAL.flowchartManager.isUnlocked(fc.id, node.id)) {
          keys.push(`${fc.id}-${node.id}`);
        }
      }
    }
    return keys;
  }, [flowcharts, version]);

  const handleJumpByIds = useCallback(
    (flowchartId: string, nodeId: string) => {
      if (mockDataEnabled || !WebGAL.flowchartManager.isUnlocked(flowchartId, nodeId)) return;
      playSeClick();
      void WebGAL.flowchartManager.loadSnapshot(flowchartId, nodeId).then((snapshot) => {
        if (!snapshot) return;
        loadGameFromStageData(snapshot);
        dispatch(setVisibility({ component: 'showMenuPanel', visibility: false }));
        dispatch(setVisibility({ component: 'showTextBox', visibility: true }));
      });
    },
    [dispatch, mockDataEnabled, playSeClick],
  );

  const mockData = mockDataEnabled ? getMockFlowcharts() : null;
  return (
    <ScreenSlotRenderer
      screen="flowchart"
      screenProps={{
        visible,
        flowcharts: mockData ? mockData.flowcharts : flowcharts,
        unlockedNodeKeys: mockData ? mockData.unlockedNodeKeys : unlockedNodeKeys,
        lockedNodeVisibility,
        onJumpToNode: handleJumpByIds,
        ...uiCommon,
      }}
    />
  );
};
