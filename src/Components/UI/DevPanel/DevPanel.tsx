import styles from './devPanel.module.scss';
import { useObject } from '@/hooks/useObject';
import { getPixiSscreenshot } from '@/Components/UI/DevPanel/devFunctions/getPixiSscreenshot';
import { RUNTIME_GAMEPLAY } from '@/Core/runtime/gamePlay';
import { useEffect } from 'react';

export default function DevPanel() {
  // 控制显隐
  function isShowDevPanel() {
    const hash = window.location.hash;
    return !!hash.match(/dev/);
  }
  const isOpenDevPanel = useObject(false);
  const hash = useObject(window.location.hash);
  useEffect(() => {
    window.onhashchange = () => {
      hash.set(window.location.hash);
    };
  }, []);
  const isShow = isShowDevPanel();

  const devMainArea = (
    <>
      <div onClick={() => getPixiSscreenshot()}>Save PIXI Screenshot</div>
      <div onClick={() => RUNTIME_GAMEPLAY.pixiStage?.removeTicker('snow-Ticker')}>Remove Snow Ticker</div>
    </>
  );
  return (
    <>
      {isShow && isOpenDevPanel.value && (
        <div className={styles.devPanelMain}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div
              onClick={() => isOpenDevPanel.set(false)}
              style={{ fontSize: '150%', padding: '0 0 0 15px', cursor: 'pointer' }}
            >
              ×
            </div>
            <div style={{ padding: '0 0 0 15px', fontSize: '115%' }}>WebGAL DEV PANEL</div>
          </div>
          <div style={{ padding: '10px 10px 10px 10px' }}>{devMainArea}</div>
        </div>
      )}
      {!isOpenDevPanel.value && isShow && (
        <div onClick={() => isOpenDevPanel.set(true)} className={styles.devPanelOpener}>
          Open Dev Panel
        </div>
      )}
    </>
  );
}
