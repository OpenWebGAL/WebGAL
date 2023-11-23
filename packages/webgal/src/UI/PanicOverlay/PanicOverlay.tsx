import styles from './panicOverlay.module.scss';
import { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { PanicYoozle } from '@/UI/PanicOverlay/PanicYoozle/PanicYoozle';

export const PanicOverlay = () => {
  const GUIStore = useSelector((state: RootState) => state.GUI);
  const [showOverlay, setShowOverlay] = useState(false);
  useEffect(() => {
    setShowOverlay(GUIStore.showPanicOverlay);
  }, [GUIStore.showPanicOverlay]);
  return ReactDOM.createPortal(
    <div className={showOverlay ? styles.panic_overlay_main : ''}>{showOverlay && <PanicYoozle />}</div>,
    document.querySelector('div#panic-overlay')!,
  );
};
