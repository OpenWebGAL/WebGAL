import styles from './textPreview.module.scss';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { useFontFamily } from '@/hooks/useFontFamily';
import { useTextAnimationDuration, useTextDelay } from '@/hooks/useTextOptions';
import useTrans from '@/hooks/useTrans';
import { getTextSize } from '@/UI/getTextSize';
import StandardTextbox from '@/Stage/TextBox/themes/standard/StandardTextbox';
import IMSSTextbox from '@/Stage/TextBox/themes/imss/IMSSTextbox';
import { ReactNode } from 'react';

export const TextPreview = (props: any) => {
  const t = useTrans('menu.options.pages.display.options.');
  const theme = useSelector((state: RootState) => state.GUI.theme);
  const userDataState = useSelector((state: RootState) => state.userData);
  const stageState = useSelector((state: RootState) => state.stage);
  const previewBackground = stageState.bgName;
  const textDelay = useTextDelay(userDataState.optionData.textSpeed);
  const textDuration = useTextAnimationDuration(userDataState.optionData.textSpeed);
  const previewText = t('textPreview.text');
  const size = getTextSize(userDataState.optionData.textSize) + '%';
  const textboxOpacity = userDataState.optionData.textboxOpacity;
  const font = useFontFamily();

  const userAgent = navigator.userAgent;
  const isFirefox = /firefox/i.test(userAgent);
  const isSafari = /^((?!chrome|android).)*safari/i.test(userAgent);

  const previewTextArray: ReactNode[] = previewText.split('').map((e, i) => <span key={e}>{e}</span>);

  const textboxs = new Map([
    ['standard', StandardTextbox],
    ['imss', IMSSTextbox],
  ]);

  const Textbox = textboxs.get(theme.textbox) || StandardTextbox;

  const textboxProps = {
    textArray: previewTextArray,
    isText: true,
    textDelay: textDelay,
    showName: t('textPreview.title'),
    currentConcatDialogPrev: '',
    fontSize: size,
    currentDialogKey: '',
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
    >
      <div key={`previewTextbox-${textDelay}`} className={styles.textbox}>
        <Textbox {...textboxProps} />
      </div>
    </div>
  );
};
