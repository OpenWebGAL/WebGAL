import { FC } from 'react';
import styles from './logo.module.scss';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
/**
 * 标识
 * @constructor
 */
const Logo: FC = () => {
  const GUIState = useSelector((state: RootState) => state.GUI);
  const logoImage = GUIState.logoImage;
  const logoList = logoImage.split(' ');

  const logo = logoList.map((logo, index) => (
    <li
      key={index}
      className={styles.Logo_main}
      style={{
        backgroundImage: `url("${logo}")`,
        animationDelay: `${index * 1.5}s`,
      }}
    />
  ));

  return (
    <>
      {GUIState.showTitle && (
        <div id="logo_target" className={styles.Logo_target}>
          <ul>{logo}</ul>
        </div>
      )}
    </>
  );
};

export default Logo;
