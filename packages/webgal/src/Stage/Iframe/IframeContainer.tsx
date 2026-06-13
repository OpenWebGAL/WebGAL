import Iframe from './Iframe';
import styles from './IframeContainer.module.scss';
import { useMemo } from 'react';
import { useStageState } from '@/hooks/useStageState';

export default function IframeContainer() {
  const stage = useStageState();
  const iframes = useMemo(() => stage.iframes, [stage]);
  const shouldShowIframe = useMemo(() => iframes.filter((iframe) => iframe.isActive), [iframes]);
  return (
    <div className={styles.IframeContainer} id="iframeContainer">
      {shouldShowIframe.map((iframe) => (
        <Iframe key={iframe.id} {...iframe} />
      ))}
    </div>
  );
}
