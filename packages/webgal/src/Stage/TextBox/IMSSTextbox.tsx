import styles from './textbox.module.scss';
import { useEffect } from 'react';
import { WebGAL } from '@/Core/WebGAL';
import { ITextboxProps } from './types';
import useApplyStyle from '@/hooks/useApplyStyle';
import { css } from '@emotion/css';
import { textSize } from '@/store/userDataInterface';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';

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
    isHasName,
    showName,
    font,
    textDuration,
    isUseStroke,
    textboxOpacity,
    textSizeState,
  } = props;

  const applyStyle = useApplyStyle('textbox');

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
  const nameElementList = showName.map((line, index) => {
    const textline = line.map((en, index) => {
      const e = en.reactNode;
      let style = '';
      let tips = '';
      let style_alltext = '';
      let isEnhanced = false;
      if (en.enhancedValue) {
        isEnhanced = true;
        const data = en.enhancedValue;
        for (const dataElem of data) {
          const { key, value } = dataElem;
          switch (key) {
            case 'style':
              style = value;
              break;
            case 'tips':
              tips = value;
              break;
            case 'style-alltext':
              style_alltext = value;
              break;
          }
        }
      }
      const styleClassName = ' ' + css(style, { label: 'showname' });
      const styleAllText = ' ' + css(style_alltext, { label: 'showname' });
      if (isEnhanced) {
        return (
          <span key={index} style={{ position: 'relative' }}>
            <span className={styles.zhanwei + styleAllText}>
              {e}
              <span className={applyStyle('outerName', styles.outerName) + styleClassName + styleAllText}>{e}</span>
              {isUseStroke && <span className={applyStyle('innerName', styles.innerName) + styleAllText}>{e}</span>}
            </span>
          </span>
        );
      }
      return (
        <span key={index} style={{ position: 'relative' }}>
          <span className={styles.zhanwei + styleAllText}>
            {e}
            <span className={applyStyle('outerName', styles.outerName) + styleClassName + styleAllText}>{e}</span>
            {isUseStroke && <span className={applyStyle('innerName', styles.innerName) + styleAllText}>{e}</span>}
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
        {textline}
      </div>
    );
  });
  const textElementList = textArray.map((line, index) => {
    const textLine = line.map((en, index) => {
      const e = en.reactNode;
      let style = '';
      let tips = '';
      let style_alltext = '';
      if (en.enhancedValue) {
        const data = en.enhancedValue;
        for (const dataElem of data) {
          const { key, value } = dataElem;
          switch (key) {
            case 'style':
              style = value;
              break;
            case 'tips':
              tips = value;
              break;
            case 'style-alltext':
              style_alltext = value;
              break;
          }
        }
      }
      // if (e === '<br />') {
      //   return <br key={`br${index}`} />;
      // }
      let delay = allTextIndex * textDelay;
      allTextIndex++;
      let prevLength = currentConcatDialogPrev.length;
      if (currentConcatDialogPrev !== '' && allTextIndex >= prevLength) {
        delay = delay - prevLength * textDelay;
      }
      const styleClassName = ' ' + css(style);
      const styleAllText = ' ' + css(style_alltext);
      if (allTextIndex < prevLength) {
        return (
          <span
            // data-text={e}
            id={`${delay}`}
            className={applyStyle('TextBox_textElement_Settled', styles.TextBox_textElement_Settled)}
            key={currentDialogKey + index}
            style={{ animationDelay: `${delay}ms`, animationDuration: `${textDuration}ms` }}
          >
            <span className={styles.zhanwei + styleAllText}>
              {e}
              <span className={applyStyle('outer', styles.outer) + styleClassName + styleAllText}>{e}</span>
              {isUseStroke && <span className={applyStyle('inner', styles.inner) + styleAllText}>{e}</span>}
            </span>
          </span>
        );
      }
      return (
        <span
          // data-text={e}
          id={`${delay}`}
          className={`${applyStyle('TextBox_textElement_start', styles.TextBox_textElement_start)} Textelement_start`}
          key={currentDialogKey + index}
          style={{ animationDelay: `${delay}ms`, position: 'relative' }}
        >
          <span className={styles.zhanwei + styleAllText}>
            {e}
            <span className={applyStyle('outer', styles.outer) + styleClassName + styleAllText}>{e}</span>
            {isUseStroke && <span className={applyStyle('inner', styles.inner) + styleAllText}>{e}</span>}
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

  const userDataState = useSelector((state: RootState) => state.userData);
  const lineHeightValue = textSizeState === textSize.medium ? 2.2 : 2;
  const textLineHeight = userDataState.globalGameVar.Line_height;
  const finalTextLineHeight = textLineHeight ? Number(textLineHeight) : lineHeightValue;
  const lineHeightCssStr = `line-height: ${finalTextLineHeight}em`;
  const lhCss = css(lineHeightCssStr);

  return (
    <>
      {isText && (
        <div className={styles.TextBox_Container}>
          <div
            className={
              applyStyle('TextBox_main', styles.TextBox_main) +
              ' ' +
              applyStyle('TextBox_Background', styles.TextBox_Background) +
              ' ' +
              (miniAvatar === ''
                ? applyStyle('TextBox_main_miniavatarOff', styles.TextBox_main_miniavatarOff)
                : undefined)
            }
            style={{
              opacity: `${textboxOpacity / 100}`,
            }}
          />
          <div
            id="textBoxMain"
            className={
              applyStyle('TextBox_main', styles.TextBox_main) +
              ' ' +
              (miniAvatar === ''
                ? applyStyle('TextBox_main_miniavatarOff', styles.TextBox_main_miniavatarOff)
                : undefined)
            }
            style={{
              fontFamily: font,
            }}
          >
            <div id="miniAvatar" className={applyStyle('miniAvatarContainer', styles.miniAvatarContainer)}>
              {miniAvatar !== '' && (
                <img className={applyStyle('miniAvatarImg', styles.miniAvatarImg)} alt="miniAvatar" src={miniAvatar} />
              )}
            </div>
            {isHasName && (
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
                  <span style={{ opacity: 0 }}>{nameElementList}</span>
                </div>
                <div
                  className={applyStyle('TextBox_showName', styles.TextBox_showName)}
                  style={{
                    fontSize: '200%',
                  }}
                >
                  {nameElementList}
                </div>
              </>
            )}
            <div
              className={`${lhCss} ${applyStyle('text', styles.text)}`}
              style={{
                fontSize,
                flexFlow: 'column',
                overflow: 'hidden',
                paddingLeft: '0.1em',
                // lineHeight: textSizeState === textSize.medium ? '2.2em' : '2em', // 不加的话上半拼音可能会被截断，同时保持排版整齐
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
