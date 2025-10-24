import styles from './textPreview.module.scss';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { useFontFamily } from '@/hooks/useFontFamily';
import { useTextAnimationDuration, useTextDelay } from '@/hooks/useTextOptions';
import useTrans from '@/hooks/useTrans';
import IMSSTextbox from '@/Stage/TextBox/IMSSTextbox';
import { compileSentence } from '@/Stage/TextBox/TextBox';
import { useState } from 'react';
import useApplyStyle from '@/hooks/useApplyStyle';
import { ITextboxProps } from '@/Stage/TextBox/types';
import { TextBoxFilm } from '@/Stage/TextBox/TextBoxFilm';

export const TextPreview = (props: any) => {
  const t = useTrans('menu.options.pages.display.options.');
  const userDataState = useSelector((state: RootState) => state.userData);
  const stageState = useSelector((state: RootState) => state.stage);
  const previewBackground = stageState.bgName;
  const textDelay = useTextDelay(userDataState.optionData.textSpeed);
  const textDuration = useTextAnimationDuration(userDataState.optionData.textSpeed);
  const textboxOpacity = userDataState.optionData.textboxOpacity;
  const size = userDataState.optionData.textSize;
  const font = useFontFamily();
  const userAgent = navigator.userAgent;
  const isFirefox = /firefox/i.test(userAgent);
  const isSafari = /^((?!chrome|android).)*safari/i.test(userAgent);
  const previewText = t('textPreview.text');
  const previewTextArray = compileSentence(previewText);
  const showNameText = t('textPreview.title');
  const showNameArray = compileSentence(showNameText);
  const isHasName = showNameText !== '';

  const Textbox = IMSSTextbox;

  const [previewKey, setPreviewKey] = useState<number>(0);

  const applyStyle = useApplyStyle('UI/Menu/Options/textPreview.scss');

  const forcePreviewUpdate = () => {
    setPreviewKey((prevKey) => prevKey + 1);
  };

  const textboxProps: ITextboxProps = {
    textArray: previewTextArray,
    isText: true,
    textDelay: textDelay,
    isHasName: isHasName,
    showName: showNameArray,
    currentConcatDialogPrev: '',
    currentDialogKey: String(previewKey),
    isSafari: isSafari,
    isFirefox: isFirefox,
    miniAvatar: '',
    textDuration: textDuration,
    font: font,
    textSizeState: size as unknown as number,
    isUseStroke: true,
    textboxOpacity: textboxOpacity,
  };

  return (
    <div
      className={applyStyle('options_text_preview_main', styles.options_text_preview_main)}
      style={{
        background: previewBackground ? `bottom / cover no-repeat url(${previewBackground})` : 'rgba(0, 0, 0, 0.1)',
      }}
      onClick={forcePreviewUpdate}
    >
      <div
        key={`previewTextbox-${textDelay}`}
        className={applyStyle('options_text_preview_textbox', styles.options_text_preview_textbox)}
      >
        {stageState.enableFilm === '' && <Textbox {...textboxProps} />}
        {stageState.enableFilm !== '' && <TextBoxFilm />}
      </div>
    </div>
  );
};
