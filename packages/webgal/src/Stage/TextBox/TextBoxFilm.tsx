import styles from './textboxFilm.module.scss';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import useApplyStyle from '@/hooks/useApplyStyle';
import { useTextAnimationDuration, useTextDelay } from '@/hooks/useTextOptions';
import { WebGAL } from '@/Core/WebGAL';
import { useDelayedVisibility } from '@/hooks/useDelayedVisibility';
import { textSize } from '@/store/userDataInterface';
import { useFontFamily } from '@/hooks/useFontFamily';

export const TextBoxFilm = () => {
  const stageState = useSelector((state: RootState) => state.stage);
  const GUIState = useSelector((state: RootState) => state.GUI);
  const userDataState = useSelector((state: RootState) => state.userData);
  useEffect(() => {});
  const textDelay = useTextDelay(userDataState.optionData.textSpeed);
  const textDuration = useTextAnimationDuration(userDataState.optionData.textSpeed);
  const applyStyle = useApplyStyle('Stage/TextBox/textboxFilm.scss');

  // 字号 class name
  const getFontSizeClassName = (textSizeState: textSize) => {
    switch (textSizeState) {
      case textSize.small:
        return applyStyle('textbox_film_text_small', styles.textbox_film_text_small);
      case textSize.medium:
        return applyStyle('textbox_film_text_medium', styles.textbox_film_text_medium);
      case textSize.large:
        return applyStyle('textbox_film_text_large', styles.textbox_film_text_large);
    }
  };
  const [fontSizeClassName, setFontSizeClassName] = useState(getFontSizeClassName(userDataState.optionData.textSize));
  useEffect(() => {
    setFontSizeClassName(getFontSizeClassName(userDataState.optionData.textSize));
  }, [userDataState.optionData.textSize]);

  const font = useFontFamily();

  const [isText, setIsText] = useState(stageState.showName !== '' || stageState.showText !== '');
  useEffect(() => {
    setIsText(stageState.showName !== '' || stageState.showText !== '');
  }, [stageState.showName, stageState.showText]);

  useEffect(() => {
    function settleText() {
      const textElements = document.querySelectorAll('.text_start');
      const textArray = [...textElements];
      textArray.forEach((e) => {
        e.className = applyStyle('textbox_film_text_element_settled', styles.textbox_film_text_element_settled);
      });
    }

    WebGAL.events.textSettle.on(settleText);
    return () => {
      WebGAL.events.textSettle.off(settleText);
    };
  }, []);

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
        <div
          id={`${delay}`}
          className={`${applyStyle('textbox_film_text', styles.textbox_film_text)} ${fontSizeClassName}`}
          style={{ fontFamily: font }}
          key={stageState.currentDialogKey + index}
        >
          <div className={applyStyle('textbox_film_text_element_settled', styles.textbox_film_text_element_settled)}>
            {e}
          </div>
        </div>
      );
    }
    return (
      <div
        id={`${delay}`}
        className={`${applyStyle('textbox_film_text', styles.textbox_film_text)} ${fontSizeClassName}`}
        style={{ fontFamily: font }}
        key={stageState.currentDialogKey + index}
      >
        <div
          className={applyStyle('textbox_film_text_display', styles.textbox_film_text_display) + ' text_start'}
          style={{
            ['--textbox-text-display-delay' as any]: `${delay}ms`,
            ['--textbox-text-display-duration' as any]: `${textDuration}ms`,
          }}
        >
          {e}
        </div>
      </div>
    );
  });

  const delayedShowTextbox = useDelayedVisibility(
    GUIState.showTextBox && isText && !stageState.isDisableTextbox && stageState.enableFilm !== '',
  );

  return (
    <>
      {delayedShowTextbox && (
        <div
          id="textBoxMain"
          className={
            applyStyle('textbox_film_main', styles.textbox_film_main) +
            ' ' +
            (GUIState.showTextBox && isText && !stageState.isDisableTextbox && stageState.enableFilm !== ''
              ? ''
              : applyStyle('textbox_film_main_hide', styles.textbox_film_main_hide))
          }
          style={{
            ['--ui-transition-duration' as any]: `${userDataState.optionData.uiTransitionDuration}ms`,
          }}
        >
          <div className={applyStyle('textbox_film_text_container', styles.textbox_film_text_container)}>
            {textElementList}
          </div>
        </div>
      )}
    </>
  );
};
