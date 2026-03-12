import { RootState } from '@/store/store';
import { useSelector } from 'react-redux';
import Iframe from './Iframe';
import styles from './IframeContainer.module.scss';
import { useMemo } from 'react';

export default function IframeContainer() {
  const iframesStore = useSelector((state: RootState) => state.stage.frames);
  const iframes = useMemo(() => iframesStore.filter((s) => !s.isDestroy), [iframesStore]);
  return (
    <div className={styles.IframeContainer} id="iframeContainer">
      {iframes.map((iframe) => (
        <Iframe key={iframe.id} {...iframe} />
      ))}
    </div>
  );
}
