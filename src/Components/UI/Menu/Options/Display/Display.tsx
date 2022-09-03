import styles from '@/Components/UI/Menu/Options/options.module.scss';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { NormalOption } from '@/Components/UI/Menu/Options/NormalOption';
import { NormalButton } from '@/Components/UI/Menu/Options/NormalButton';
import { setOptionData } from '@/store/userDataReducer';
import {playSpeed, textFont, textSize} from '@/interface/stateInterface/userDataInterface';
import { setStorage } from '@/Core/controller/storage/storageController';
import { TextPreview } from '@/Components/UI/Menu/Options/TextPreview/TextPreview';

export function Display() {
  const userDataState = useSelector((state: RootState) => state.userData);
  const dispatch = useDispatch();

  return (
    <div className={styles.Options_main_content_half}>
      <NormalOption key="option0" title="文字显示速度">
        <NormalButton
          textList={['慢', '中', '快']}
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
      <NormalOption key="option2" title="文本大小">
        <NormalButton
          textList={['小', '中', '大']}
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
      <NormalOption key="option2" title="文本字体">
        <NormalButton
          textList={['思源宋体', '黑体']}
          functionList={[
            () => {
              dispatch(setOptionData({ key: 'textboxFont', value: textFont.song }));
              setStorage();
            },
            () => {
              dispatch(setOptionData({ key: 'textboxFont', value: textFont.hei }));
              setStorage();
            },
          ]}
          currentChecked={userDataState.optionData.textboxFont}
        />
      </NormalOption>
      <NormalOption key="option3" title="文本显示预览">
        {/* 这是一个临时的组件，用于模拟文本预览的效果 */}
        <TextPreview />
      </NormalOption>
    </div>
  );
}
