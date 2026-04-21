import { RootState } from '@/store/store';
import { useSelector } from 'react-redux';
import Iframe from './Iframe';
import styles from './IframeContainer.module.scss';
import { useMemo } from 'react';

export default function IframeContainer() {
  const iframes = useSelector((state: RootState) => state.stage.iframes);
  const shouldShowIframe = useMemo(() => iframes.filter((iframe) => iframe.isActive), [iframes]);
  return (
    <div className={styles.IframeContainer} id="iframeContainer">
      {shouldShowIframe.map((iframe) => (
        <Iframe key={iframe.id} {...iframe} />
      ))}
    </div>
  );
}
