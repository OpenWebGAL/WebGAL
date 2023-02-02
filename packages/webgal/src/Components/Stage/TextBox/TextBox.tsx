import styles from './textbox.module.scss';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { PERFORM_CONFIG } from '@/Core/config/performConfig';
import { useFontFamily } from '@/hooks/useFontFamily';
import { useTextAnimationDuration, useTextDelay } from '@/hooks/useTextOptions';

export const TextBox = () => {
  const stageState = useSelector((state: RootState) => state.stage);
  const userDataState = useSelector((state: RootState) => state.userData);
  useEffect(() => {});
  const textDelay = useTextDelay(userDataState.optionData.textSpeed);
  const textDuration = useTextAnimationDuration(userDataState.optionData.textSpeed);
  const size = userDataState.optionData.textSize * 40 + 200 + '%';
  const font = useFontFamily();

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
          data-text={e}
          id={`${delay}`}
          className={styles.TextBox_textElement_Settled}
          key={stageState.currentDialogKey + index}
          style={{ animationDelay: `${delay}ms`, animationDuration: `${textDuration}ms` }}
        >
          <span className={styles.zhanwei}>
            {e}
            <span className={styles.outer}>{e}</span>
            <span className={styles.inner}>{e}</span>
          </span>
        </span>
      );
    }
    return (
      <span
        data-text={e}
        id={`${delay}`}
        className={styles.TextBox_textElement_start}
        key={stageState.currentDialogKey + index}
        style={{ animationDelay: `${delay}ms`, position: 'relative' }}
      >
        <span className={styles.zhanwei}>
          {e}
          <span className={styles.outer}>{e}</span>
          <span className={styles.inner}>{e}</span>
        </span>
      </span>
    );
  });
  return (
    <div id="textBoxMain" className={styles.TextBox_main} style={{ fontFamily: font }}>
      <div id="miniAvatar" className={styles.miniAvatarContainer}>
        {stageState.miniAvatar !== '' && (
          <img className={styles.miniAvatarImg} alt="miniAvatar" src={stageState.miniAvatar} />
        )}
      </div>
      {stageState.showName !== '' && (
        <div className={styles.TextBox_showName} style={{ fontSize: '200%' }}>
          {stageState.showName.split('').map((e) => {
            return (
              <span key={e} style={{ position: 'relative' }}>
                <span className={styles.zhanwei}>
                  {e}
                  <span className={styles.outer}>{e}</span>
                  <span className={styles.inner}>{e}</span>
                </span>
              </span>
            );
          })}
        </div>
      )}
      <div style={{ fontSize: size, wordBreak: 'break-word' }}>{textElementList}</div>
    </div>
  );
};
