import styles from '@/UI/Menu/Options/options.module.scss';
import { NormalOption } from '@/UI/Menu/Options/NormalOption';
import { OptionSlider } from '@/UI/Menu/Options/OptionSlider';
import { NormalButton } from '@/UI/Menu/Options//NormalButton';
import { setOptionData } from '@/store/userDataReducer';
import { setStorage } from '@/Core/controller/storage/storageController';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import useTrans from '@/hooks/useTrans';
import { voiceOption } from '@/store/userDataInterface';

export function Sound() {
  const userDataState = useSelector((state: RootState) => state.userData);
  const dispatch = useDispatch();
  const t = useTrans('menu.options.pages.sound.options.');

  return (
    <div className={styles.Options_main_content_half}>
      <NormalOption key="option4" title={t('volumeMain.title')}>
        <OptionSlider
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
        <OptionSlider
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
        <OptionSlider
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
        <OptionSlider
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
        <OptionSlider
          initValue={userDataState.optionData.uiSeVolume}
          uniqueID={t('uiSeVolume.title')}
          onChange={(event) => {
            const newValue = event.target.value;
            dispatch(setOptionData({ key: 'uiSeVolume', value: Number(newValue) }));
            setStorage();
          }}
        />
      </NormalOption>
      <NormalOption key="option9" title={t('voiceOption.title')}>
        <NormalButton
          textList={t('voiceStop.title', 'voiceContinue.title')}
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
