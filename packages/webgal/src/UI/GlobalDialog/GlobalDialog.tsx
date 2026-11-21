import { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { useSelector } from 'react-redux';
import { RootState, webgalStore } from '@/store/store';
import { setVisibility } from '@/store/GUIReducer';
import { ScreenSlotRenderer } from '@/screens/ScreenSlotRenderer';
import { useUiCommonProps } from '@/screens/stage/shared';
import { getMockGlobalDialog, useActiveUiScreen, useUiMockDataEnabled } from '@/sdk/mockData';

let hasImperativeGlobalDialog = false;
let pendingRenderTimer: ReturnType<typeof setTimeout> | null = null;

function clearPendingRenderTimer() {
  if (pendingRenderTimer !== null) {
    clearTimeout(pendingRenderTimer);
    pendingRenderTimer = null;
  }
}

function CustomGlobalDialogHost(props: IShowGlobalDialogProps & { onConfirm: () => void; onCancel: () => void }) {
  const uiCommon = useUiCommonProps();
  return (
    <ScreenSlotRenderer
      screen="globalDialog"
      screenProps={{
        visible: true,
        title: props.title,
        confirmText: props.leftText,
        cancelText: props.rightText,
        onConfirm: props.onConfirm,
        onCancel: props.rightText ? props.onCancel : undefined,
        ...uiCommon,
      }}
    />
  );
}

function GlobalDialogMockPreview({ useMockText }: { useMockText: boolean }) {
  const uiCommon = useUiCommonProps();
  const mock = getMockGlobalDialog();
  return (
    <ScreenSlotRenderer
      screen="globalDialog"
      screenProps={{
        visible: true,
        title: useMockText ? mock.title : '',
        confirmText: useMockText ? mock.confirmText : '',
        cancelText: useMockText ? mock.cancelText : undefined,
        onConfirm: hideGlobalDialog,
        onCancel: hideGlobalDialog,
        ...uiCommon,
      }}
    />
  );
}

export default function GlobalDialog() {
  const isGlobalDialogShow = useSelector((state: RootState) => state.GUI.showGlobalDialog);
  const mockDataEnabled = useUiMockDataEnabled();
  const activeUiScreen = useActiveUiScreen();
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isGlobalDialogShow) {
      clearPendingRenderTimer();
      hasImperativeGlobalDialog = false;
      return;
    }
    const container = containerRef.current;
    return () => {
      clearPendingRenderTimer();
      hasImperativeGlobalDialog = false;
      if (container) {
        // eslint-disable-next-line react/no-deprecated
        ReactDOM.unmountComponentAtNode(container);
      }
    };
  }, [isGlobalDialogShow]);

  const showPreviewHost = activeUiScreen === 'globalDialog' && !hasImperativeGlobalDialog;

  return (
    <>
      {isGlobalDialogShow && <div id="globalDialogContainer" ref={containerRef} />}
      {showPreviewHost && <GlobalDialogMockPreview useMockText={mockDataEnabled} />}
    </>
  );
}

interface IShowGlobalDialogProps {
  title: string;
  leftText: string;
  rightText?: string;
  leftFunc?: Function;
  rightFunc?: Function;
}

export function showGlogalDialog(props: IShowGlobalDialogProps) {
  clearPendingRenderTimer();
  hasImperativeGlobalDialog = true;
  webgalStore.dispatch(setVisibility({ component: 'showGlobalDialog', visibility: true }));
  const handleLeft = () => {
    props.leftFunc?.();
    hideGlobalDialog();
  };
  const handleRight = () => {
    props.rightFunc?.();
    hideGlobalDialog();
  };
  const renderElement = <CustomGlobalDialogHost {...props} onConfirm={handleLeft} onCancel={handleRight} />;
  pendingRenderTimer = setTimeout(() => {
    pendingRenderTimer = null;
    const container = document.getElementById('globalDialogContainer');
    if (!container) return;
    // eslint-disable-next-line react/no-deprecated
    ReactDOM.render(renderElement, container);
  }, 100);
}

export function hideGlobalDialog() {
  clearPendingRenderTimer();
  hasImperativeGlobalDialog = false;
  webgalStore.dispatch(setVisibility({ component: 'showGlobalDialog', visibility: false }));
}

export function showControls() {
  webgalStore.dispatch(setVisibility({ component: 'showControls', visibility: true }));
}

export function hideControls() {
  webgalStore.dispatch(setVisibility({ component: 'showControls', visibility: false }));
}

export function switchControls() {
  if (webgalStore.getState().GUI.showControls === true) {
    hideControls();
  } else {
    showControls();
  }
}
