import styles from './textboxFilm.module.scss';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';

import { PERFORM_CONFIG } from '@/config';

export const TextBoxFilm = () => {
  const stageState = useSelector((state: RootState) => state.stage);
  const userDataState = useSelector((state: RootState) => state.userData);
  useEffect(() => {});
  const textDelay = PERFORM_CONFIG.textInitialDelay - 20 * userDataState.optionData.textSpeed;
  const size = userDataState.optionData.textSize * 50 + 200 + '%';

  // 拆字
  const textArray: Array<string> = stageState.showText.split('');
  const textElementList = textArray.map((e, index) => {
    let delay = index * textDelay;
    let prevLength = stageState.currentConcatDialogPrev.length;
    if (stageState.currentConcatDialogPrev !== '' && index >= prevLength) {
      delay = delay - prevLength * textDelay;
    }
    if (index < prevLength) {
      return (
        <span
          id={`${delay}`}
          className={styles.TextBox_textElement_Settled}
          key={stageState.currentDialogKey + index}
          style={{ animationDelay: `${delay}ms` }}
        >
          {e}
        </span>
      );
    }
    return (
      <span
        id={`${delay}`}
        className={styles.TextBox_textElement_start}
        key={stageState.currentDialogKey + index}
        style={{ animationDelay: `${delay}ms` }}
      >
        {e}
      </span>
    );
  });
  return (
    <div id="textBoxMain" className={styles.TextBox_main}>
      {/* <div id="miniAvatar" className={styles.miniAvatarContainer}> */}
      {/*   {stageState.miniAvatar !== '' && */}
      {/*     <img className={styles.miniAvatarImg} alt="miniAvatar" src={stageState.miniAvatar}/>} */}
      {/* </div> */}
      {/* {stageState.showName !== '' && */}
      {/*   <div className={styles.TextBox_showName} style={{fontSize: '200%'}}>{stageState.showName}</div>} */}
      <div style={{ fontSize: size }}>{textElementList}</div>
    </div>
  );
};
