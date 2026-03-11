import { RootState } from '@/store/store';
import { useSelector } from 'react-redux';
import Iframe from './Iframe';
import styles from './IframeContainer.module.scss';

export default function IframeContainer() {
  const iframes = useSelector((state: RootState) => state.stage.frames.filter((s) => !s.isDestroy));
  return (
    <div className={styles.IframeContainer}>
      {iframes.map((iframe) => (
        <Iframe key={iframe.id} {...iframe} />
      ))}
    </div>
  );
}
