import styles from './extra.module.scss';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { setVisibility } from '@/store/GUIReducer';
import { CloseSmall } from '@icon-park/react';
import { ExtraBgm } from '@/Components/UI/Extra/ExtraBgm';
import { ExtraCg } from './ExtraCg';

export function Extra() {
  const showExtra = useSelector((state: RootState) => state.GUI.showExtra);
  const dispatch = useDispatch();

  return (
    <>
      {showExtra && (
        <div className={styles.extra}>
          <div className={styles.extra_top}>
            <CloseSmall
              className={styles.extra_top_icon}
              onClick={() => {
                dispatch(setVisibility({ component: 'showExtra', visibility: false }));
              }}
              theme="outline"
              size="4em"
              fill="#fff"
              strokeWidth={3}
            />
            <div className={styles.extra_title}>鉴赏模式</div>
          </div>
          <div className={styles.mainContainer}>
            <ExtraCg />
            <ExtraBgm />
          </div>
        </div>
      )}
    </>
  );
}
