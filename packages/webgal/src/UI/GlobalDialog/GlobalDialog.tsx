import styles from './globalDialog.module.scss';
import ReactDOM from 'react-dom';
import { useSelector } from 'react-redux';
import { RootState, webgalStore } from '@/store/store';
import { setVisibility } from '@/store/GUIReducer';
import { useSEByWebgalStore } from '@/hooks/useSoundEffect';

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

export function showGlogalDialog(props: IShowGlobalDialogProps) {
  const { playSeClickDialogButton, playSeEnterDialogButton } = useSEByWebgalStore();
  webgalStore.dispatch(setVisibility({ component: 'showGlobalDialog', visibility: true }));
  const handleLeft = () => {
    playSeClickDialogButton();
    props.leftFunc();
    hideGlobalDialog();
  };
  const handleRight = () => {
    playSeClickDialogButton();
    props.rightFunc();
    hideGlobalDialog();
  };
  const renderElement = (
    <div className={styles.GlobalDialog_main}>
      <div className={styles.glabalDialog_container}>
        <div className={styles.glabalDialog_container_inner}>
          <div className={styles.title}>{props.title}</div>
          <div className={styles.button_list}>
            <div className={styles.button} onClick={handleLeft} onMouseEnter={playSeEnterDialogButton}>
              {props.leftText}
            </div>
            <div className={styles.button} onClick={handleRight} onMouseEnter={playSeEnterDialogButton}>
              {props.rightText}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  setTimeout(() => {
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
