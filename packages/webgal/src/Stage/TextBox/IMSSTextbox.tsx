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

  let allTextIndex = 0;
  const textElementList = textArray.map((line, index) => {
    const textLine = line.map((e, index) => {
      // if (e === '<br />') {
      //   return <br key={`br${index}`} />;
      // }
      let delay = allTextIndex * textDelay;
      allTextIndex++;
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
      <div
        style={{
          wordBreak: isSafari || props.isFirefox ? 'break-all' : undefined,
          display: isSafari ? 'flex' : undefined,
          flexWrap: isSafari ? 'wrap' : undefined,
        }}
        key={`text-line-${index}`}
      >
        {textLine}
      </div>
    );
  });

  console.log(`${textboxOpacity / 100}`);

  return (
    <>
      {isText && (
        <div className={styles.TextBox_Container}>
          <div
            className={
              applyStyle('TextBox_main', styles.TextBox_main) +
              ' ' +
              applyStyle('TextBox_Background', styles.TextBox_Background)
            }
            style={{
              opacity: `${textboxOpacity / 100}`,
              left: miniAvatar === '' ? 25 : undefined,
            }}
          />
          <div
            id="textBoxMain"
            className={applyStyle('TextBox_main', styles.TextBox_main)}
            style={{
              fontFamily: font,
              left: miniAvatar === '' ? 25 : undefined,
            }}
          >
            <div id="miniAvatar" className={applyStyle('miniAvatarContainer', styles.miniAvatarContainer)}>
              {miniAvatar !== '' && (
                <img className={applyStyle('miniAvatarImg', styles.miniAvatarImg)} alt="miniAvatar" src={miniAvatar} />
              )}
            </div>
            {showName !== '' && (
              <>
                <div
                  className={
                    applyStyle('TextBox_showName', styles.TextBox_showName) +
                    ' ' +
                    applyStyle('TextBox_ShowName_Background', styles.TextBox_ShowName_Background)
                  }
                  style={{
                    opacity: `${textboxOpacity / 100}`,
                    fontSize: '200%',
                  }}
                >
                  <div style={{ opacity: 0 }}>
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
                </div>
                <div
                  key={showName}
                  className={applyStyle('TextBox_showName', styles.TextBox_showName)}
                  style={{
                    fontSize: '200%',
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
              </>
            )}
            <div
              className={applyStyle('text', styles.text)}
              style={{
                fontSize,
                flexFlow: 'column',
                overflow: 'hidden',
                paddingLeft: '0.1em',
              }}
            >
              {textElementList}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
