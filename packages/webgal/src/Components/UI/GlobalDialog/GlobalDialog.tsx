import styles from './globalDialog.module.scss';
import ReactDOM from 'react-dom';
import { useSelector } from 'react-redux';
import { RootState, webgalStore } from '@/store/store';
import { setVisibility } from '@/store/GUIReducer';
import useSoundEffect from '@/hooks/useSoundEffect';

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
  const { setClickSavingDialogButtonSE, setMouseEnterSavePageButtonSE } = useSoundEffect();
  webgalStore.dispatch(setVisibility({ component: 'showGlobalDialog', visibility: true }));
  const handleLeft = () => {
    setClickSavingDialogButtonSE();
    props.leftFunc();
    hideGlobalDialog();
  };
  const handleRight = () => {
    setClickSavingDialogButtonSE();
    props.rightFunc();
    hideGlobalDialog();
  };
  const renderElement = (
    <div className={styles.GlobalDialog_main}>
      <div className={styles.glabalDialog_container}>
        <div className={styles.glabalDialog_container_inner}>
          <div className={styles.title}>{props.title}</div>
          <div className={styles.button_list}>
            <div className={styles.button} onClick={handleLeft} onMouseEnter={setMouseEnterSavePageButtonSE}>
              {props.leftText}
            </div>
            <div className={styles.button} onClick={handleRight} onMouseEnter={setMouseEnterSavePageButtonSE}>
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
