import styles from '@/Components/UI/Menu/Options/options.module.scss';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { NormalOption } from '@/Components/UI/Menu/Options/NormalOption';
import { NormalButton } from '@/Components/UI/Menu/Options/NormalButton';
import { setOptionData } from '@/store/userDataReducer';
import { playSpeed, textFont, textSize } from '@/store/userDataInterface';
import { setStorage } from '@/Core/controller/storage/storageController';
import { TextPreview } from '@/Components/UI/Menu/Options/TextPreview/TextPreview';
import useTrans from '@/hooks/useTrans';

export function Display() {
  const userDataState = useSelector((state: RootState) => state.userData);
  const dispatch = useDispatch();
  const t = useTrans('menu.options.pages.display.options.');

  return (
    <div className={styles.Options_main_content_half}>
      <NormalOption key="option0" title={t('textSpeed.title')}>
        <NormalButton
          textList={t('textSpeed.options.slow', 'textSpeed.options.medium', 'textSpeed.options.fast')}
          functionList={[
            () => {
              dispatch(setOptionData({ key: 'textSpeed', value: playSpeed.slow }));
              setStorage();
            },
            () => {
              dispatch(setOptionData({ key: 'textSpeed', value: playSpeed.normal }));
              setStorage();
            },
            () => {
              dispatch(setOptionData({ key: 'textSpeed', value: playSpeed.fast }));
              setStorage();
            },
          ]}
          currentChecked={userDataState.optionData.textSpeed}
        />
      </NormalOption>
      <NormalOption key="option1" title={t('textSize.title')}>
        <NormalButton
          textList={t('textSize.options.small', 'textSize.options.medium', 'textSize.options.large')}
          functionList={[
            () => {
              dispatch(setOptionData({ key: 'textSize', value: textSize.small }));
              setStorage();
            },
            () => {
              dispatch(setOptionData({ key: 'textSize', value: textSize.medium }));
              setStorage();
            },
            () => {
              dispatch(setOptionData({ key: 'textSize', value: textSize.large }));
              setStorage();
            },
          ]}
          currentChecked={userDataState.optionData.textSize}
        />
      </NormalOption>
      <NormalOption key="option2" title={t('textFont.title')}>
        <NormalButton
          textList={t('textFont.options.siYuanSimSun', 'textFont.options.SimHei', 'textFont.options.lxgw')}
          functionList={[
            () => {
              dispatch(setOptionData({ key: 'textboxFont', value: textFont.song }));
              setStorage();
            },
            () => {
              dispatch(setOptionData({ key: 'textboxFont', value: textFont.hei }));
              setStorage();
            },
            () => {
              dispatch(setOptionData({ key: 'textboxFont', value: textFont.lxgw }));
              setStorage();
            },
          ]}
          currentChecked={userDataState.optionData.textboxFont}
        />
      </NormalOption>
      <NormalOption key="option3" title={t('textPreview.title')}>
        {/* 这是一个临时的组件，用于模拟文本预览的效果 */}
        <TextPreview />
      </NormalOption>
    </div>
  );
}
