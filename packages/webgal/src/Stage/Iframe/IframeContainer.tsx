import { RootState } from '@/store/store';
import { useSelector } from 'react-redux';
import Iframe from './Iframe';
import styles from './IframeContainer.module.scss';

export default function IframeContainer() {
  const iframes = useSelector((state: RootState) => state.stage.frames);
  return (
    <div className={styles.IframeContainer} id="iframeContainer">
      {iframes.map((iframe) => (
        <Iframe key={iframe.id} {...iframe} />
      ))}
    </div>
  );
}
