import {FC, useEffect} from "react";
import styles from './options.module.scss';
import {NormalButton} from "./NormalButton";
import {NormalOption} from "./NormalOption";
import {OptionSlider} from "./OptionSlider";
import {getStorage, setStorage} from "@/Core/controller/storage/storageController";
import {TextPreview} from "./TextPreview/TextPreview";
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "@/store/store";
import {setOptionData} from "@/store/userDataReducer";
import {playSpeed, textSize} from "@/interface/stateInterface/userDataInterface";
import {setVolume} from "@/Core/controller/stage/setVolume";

export const Options: FC = () => {
  const userDataState = useSelector((state: RootState) => state.userData);
  const dispatch = useDispatch();
  useEffect(getStorage, []);
  return <div className={styles.Options_main}>
    <div className={styles.Options_top}>
      <div className={styles.Options_title}>
        {/* <div className={styles.Option_title_text_ts + ' ' + styles.Option_title_text}>选项</div> */}
        {/* <div className={styles.Option_title_text_shadow + ' ' + styles.Option_title_text}>选项</div> */}
        <div className={styles.Option_title_text}>选项</div>
      </div>
    </div>
    <div className={styles.Options_main_content}>
      <div className={styles.Options_main_content_half}>
        <NormalOption key="option0" title="文字显示速度">
          <NormalButton textList={['慢', '中', '快']} functionList={[
            () => {
              dispatch(setOptionData({key: 'textSpeed', value: playSpeed.slow}));
              setStorage();
            },
            () => {
              dispatch(setOptionData({key: 'textSpeed', value: playSpeed.normal}));
              setStorage();
            },
            () => {
              dispatch(setOptionData({key: 'textSpeed', value: playSpeed.fast}));
              setStorage();
            },
          ]}
          currentChecked={userDataState.optionData.textSpeed}/>
        </NormalOption>
        <NormalOption key="option1" title="自动播放速度">
          <NormalButton textList={['慢', '中', '快']} functionList={[
            () => {
              dispatch(setOptionData({key: 'autoSpeed', value: playSpeed.slow}));
              setStorage();
            },
            () => {
              dispatch(setOptionData({key: 'autoSpeed', value: playSpeed.normal}));
              setStorage();
            },
            () => {
              dispatch(setOptionData({key: 'autoSpeed', value: playSpeed.fast}));
              setStorage();
            },
          ]}
          currentChecked={userDataState.optionData.autoSpeed}/>
        </NormalOption>
        <NormalOption key="option2" title="文本大小">
          <NormalButton textList={['小', '中', '大']} functionList={[
            () => {
              dispatch(setOptionData({key: 'textSize', value: textSize.small}));
              setStorage();
            },
            () => {
              dispatch(setOptionData({key: 'textSize', value: textSize.medium}));
              setStorage();
            },
            () => {
              dispatch(setOptionData({key: 'textSize', value: textSize.large}));
              setStorage();
            },
          ]}
          currentChecked={userDataState.optionData.textSize}/>
        </NormalOption>
        <NormalOption key="option3" title="文本显示预览">
          {/* 这是一个临时的组件，用于模拟文本预览的效果 */}
          <TextPreview/>
        </NormalOption>

      </div>
      <div className={styles.Options_main_content_half}>
        <NormalOption key="option4" title="主音量">
          <OptionSlider initValue={userDataState.optionData.volumeMain}
            uniqueID="主音量" onChange={(event) => {
              const newValue = event.target.value;
              dispatch(setOptionData({key: 'volumeMain', value: Number(newValue)}));
              setStorage();
              setVolume();
            }}
          />
        </NormalOption>
        <NormalOption key="option5" title="语音音量">
          <OptionSlider initValue={userDataState.optionData.vocalVolume}
            uniqueID="语音音量" onChange={(event) => {
              const newValue = event.target.value;
              dispatch(setOptionData({key: 'vocalVolume', value: Number(newValue)}));
              setStorage();
              setVolume();
            }}/>
        </NormalOption>
        <NormalOption key="option6" title="背景音乐音量">
          <OptionSlider initValue={userDataState.optionData.bgmVolume}
            uniqueID="背景音乐音量" onChange={(event) => {
              const newValue = event.target.value;
              dispatch(setOptionData({key: 'bgmVolume', value: Number(newValue)}));
              setStorage();
              setVolume();
            }}/>
        </NormalOption>
      </div>
    </div>
  </div>;
};
