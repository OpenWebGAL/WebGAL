import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import React from 'react';
import styles from '@/Components/UI/Extra/extra.module.scss';
import { useObject } from '@/hooks/useObject';
import { setStage } from '@/store/stageReducer';

export function ExtraBgm() {
  // 检查当前正在播放的bgm是否在bgm列表内
  const currentBgm = useSelector((state: RootState) => state.stage.bgm);
  const extraState = useSelector((state: RootState) => state.userData.appreciationData);
  let foundCurrentBgmName = 'init_bgm_find_var_WebGAL_4.2.1';
  extraState.bgm.forEach((e, i) => {
    if (e.url === currentBgm) {
      foundCurrentBgmName = e.name;
    }
  });
  const currentPlayingBgmName = useObject('');
  if (foundCurrentBgmName !== 'init_bgm_find_var_WebGAL_4.2.1' && foundCurrentBgmName !== currentPlayingBgmName.value) {
    currentPlayingBgmName.set(foundCurrentBgmName);
  }
  const dispatch = useDispatch();
  const showBgmList = extraState.bgm.map((e, i) => {
    let className = styles.bgmElement;
    if (e.name === currentPlayingBgmName.value) {
      className = className + ' ' + styles.bgmElement_active;
    }
    return (
      <div
        onClick={() => {
          currentPlayingBgmName.set(e.name);
          dispatch(setStage({ key: 'bgm', value: e.url }));
        }}
        key={e.name}
        className={className}
        style={{
          animationDelay: `${i * 150}ms`,
        }}
      >
        {e.name}
      </div>
    );
  });
  return <div className={styles.bgmContainer}>{showBgmList}</div>;
}
