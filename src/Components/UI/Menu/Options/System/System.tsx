import styles from '@/Components/UI/Menu/Options/options.module.scss';
import { NormalOption } from '@/Components/UI/Menu/Options/NormalOption';
import { NormalButton } from '@/Components/UI/Menu/Options/NormalButton';
import { resetOptionSet, resetSaveData, setOptionData } from '@/store/userDataReducer';
import { playSpeed } from '@/interface/stateInterface/userDataInterface';
import { setStorage, syncStorageFast } from '@/Core/controller/storage/storageController';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { showGlogalDialog } from '@/Components/UI/GlobalDialog/GlobalDialog';

export function System() {
  const userDataState = useSelector((state: RootState) => state.userData);
  const dispatch = useDispatch();
  return (
    <div className={styles.Options_main_content_half}>
      <NormalOption key="option1" title="自动播放速度">
        <NormalButton
          textList={['慢', '中', '快']}
          functionList={[
            () => {
              dispatch(setOptionData({ key: 'autoSpeed', value: playSpeed.slow }));
              setStorage();
            },
            () => {
              dispatch(setOptionData({ key: 'autoSpeed', value: playSpeed.normal }));
              setStorage();
            },
            () => {
              dispatch(setOptionData({ key: 'autoSpeed', value: playSpeed.fast }));
              setStorage();
            },
          ]}
          currentChecked={userDataState.optionData.autoSpeed}
        />
      </NormalOption>
      <NormalOption key="option2" title="清除或还原数据">
        <NormalButton
          textList={['清除所有存档', '还原默认设置']}
          functionList={[
            () => {
              showGlogalDialog({
                title: '确定要清除存档吗',
                leftText: '是',
                rightText: '否',
                leftFunc: () => {
                  dispatch(resetSaveData());
                  syncStorageFast();
                },
                rightFunc: () => {},
              });
            },
            () => {
              showGlogalDialog({
                title: '确定要还原默认设置吗',
                leftText: '是',
                rightText: '否',
                leftFunc: () => {
                  dispatch(resetOptionSet());
                  syncStorageFast();
                },
                rightFunc: () => {},
              });
            },
          ]}
          currentChecked={2}
        />
      </NormalOption>
    </div>
  );
}
