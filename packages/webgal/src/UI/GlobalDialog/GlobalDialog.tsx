import styles from './globalDialog.module.scss';
import ReactDOM from 'react-dom';
import { Provider, useSelector } from 'react-redux';
import { RootState, webgalStore } from '@/store/store';
import { setVisibility } from '@/store/GUIReducer';
import { useSEByWebgalStore } from '@/hooks/useSoundEffect';
import useApplyStyle from '@/hooks/useApplyStyle';
import { useDelayedVisibility } from '@/hooks/useDelayedVisibility';

export default function GlobalDialog() {
  const showGlobalDialog = useSelector((state: RootState) => state.GUI.showGlobalDialog);

  // 全局对话框延迟退场
  const delayedShowGlobalDialog = useDelayedVisibility(showGlobalDialog);

  return <>{delayedShowGlobalDialog && <div id="globalDialogContainer" />}</>;
}

interface IShowGlobalDialogProps {
  title: string;
  leftText: string;
  rightText: string;
  leftFunc: Function;
  rightFunc: Function;
}

function GlobalDialogContent(props: IShowGlobalDialogProps) {
  const { playSeClick, playSeEnter } = useSEByWebgalStore();
  const showGlobalDialog = useSelector((state: RootState) => state.GUI.showGlobalDialog);
  const uiTransitionDuration = useSelector((state: RootState) => state.userData.optionData.uiTransitionDuration);
  const handleLeft = () => {
    playSeClick();
    props.leftFunc();
    hideGlobalDialog();
  };
  const handleRight = () => {
    playSeClick();
    props.rightFunc();
    hideGlobalDialog();
  };
  const applyStyle = useApplyStyle('UI/GlobalDialog/globalDialog.scss');
  return (
    <div
      className={`${applyStyle('global_dialog_main', styles.global_dialog_main)} ${
        showGlobalDialog ? '' : applyStyle('global_dialog_main_hide', styles.global_dialog_main_hide)
      }`}
      style={{ ['--ui-transition-duration' as any]: `${uiTransitionDuration}ms` }}
      onWheel={(e) => {
        // 防止触发 useWheel
        e.stopPropagation();
      }}
    >
      <div className={applyStyle('global_dialog_popup', styles.global_dialog_popup)}>
        <div className={applyStyle('global_dialog_title', styles.global_dialog_title)}>{props.title}</div>
        <div className={applyStyle('global_dialog_button_list', styles.global_dialog_button_list)}>
          <div
            className={applyStyle('global_dialog_button', styles.global_dialog_button)}
            onClick={handleLeft}
            onMouseEnter={playSeEnter}
          >
            {props.leftText}
          </div>
          <div
            className={applyStyle('global_dialog_button', styles.global_dialog_button)}
            onClick={handleRight}
            onMouseEnter={playSeEnter}
          >
            {props.rightText}
          </div>
        </div>
      </div>
    </div>
  );
}

export function showGlobalDialog(props: IShowGlobalDialogProps) {
  webgalStore.dispatch(setVisibility({ component: 'showGlobalDialog', visibility: true }));
  setTimeout(() => {
    // eslint-disable-next-line react/no-deprecated
    ReactDOM.render(
      <Provider store={webgalStore}>
        <GlobalDialogContent {...props} />
      </Provider>,
      document.getElementById('globalDialogContainer'),
    );
  }, 100);
}

export function hideGlobalDialog() {
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
