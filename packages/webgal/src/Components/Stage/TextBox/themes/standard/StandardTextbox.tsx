import styles from './standard.module.scss';
import { textSize } from '@/store/userDataInterface';
import { useEffect } from 'react';
import { WebGAL } from '@/Core/WebGAL';

export interface ITextboxProps {
  textArray: string[];
  textDelay: number;
  currentConcatDialogPrev: string;
  currentDialogKey: string;
  isText: boolean;
  isSafari: boolean;
  fontSize: string;
  miniAvatar: string;
  showName: string;
  font: string;
  textDuration: number;
  textSizeState: number;
}

export default function StandardTextbox(props: ITextboxProps) {
  const {
    textArray,
    textDelay,
    currentConcatDialogPrev,
    currentDialogKey,
    isText,
    isSafari,
    fontSize,
    miniAvatar,
    showName,
    font,
    textDuration,
    textSizeState,
  } = props;

  const isHasMiniAvatar = miniAvatar !== '';

  useEffect(() => {
    function settleText() {
      const textElements = document.querySelectorAll('.Textelement_start');
      const textArray = [...textElements];
      textArray.forEach((e) => {
        e.className = styles.TextBox_textElement_Settled;
      });
    }
    WebGAL.eventBus.on('text-settle', settleText);
    return () => {
      WebGAL.eventBus.off('text-settle', settleText);
    };
  }, []);

  const textElementList = textArray.map((e, index) => {
    if (e === '<br />') {
      return <br key={`br${index}`} />;
    }
    let delay = index * textDelay;
    let prevLength = currentConcatDialogPrev.length;
    if (currentConcatDialogPrev !== '' && index >= prevLength) {
      delay = delay - prevLength * textDelay;
    }
    if (index < prevLength) {
      return (
        <span
          data-text={e}
          id={`${delay}`}
          className={styles.TextBox_textElement_Settled}
          key={currentDialogKey + index}
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
        className={`${styles.TextBox_textElement_start} Textelement_start`}
        key={currentDialogKey + index}
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

  const padding = isHasMiniAvatar ? 500 : undefined;
  const isHasName = showName !== '';
  let paddingTop = isHasName ? undefined : 15;
  if (textSizeState === textSize.small && !isHasName) {
    paddingTop = 35;
  }

  return (
    <>
      {isText && (
        <div
          id="textBoxMain"
          className={styles.TextBox_main}
          style={{ fontFamily: font, paddingLeft: padding, paddingTop }}
        >
          {/* <div className={styles.nameContainer}>{stageState.showName !== ''}</div> */}
          <div id="miniAvatar" className={styles.miniAvatarContainer}>
            {miniAvatar !== '' && <img className={styles.miniAvatarImg} alt="miniAvatar" src={miniAvatar} />}
          </div>
          {showName !== '' && (
            <div key={showName} className={styles.TextBox_showName} style={{ fontSize: '170%', left: padding }}>
              {showName.split('').map((e, i) => {
                return (
                  <span key={e + i} style={{ position: 'relative' }}>
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
          <div
            className={styles.text}
            style={{
              fontSize,
              wordBreak: isSafari ? 'break-word' : undefined,
              overflow: 'hidden',
              paddingLeft: '0.1em',
            }}
          >
            {textElementList}
          </div>
        </div>
      )}
    </>
  );
}
