import { useEffect } from 'react';
import styles from './panicYoozle.module.scss';

export default function PanicYoozle() {
  useEffect(() => {
    const panicTitle = 'Yoozle Search';
    const originalTitle = document.title;
    document.title = panicTitle;
    return () => {
      document.title = originalTitle;
    };
  }, []);
  return (
    <div className={styles.yoozle_container}>
      <div className={styles.yoozle_title}>
        <span>
          <span className={styles.yoozle_blue} style={{ marginRight: '1px' }}>
            W
          </span>
          <span className={`${styles.yoozle_red}`}>e</span>
          <span className={styles.yoozle_yellow}>b</span>
          <span className={styles.yoozle_blue}>g</span>
          <span className={`${styles.yoozle_green} ${styles.yoozle_e_rotate}`}>a</span>
          <span className={`${styles.yoozle_red}`}>l</span>
        </span>
      </div>
      <div className={styles.yoozle_search}>
        <input className={styles.yoozle_search_bar} type="text" defaultValue="" />
        <div className={styles.yoozle_search_buttons}>
          <input className={styles.yoozle_button} type="submit" value="WebGAL Search" />
          <input className={styles.yoozle_button} type="submit" value="Feeling Lucky" />
        </div>
      </div>
    </div>
  );
}
