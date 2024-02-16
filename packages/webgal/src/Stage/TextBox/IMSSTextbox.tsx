import styles from './textbox.module.scss';
import { ReactNode, useEffect } from 'react';
import { WebGAL } from '@/Core/WebGAL';
import { ITextboxProps } from './types';
import useApplyStyle from '@/hooks/useApplyStyle';

export default function IMSSTextbox(props: ITextboxProps) {
  const {
    textArray,
    textDelay,
    currentConcatDialogPrev,
    currentDialogKey,
    isText,
    isSafari,
    isFirefox: boolean,
    fontSize,
    miniAvatar,
    showName,
    font,
    textDuration,
    isUseStroke,
    textboxOpacity,
  } = props;

  const applyStyle = useApplyStyle('Stage/TextBox/textbox.scss');

  useEffect(() => {
    function settleText() {
      const textElements = document.querySelectorAll('.Textelement_start');
      const textArray = [...textElements];
      textArray.forEach((e) => {
        e.className = applyStyle('TextBox_textElement_Settled', styles.TextBox_textElement_Settled);
      });
    }
    WebGAL.events.textSettle.on(settleText);
    return () => {
      WebGAL.events.textSettle.off(settleText);
    };
  }, []);

  const textElementList = textArray.map((e, index) => {
    // if (e === '<br />') {
    //   return <br key={`br${index}`} />;
    // }
    let delay = index * textDelay;
    let prevLength = currentConcatDialogPrev.length;
    if (currentConcatDialogPrev !== '' && index >= prevLength) {
      delay = delay - prevLength * textDelay;
    }
    if (index < prevLength) {
      return (
        <span
          // data-text={e}
          id={`${delay}`}
          className={applyStyle('TextBox_textElement_Settled', styles.TextBox_textElement_Settled)}
          key={currentDialogKey + index}
          style={{ animationDelay: `${delay}ms`, animationDuration: `${textDuration}ms` }}
        >
          <span className={styles.zhanwei}>
            {e}
            <span className={applyStyle('outer', styles.outer)}>{e}</span>
            {isUseStroke && <span className={applyStyle('inner', styles.inner)}>{e}</span>}
          </span>
        </span>
      );
    }
    return (
      <span
        data-text={e}
        id={`${delay}`}
        className={`${applyStyle('TextBox_textElement_start', styles.TextBox_textElement_start)} Textelement_start`}
        key={currentDialogKey + index}
        style={{ animationDelay: `${delay}ms`, position: 'relative' }}
      >
        <span className={styles.zhanwei}>
          {e}
          <span className={applyStyle('outer', styles.outer)}>{e}</span>
          {isUseStroke && <span className={applyStyle('inner', styles.inner)}>{e}</span>}
        </span>
      </span>
    );
  });
  return (
    <>
      {isText && (
        <div
          id="textBoxMain"
          className={applyStyle('TextBox_main', styles.TextBox_main)}
          style={{
            fontFamily: font,
            left: miniAvatar === '' ? 25 : undefined,
            background: `linear-gradient(
              rgba(245, 247, 250, ${textboxOpacity / 100}) 0%,
              rgba(189, 198, 222, ${textboxOpacity / 100}) 100%
            )`,
          }}
        >
          <div id="miniAvatar" className={applyStyle('miniAvatarContainer', styles.miniAvatarContainer)}>
            {miniAvatar !== '' && (
              <img className={applyStyle('miniAvatarImg', styles.miniAvatarImg)} alt="miniAvatar" src={miniAvatar} />
            )}
          </div>
          {showName !== '' && (
            <div
              key={showName}
              className={applyStyle('TextBox_showName', styles.TextBox_showName)}
              style={{
                fontSize: '200%',
                background: `rgba(11, 52, 110, ${(textboxOpacity / 100) * 0.9})`,
                border: `4px solid rgba(255, 255, 255, ${(textboxOpacity / 100) * 0.75})`,
                boxShadow: `3px 3px 10px rgba(100, 100, 100, ${(textboxOpacity / 100) * 0.5})`,
              }}
            >
              {showName.split('').map((e, i) => {
                return (
                  <span key={e + i} style={{ position: 'relative' }}>
                    <span className={styles.zhanwei}>
                      {e}
                      <span className={applyStyle('outerName', styles.outerName)}>{e}</span>
                      {isUseStroke && <span className={applyStyle('innerName', styles.innerName)}>{e}</span>}
                    </span>
                  </span>
                );
              })}
            </div>
          )}
          <div
            className={applyStyle('text', styles.text)}
            style={{
              fontSize,
              wordBreak: isSafari || props.isFirefox ? 'break-all' : undefined,
              display: isSafari ? 'flex' : undefined,
              flexWrap: isSafari ? 'wrap' : undefined,
              overflow: 'hidden',
              paddingLeft: '0.1em',
              WebkitLineClamp: props.lineLimit,
            }}
          >
            {textElementList}
          </div>
        </div>
      )}
    </>
  );
}
