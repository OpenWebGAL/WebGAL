import styles from '@/Components/UI/Menu/Options/options.module.scss';
import { NormalOption } from '@/Components/UI/Menu/Options/NormalOption';
import { NormalButton } from '@/Components/UI/Menu/Options/NormalButton';
import { resetAllData, resetOptionSet, resetSaveData, setOptionData } from '@/store/userDataReducer';
import { playSpeed } from '@/store/userDataInterface';
import { getStorage, setStorage, syncStorageFast } from '@/Core/controller/storage/storageController';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { showGlogalDialog } from '@/Components/UI/GlobalDialog/GlobalDialog';
import localforage from 'localforage';
import { RUNTIME_GAME_INFO } from '@/Core/runtime/etc';
import { logger } from '@/Core/util/etc/logger';

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
          textList={['清除所有存档', '还原默认设置', '清除所有数据']}
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
            () => {
              showGlogalDialog({
                title: '确定要清除所有数据吗',
                leftText: '是',
                rightText: '否',
                leftFunc: () => {
                  dispatch(resetAllData());
                  syncStorageFast();
                },
                rightFunc: () => {},
              });
            },
          ]}
          currentChecked={3}
        />
      </NormalOption>
      <NormalOption key="option3" title="导入或导出存档与选项">
        <NormalButton
          textList={['导出存档与选项', '导入存档与选项']}
          functionList={[exportSaves, importSaves]}
          currentChecked={2}
        />
      </NormalOption>
    </div>
  );
}

function exportSaves() {
  setStorage();
  localforage.getItem(RUNTIME_GAME_INFO.gameKey).then((newUserData) => {
    const saves = JSON.stringify(newUserData);
    if (saves !== null) {
      // @ts-ignore
      const blob = new Blob([saves], { type: 'application/json' });
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = 'saves.json';
      a.click();
      a.remove();
    }
  });
}

function importSaves() {
  const inputElement = document.createElement('input');
  inputElement.type = 'file';
  inputElement.onchange = importSavesEventHandler;
  inputElement.click();
}

function importSavesEventHandler(ev: any) {
  const file = ev.target.files[0];
  const reader = new FileReader();
  reader.onload = (evR) => {
    const saves = evR!.target!.result as string;
    try {
      const saveAsObj = JSON.parse(saves);
      showGlogalDialog({
        title: '确定要导入存档与选项吗',
        leftText: '是',
        rightText: '否',
        leftFunc: () => {
          localforage.setItem(RUNTIME_GAME_INFO.gameKey, saveAsObj).then(() => {
            logger.info('导入存档');
          });
          getStorage();
        },
        rightFunc: () => {},
      });
    } catch (e) {
      logger.error('存档解析失败', e);
    }
    // window.location.reload(); // dirty: 强制刷新 UI
  };
  reader.readAsText(file, 'UTF-8');
}
