import styles from './textPreview.module.scss';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { useFontFamily } from '@/hooks/useFontFamily';
import { useTextAnimationDuration, useTextDelay } from '@/hooks/useTextOptions';
import useTrans from '@/hooks/useTrans';
import { getTextSize } from '@/UI/getTextSize';
import IMSSTextbox from '@/Stage/TextBox/IMSSTextbox';
import { compileSentence } from '@/Stage/TextBox/TextBox';
import { useState } from 'react';

export const TextPreview = (props: any) => {
  const t = useTrans('menu.options.pages.display.options.');
  const userDataState = useSelector((state: RootState) => state.userData);
  const stageState = useSelector((state: RootState) => state.stage);
  const previewBackground = stageState.bgName;
  const textDelay = useTextDelay(userDataState.optionData.textSpeed);
  const textDuration = useTextAnimationDuration(userDataState.optionData.textSpeed);
  const textboxOpacity = userDataState.optionData.textboxOpacity;
  const size = getTextSize(userDataState.optionData.textSize) + '%';
  const font = useFontFamily();
  const userAgent = navigator.userAgent;
  const isFirefox = /firefox/i.test(userAgent);
  const isSafari = /^((?!chrome|android).)*safari/i.test(userAgent);
  const previewText = t('textPreview.text');
  const previewTextArray = compileSentence(previewText, 3);
  const showNameText = t('textPreview.title');
  const showNameArray = compileSentence(showNameText, 3);
  const isHasName = showNameText !== '';

  const Textbox = IMSSTextbox;

  const [previewKey, setPreviewKey] = useState<number>(0);

  const forcePreviewUpdate = () => {
    setPreviewKey((prevKey) => prevKey + 1);
  };

  const textboxProps = {
    textArray: previewTextArray,
    isText: true,
    textDelay: textDelay,
    isHasName: isHasName,
    showName: showNameArray,
    currentConcatDialogPrev: '',
    fontSize: size,
    currentDialogKey: String(previewKey),
    isSafari: isSafari,
    isFirefox: isFirefox,
    miniAvatar: '',
    textDuration: textDuration,
    font: font,
    textSizeState: size as unknown as number,
    lineLimit: 3,
    isUseStroke: true,
    textboxOpacity: textboxOpacity,
  };

  return (
    <div
      className={styles.textPreviewMain}
      style={{
        background: previewBackground ? `bottom / cover no-repeat url(${previewBackground})` : 'rgba(0, 0, 0, 0.1)',
      }}
      onClick={forcePreviewUpdate}
    >
      <div key={`previewTextbox-${textDelay}`} className={styles.textbox}>
        <Textbox {...textboxProps} />
      </div>
    </div>
  );
};
