import styles from './extra.module.scss';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { setVisibility } from '@/store/GUIReducer';
import { CloseSmall } from '@icon-park/react';
import { ExtraBgm } from '@/UI/Extra/ExtraBgm';
import { ExtraCg } from './ExtraCg';
import useTrans from '@/hooks/useTrans';
import useSoundEffect from '@/hooks/useSoundEffect';
import useApplyStyle from '@/hooks/useApplyStyle';

export function Extra() {
  const { playSeClick } = useSoundEffect();
  const showExtra = useSelector((state: RootState) => state.GUI.showExtra);
  const dispatch = useDispatch();
  const applyStyle = useApplyStyle('extra');

  const t = useTrans('extra.');
  return (
    <>
      {showExtra && (
        <div className={applyStyle('extra', styles.extra)}>
          <div className={applyStyle('extra_top', styles.extra_top)}>
            <CloseSmall
              className={applyStyle('extra_top_icon', styles.extra_top_icon)}
              onClick={() => {
                dispatch(setVisibility({ component: 'showExtra', visibility: false }));
                playSeClick();
              }}
              onMouseEnter={playSeClick}
              theme="outline"
              size="4em"
              fill="#fff"
              strokeWidth={3}
            />
            <div className={applyStyle('extra_title', styles.extra_title)}>{t('title')}</div>
          </div>
          <div className={applyStyle('mainContainer', styles.mainContainer)}>
            <ExtraCg />
            <ExtraBgm />
          </div>
        </div>
      )}
    </>
  );
}
