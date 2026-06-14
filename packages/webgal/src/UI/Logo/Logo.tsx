import { FC, useEffect } from 'react';
import styles from './logo.module.scss';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { useValue } from '@/hooks/useValue';
import { setVisibility } from '@/store/GUIReducer';

/**
 * 标识
 * @constructor
 */
const Logo: FC = () => {
  const dispatch = useDispatch();
  const GUIState = useSelector((state: RootState) => state.GUI);
  const logoImage = GUIState.logoImage;
  const isEnterGame = GUIState.isEnterGame;
  const isShowLogo = GUIState.isShowLogo;
  const currentLogoIndex = useValue(-1);
  const currentTimeOutId = useValue<any>(-1);
  const animationDuration = 5000;

  const nextImg = () => {
    clearTimeout(currentTimeOutId.value);
    if (currentLogoIndex.value < logoImage.length - 1) {
      currentLogoIndex.set(currentLogoIndex.value + 1);
      currentTimeOutId.set(setTimeout(nextImg, animationDuration));
    } else {
      currentLogoIndex.set(-1);
      dispatch(setVisibility({ component: 'isShowLogo', visibility: false }));
    }
  };

  useEffect(() => {
    if (isEnterGame && isShowLogo && logoImage.length > 0) {
      /**
       * 启动 Enter Logo
       */
      currentLogoIndex.set(0);
      currentTimeOutId.set(setTimeout(nextImg, animationDuration));
    }
  }, [isEnterGame, isShowLogo]);

  useEffect(() => {
    if (!isShowLogo) {
      clearTimeout(currentTimeOutId.value);
      currentLogoIndex.set(-1);
    }
  }, [isShowLogo]);

  const currentLogoUrl = currentLogoIndex.value === -1 ? '' : logoImage[currentLogoIndex.value];
  if (!isShowLogo) {
    return null;
  }
  return (
    <>
      {currentLogoIndex.value !== -1 && (
        <div
          key={currentLogoIndex.value + 'wh'}
          className={
            styles.Logo_Back + ' ' + (currentLogoIndex.value === logoImage.length - 1 ? styles.animationActive : '')
          }
          style={{
            animationDuration: `${animationDuration}ms`,
          }}
        />
      )}
      {currentLogoUrl !== '' && (
        <div
          className={styles.Logo_main}
          key={currentLogoIndex.value + 'bg'}
          onClick={nextImg}
          style={{ backgroundImage: `url("${currentLogoUrl}")`, animationDuration: `${animationDuration}ms` }}
        />
      )}
    </>
  );
};

export default Logo;
