import styles from '@/UI/Menu/Options/options.module.scss';
import { NormalOption } from '@/UI/Menu/Options/NormalOption';
import { NormalSlider } from '@/UI/Menu/Options/NormalSlider';
import { NormalButton } from '@/UI/Menu/Options//NormalButton';
import { setOptionData } from '@/store/userDataReducer';
import { setStorage } from '@/Core/controller/storage/storageController';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import useTrans from '@/hooks/useTrans';
import { voiceOption } from '@/store/userDataInterface';
import useApplyStyle from '@/hooks/useApplyStyle';

export function Sound() {
  const userDataState = useSelector((state: RootState) => state.userData);
  const dispatch = useDispatch();
  const t = useTrans('menu.options.pages.sound.options.');
  const applyStyle = useApplyStyle('UI/Menu/Options/options.scss');

  return (
    <div className={applyStyle('options_page_container', styles.options_page_container)}>
      <NormalOption key="option4" title={t('volumeMain.title')}>
        <NormalSlider
          initValue={userDataState.optionData.volumeMain}
          uniqueID={t('volumeMain.title')}
          onChange={(event) => {
            const newValue = event.target.value;
            dispatch(setOptionData({ key: 'volumeMain', value: Number(newValue) }));
            setStorage();
          }}
        />
      </NormalOption>
      <NormalOption key="option5" title={t('vocalVolume.title')}>
        <NormalSlider
          initValue={userDataState.optionData.vocalVolume}
          uniqueID={t('vocalVolume.title')}
          onChange={(event) => {
            const newValue = event.target.value;
            dispatch(setOptionData({ key: 'vocalVolume', value: Number(newValue) }));
            setStorage();
          }}
        />
      </NormalOption>
      <NormalOption key="option6" title={t('bgmVolume.title')}>
        <NormalSlider
          initValue={userDataState.optionData.bgmVolume}
          uniqueID={t('bgmVolume.title')}
          onChange={(event) => {
            const newValue = event.target.value;
            dispatch(setOptionData({ key: 'bgmVolume', value: Number(newValue) }));
            setStorage();
          }}
        />
      </NormalOption>
      <NormalOption key="option7" title={t('seVolume.title')}>
        <NormalSlider
          initValue={userDataState.optionData.seVolume}
          uniqueID={t('seVolume.title')}
          onChange={(event) => {
            const newValue = event.target.value;
            dispatch(setOptionData({ key: 'seVolume', value: Number(newValue) }));
            setStorage();
          }}
        />
      </NormalOption>
      <NormalOption key="option8" title={t('uiSeVolume.title')}>
        <NormalSlider
          initValue={userDataState.optionData.uiSeVolume}
          uniqueID={t('uiSeVolume.title')}
          onChange={(event) => {
            const newValue = event.target.value;
            dispatch(setOptionData({ key: 'uiSeVolume', value: Number(newValue) }));
            setStorage();
          }}
        />
      </NormalOption>
      <NormalOption key="option9" title={t('voiceInterruption.title')}>
        <NormalButton
          textList={t('voiceInterruption.options.voiceStop', 'voiceInterruption.options.voiceContinue')}
          functionList={[
            () => {
              dispatch(setOptionData({ key: 'voiceInterruption', value: voiceOption.yes }));
              setStorage();
            },
            () => {
              dispatch(setOptionData({ key: 'voiceInterruption', value: voiceOption.no }));
              setStorage();
            },
          ]}
          currentChecked={userDataState.optionData.voiceInterruption}
        />
      </NormalOption>
    </div>
  );
}
