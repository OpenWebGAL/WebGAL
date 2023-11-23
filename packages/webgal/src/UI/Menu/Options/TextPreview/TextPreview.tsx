import styles from './textPreview.module.scss';
import textStyle from '../../../../Stage/TextBox/textbox.module.scss';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { useFontFamily } from '@/hooks/useFontFamily';
import { useTextAnimationDuration, useTextDelay } from '@/hooks/useTextOptions';
import useTrans from '@/hooks/useTrans';
import { getTextSize } from '@/UI/getTextSize';

export const TextPreview = (props: any) => {
  const userDataState = useSelector((state: RootState) => state.userData);
  const textDelay = useTextDelay(userDataState.optionData.textSpeed);
  const textDuration = useTextAnimationDuration(userDataState.optionData.textSpeed);
  const t = useTrans('menu.options.pages.display.options.textPreview.');
  const previewText = t('text');
  const size = getTextSize(userDataState.optionData.textSize) + '%';
  const font = useFontFamily();

  let classNameText = styles.singleText;
  const previewTextArray = previewText.split('').map((e, i) => (
    <span
      id={textDelay + 'text' + i}
      style={{
        fontSize: size,
        animationDelay: String(i * textDelay) + 'ms',
        fontFamily: font,
        position: 'relative',
        animationDuration: `${textDuration}ms`,
      }}
      className={classNameText}
      key={e + i + userDataState.optionData.textSpeed}
    >
      <span className={textStyle.zhanwei}>
        {e}
        <span className={textStyle.outer}>{e}</span>
        <span className={textStyle.inner}>{e}</span>
      </span>
    </span>
  ));
  return <div className={styles.textPreviewMain}>{previewTextArray}</div>;
};
