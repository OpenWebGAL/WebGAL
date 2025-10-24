import useApplyStyle from '@/hooks/useApplyStyle';
import { useEffect } from 'react';
import styles from './panicYoozle.module.scss';

export default function PanicYoozle() {
  const applyStyle = useApplyStyle('UI/PanicOverlay/PanicYoozle/panicYoozle.scss');
  useEffect(() => {
    const panicTitle = 'Yoozle Search';
    const originalTitle = document.title;
    document.title = panicTitle;
    return () => {
      document.title = originalTitle;
    };
  }, []);
  return (
    <div className={applyStyle('panic_yoozle_container', styles.panic_yoozle_container)}>
      <div className={applyStyle('panic_yoozle_title', styles.panic_yoozle_title)}>
        <span>
          <span className={applyStyle('panic_yoozle_blue', styles.panic_yoozle_blue)}>W</span>
          <span className={applyStyle('panic_yoozle_red', styles.panic_yoozle_red)}>e</span>
          <span className={applyStyle('panic_yoozle_yellow', styles.panic_yoozle_yellow)}>b</span>
          <span className={applyStyle('panic_yoozle_blue', styles.panic_yoozle_blue)}>g</span>
          <span
            className={`${applyStyle('panic_yoozle_green', styles.panic_yoozle_green)} ${applyStyle(
              'panic_yoozle_e_rotate',
              styles.panic_yoozle_e_rotate,
            )}`}
          >
            a
          </span>
          <span className={applyStyle('panic_yoozle_red', styles.panic_yoozle_red)}>l</span>
        </span>
      </div>
      <div className={applyStyle('panic_yoozle_search', styles.panic_yoozle_search)}>
        <input
          className={applyStyle('panic_yoozle_search_bar', styles.panic_yoozle_search_bar)}
          type="text"
          defaultValue=""
        />
        <div className={applyStyle('panic_yoozle_search_buttons', styles.panic_yoozle_search_buttons)}>
          <input
            className={applyStyle('panic_yoozle_button', styles.panic_yoozle_button)}
            type="submit"
            value="WebGAL Search"
          />
          <input
            className={applyStyle('panic_yoozle_button', styles.panic_yoozle_button)}
            type="submit"
            value="Feeling Lucky"
          />
        </div>
      </div>
    </div>
  );
}
