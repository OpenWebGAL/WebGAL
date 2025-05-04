import { setStorage } from '@/Core/controller/storage/storageController';
import { NormalButton } from '@/UI/Menu/Options/NormalButton';
import { NormalOption } from '@/UI/Menu/Options/NormalOption';
import { TextPreview } from '@/UI/Menu/Options/TextPreview/TextPreview';
import styles from '@/UI/Menu/Options/options.module.scss';
import useFullScreen from '@/hooks/useFullScreen';
import useTrans from '@/hooks/useTrans';
import { RootState } from '@/store/store';
import { textFont, textSize } from '@/store/userDataInterface';
import { setOptionData } from '@/store/userDataReducer';
import { useDispatch, useSelector } from 'react-redux';
import { OptionSlider } from '../OptionSlider';

export function Display() {
  const userDataState = useSelector((state: RootState) => state.userData);
  const dispatch = useDispatch();
  const t = useTrans('menu.options.pages.display.options.');
  const { isSupported: isFullscreenSupported, enter: enterFullscreen, exit: exitFullscreen } = useFullScreen();

  return (
    <div className={styles.Options_main_content_half}>
      {isFullscreenSupported && <NormalOption key="fullScreen" title={t('fullScreen.title')}>
        <NormalButton
          textList={t('fullScreen.options.on', 'fullScreen.options.off')}
          functionList={[
            enterFullscreen,
            exitFullscreen,
          ]}
          currentChecked={userDataState.optionData.fullScreen}
        />
      </NormalOption>}
      <NormalOption key="textSize" title={t('textSize.title')}>
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
      <NormalOption key="textFont" title={t('textFont.title')}>
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
      <NormalOption key="textSpeed" title={t('textSpeed.title')}>
        <OptionSlider
          initValue={userDataState.optionData.textSpeed}
          uniqueID={t('textSpeed.title')}
          onChange={(event) => {
            const newValue = event.target.value;
            dispatch(setOptionData({ key: 'textSpeed', value: Number(newValue) }));
            setStorage();
          }}
        />
      </NormalOption>
      <NormalOption key="textboxOpacity" title={t('textboxOpacity.title')}>
        <OptionSlider
          initValue={userDataState.optionData.textboxOpacity}
          uniqueID={t('textboxOpacity.title')}
          onChange={(event) => {
            const newValue = event.target.value;
            dispatch(setOptionData({ key: 'textboxOpacity', value: Number(newValue) }));
            setStorage();
          }}
        />
      </NormalOption>
      <NormalOption full key="textPreview" title={t('textPreview.title')}>
        {/* 这是一个临时的组件，用于模拟文本预览的效果 */}
        <TextPreview />
      </NormalOption>
    </div>
  );
}
