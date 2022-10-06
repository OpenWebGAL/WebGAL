import styles from './devPanel.module.scss';
import { useObject } from '@/hooks/useObject';
import { getPixiSscreenshot } from '@/Components/UI/DevPanel/devFunctions/getPixiSscreenshot';

export default function DevPanel() {
  // 控制显隐
  function isShowDevPanel() {
    const hash = window.location.hash;
    return !!hash.match(/dev/);
  }
  const isOpenDevPanel = useObject(false);
  const isShow = isShowDevPanel();

  const devMainArea = (
    <>
      <div style={{ textAlign: 'center' }}>Webcome to WebGAL !</div>
      <div onClick={() => getPixiSscreenshot()}>Save PIXI Screenshot</div>
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
