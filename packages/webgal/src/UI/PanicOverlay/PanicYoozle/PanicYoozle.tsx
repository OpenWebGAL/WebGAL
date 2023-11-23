import styles from './panicYoozle.module.scss';
import { useEffect } from 'react';

export const PanicYoozle = () => {
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
            Y
          </span>
          <span className={styles.yoozle_red}>o</span>
          <span className={styles.yoozle_yellow}>o</span>
          <span className={styles.yoozle_blue}>z</span>
          <span className={styles.yoozle_green}>l</span>
          <span className={`${styles.yoozle_red} ${styles.yoozle_e_rotate}`}>e</span>
        </span>
      </div>
      <div className={styles.yoozle_search}>
        <input className={styles.yoozle_search_bar} type="text" defaultValue="" />
        <div className={styles.yoozle_search_buttons}>
          <input className={styles.yoozle_button} type="submit" value="Yoozle Search" />
          <input className={styles.yoozle_button} type="submit" value="Feeling Lucky" />
        </div>
      </div>
    </div>
  );
};
