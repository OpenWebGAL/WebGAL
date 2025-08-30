import styles from './textbox.module.scss';
import React, { ReactNode, useEffect, useRef, useState } from 'react';
import { WebGAL } from '@/Core/WebGAL';
import { ITextboxProps } from './types';
import useApplyStyle from '@/hooks/useApplyStyle';
import { css } from '@emotion/css';
import { textSize } from '@/store/userDataInterface';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { useDelayedVisibility } from '@/hooks/useDelayedVisibility';

export default function IMSSTextbox(props: ITextboxProps) {
  const {
    textArray,
    textDelay,
    currentConcatDialogPrev,
    currentDialogKey,
    isText,
    isSafari,
    isFirefox: boolean,
    miniAvatar,
    isHasName,
    showName,
    font,
    textDuration,
    isUseStroke,
    textboxOpacity,
    textSizeState,
  } = props;

  const applyStyle = useApplyStyle('Stage/TextBox/textbox.scss');

  const GUIState = useSelector((state: RootState) => state.GUI);
  const userData = useSelector((state: RootState) => state.userData);
  const stageState = useSelector((state: RootState) => state.stage);

  // 文本框延迟退场
  const delayedShowTextbox = useDelayedVisibility(
    GUIState.showTextBox && isText && !stageState.isDisableTextbox && stageState.enableFilm === '',
  );

  useEffect(() => {
    function settleText() {
      const textElements = document.querySelectorAll('.text_start');
      const textArray = [...textElements];
      textArray.forEach((e) => {
        e.className = applyStyle('textbox_text_display_settled', styles.textbox_text_display_settled);
      });
    }

    WebGAL.events.textSettle.on(settleText);
    return () => {
      WebGAL.events.textSettle.off(settleText);
    };
  }, []);

  // 字号 class name
  const getFontSizeClassName = (textSizeState: textSize) => {
    switch (textSizeState) {
      case textSize.small:
        return applyStyle('textbox_text_small', styles.textbox_text_small);
      case textSize.medium:
        return applyStyle('textbox_text_medium', styles.textbox_text_medium);
      case textSize.large:
        return applyStyle('textbox_text_large', styles.textbox_text_large);
    }
  };
  const [fontSizeClassName, setFontSizeClassName] = useState(getFontSizeClassName(userData.optionData.textSize));
  useEffect(() => {
    let currentTextSizeState = props.textSizeState;
    if (currentTextSizeState === textSize.default) {
      currentTextSizeState = userData.optionData.textSize;
    }
    setFontSizeClassName(getFontSizeClassName(currentTextSizeState));
  }, [textSizeState, userData.optionData.textSize]);

  let allTextIndex = 0;
  const nameElementList = showName.map((line, index) => {
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
      const styleClassName = ' ' + css(style, { label: 'showname' });
      const styleAllText = ' ' + css(style_alltext, { label: 'showname' });
      return (
        <div
          key={index}
          className={applyStyle('textbox_name', styles.textbox_name)}
          style={{
            fontFamily: font,
          }}
        >
          {isUseStroke && (
            <div className={applyStyle('textbox_name_bellow', styles.textbox_name_bellow) + styleAllText}>{e}</div>
          )}
          <div className={applyStyle('textbox_name_above', styles.textbox_name_above) + styleClassName + styleAllText}>
            {e}
          </div>
        </div>
      );
    });
    return (
      <div
        className={applyStyle('textbox_name_line', styles.textbox_name_line)}
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
          <div
            id={`${delay}`}
            className={`${applyStyle('textbox_text', styles.textbox_text)} ${fontSizeClassName}`}
            style={{
              fontFamily: font,
            }}
            key={currentDialogKey + index}
          >
            <div className={applyStyle('textbox_text_display_settled', styles.textbox_text_display_settled)}>
              {isUseStroke && (
                <div className={applyStyle('textbox_text_bellow', styles.textbox_text_bellow) + styleAllText}>{e}</div>
              )}
              <div
                className={applyStyle('textbox_text_above', styles.textbox_text_above) + styleClassName + styleAllText}
              >
                {e}
              </div>
            </div>
          </div>
        );
      }
      return (
        <div
          id={`${delay}`}
          className={`${applyStyle('textbox_text', styles.textbox_text)} ${fontSizeClassName}`}
          style={{
            fontFamily: font,
          }}
          key={currentDialogKey + index}
        >
          <div
            className={applyStyle('textbox_text_display', styles.textbox_text_display) + ' text_start'}
            style={{
              ['--textbox-text-display-delay' as any]: `${delay}ms`,
              ['--textbox-text-display-duration' as any]: `${textDuration}ms`,
            }}
          >
            {isUseStroke && (
              <div className={applyStyle('textbox_text_bellow', styles.textbox_text_bellow) + styleAllText}>{e}</div>
            )}
            <div
              className={applyStyle('textbox_text_above', styles.textbox_text_above) + styleClassName + styleAllText}
            >
              {e}
            </div>
          </div>
        </div>
      );
    });
    return (
      <div
        className={applyStyle('textbox_text_line', styles.textbox_text_line)}
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

  return (
    <>
      {delayedShowTextbox && (
        <div
          id="textBoxMain"
          className={
            applyStyle('textbox_main', styles.textbox_main) +
            ' ' +
            (GUIState.showTextBox && isText && !stageState.isDisableTextbox && stageState.enableFilm === ''
              ? ''
              : applyStyle('textbox_main_hide', styles.textbox_main_hide))
          }
          style={{
            ['--ui-transition-duration' as any]: `${userData.optionData.uiTransitionDuration}ms`,
            ['--textbox-background-opacity' as any]: textboxOpacity / 100,
            ['--textbox-has-name' as any]: isHasName ? 1 : 0,
            ['--textbox-has-avatar' as any]: miniAvatar !== '' ? 1 : 0,
          }}
        >
          {miniAvatar !== '' && (
            <div className={applyStyle('textbox_mini_avatar', styles.textbox_mini_avatar)}>
              <img
                src={miniAvatar}
                alt="Mini Avatar"
                className={applyStyle('textbox_mini_avatar_image', styles.textbox_mini_avatar_image)}
              />
            </div>
          )}
          <div className={applyStyle('textbox_dialog', styles.textbox_dialog)}>
            {isHasName && (
              <div className={applyStyle('textbox_name_container', styles.textbox_name_container)}>
                {nameElementList}
              </div>
            )}
            <div className={applyStyle('textbox_text_container', styles.textbox_text_container)}>{textElementList}</div>
          </div>
        </div>
      )}
    </>
  );
}
