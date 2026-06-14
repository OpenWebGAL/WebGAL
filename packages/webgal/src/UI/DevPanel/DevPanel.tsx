import styles from './devPanel.module.scss';
import { useValue } from '@/hooks/useValue';
import { getPixiSscreenshot } from '@/UI/DevPanel/devFunctions/getPixiSscreenshot';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { WebGAL } from '@/Core/WebGAL';
import { useStageState } from '@/hooks/useStageState';

export default function DevPanel() {
  // 控制显隐
  function isShowDevPanel() {
    const hash = window.location.hash;
    return !!hash.match(/dev/);
  }
  const isOpenDevPanel = useValue(false);
  const hash = useValue(window.location.hash);
  const stageState = useStageState();
  useEffect(() => {
    window.onhashchange = () => {
      hash.set(window.location.hash);
    };
  }, []);
  const isShow = isShowDevPanel();

  const { t, i18n } = useTranslation();

  const devMainArea = (
    <>
      <div onClick={() => getPixiSscreenshot()}>Save PIXI Screenshot</div>
      <div>Current Language:{i18n.language}</div>
      <div onClick={() => WebGAL.gameplay.pixiStage?.removeAnimation('snow-ticker')}>Remove Snow Ticker</div>
      <div>Stage State</div>
      <div>{JSON.stringify(stageState, null, '  ')}</div>
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
          <div style={{ padding: '10px 10px 10px 10px', overflow: 'auto' }}>{devMainArea}</div>
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
