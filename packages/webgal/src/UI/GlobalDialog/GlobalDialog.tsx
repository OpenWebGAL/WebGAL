import styles from './globalDialog.module.scss';
import ReactDOM from 'react-dom';
import { useSelector } from 'react-redux';
import { RootState, webgalStore } from '@/store/store';
import { setVisibility } from '@/store/GUIReducer';
import { useSEByWebgalStore } from '@/hooks/useSoundEffect';
import useApplyStyle from '@/hooks/useApplyStyle';

export default function GlobalDialog() {
  const isGlobalDialogShow = useSelector((state: RootState) => state.GUI.showGlobalDialog);
  return <>{isGlobalDialogShow && <div id="globalDialogContainer" />}</>;
}

interface IShowGlobalDialogProps {
  title: string;
  leftText: string;
  rightText: string;
  leftFunc: Function;
  rightFunc: Function;
}

interface IGlobalDialogContentProps {
  title: string;
  leftText: string;
  rightText: string;
  onLeft: () => void;
  onRight: () => void;
}

function GlobalDialogContent(props: IGlobalDialogContentProps) {
  const applyStyle = useApplyStyle('globalDialog');
  const { playSeEnter } = useSEByWebgalStore();
  return (
    <div className={applyStyle('GlobalDialog_main', styles.GlobalDialog_main)}>
      <div className={applyStyle('glabalDialog_container', styles.glabalDialog_container)}>
        <div className={applyStyle('glabalDialog_container_inner', styles.glabalDialog_container_inner)}>
          <div className={applyStyle('title', styles.title)}>{props.title}</div>
          <div className={applyStyle('button_list', styles.button_list)}>
            <div className={applyStyle('button', styles.button)} onClick={props.onLeft} onMouseEnter={playSeEnter}>
              {props.leftText}
            </div>
            <div className={applyStyle('button', styles.button)} onClick={props.onRight} onMouseEnter={playSeEnter}>
              {props.rightText}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function showGlogalDialog(props: IShowGlobalDialogProps) {
  const { playSeClick } = useSEByWebgalStore();
  webgalStore.dispatch(setVisibility({ component: 'showGlobalDialog', visibility: true }));
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
  const renderElement = (
    <GlobalDialogContent
      title={props.title}
      leftText={props.leftText}
      rightText={props.rightText}
      onLeft={handleLeft}
      onRight={handleRight}
    />
  );
  setTimeout(() => {
    // eslint-disable-next-line react/no-deprecated
    ReactDOM.render(renderElement, document.getElementById('globalDialogContainer'));
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
