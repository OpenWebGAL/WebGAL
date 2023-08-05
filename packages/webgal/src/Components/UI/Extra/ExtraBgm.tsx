import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import React from 'react';
import styles from '@/Components/UI/Extra/extra.module.scss';
import { useValue } from '@/hooks/useValue';
import { setStage } from '@/store/stageReducer';
import { GoEnd, GoStart, MusicList, PlayOne, SquareSmall } from '@icon-park/react';
import useSoundEffect from '@/hooks/useSoundEffect';

export function ExtraBgm() {
  const { setMouseEnterSE, setClickSE } = useSoundEffect();
  // 检查当前正在播放的bgm是否在bgm列表内
  const currentBgm = useSelector((state: RootState) => state.stage.bgm);
  const extraState = useSelector((state: RootState) => state.userData.appreciationData);
  // 是否展示 bgm 列表
  const isShowBgmList = useValue(false);
  let foundCurrentBgmName = 'init_bgm_find_var_WebGAL_4.2.1';
  let foundCurrentBgmIndex = -1;
  const iconSize = 39;
  const bgmPlayerHeight = isShowBgmList.value ? '80%' : '10%';
  const bgmListLen = extraState.bgm.length;
  extraState.bgm.forEach((e, i) => {
    if (e.url === currentBgm) {
      foundCurrentBgmName = e.name;
      foundCurrentBgmIndex = i;
    }
  });
  const currentPlayingBgmName = useValue('');
  if (foundCurrentBgmName !== 'init_bgm_find_var_WebGAL_4.2.1' && foundCurrentBgmName !== currentPlayingBgmName.value) {
    currentPlayingBgmName.set(foundCurrentBgmName);
  }
  const dispatch = useDispatch();

  function setBgmByIndex(index: number) {
    const e = extraState.bgm[index];
    currentPlayingBgmName.set(e.name);
    dispatch(setStage({ key: 'bgm', value: e.url }));
  }

  const showBgmList = extraState.bgm.map((e, i) => {
    let className = styles.bgmElement;
    if (e.name === currentPlayingBgmName.value) {
      className = className + ' ' + styles.bgmElement_active;
    }
    return (
      <div
        onClick={() => {
          setClickSE();
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
  return (
    <div className={styles.bgmContainer} style={{ maxHeight: bgmPlayerHeight }}>
      <div className={styles.bgmPlayerMain}>
        <div
          onClick={() => {
            setClickSE();
            if (foundCurrentBgmIndex <= 0) {
              setBgmByIndex(bgmListLen - 1);
            } else {
              setBgmByIndex(foundCurrentBgmIndex - 1);
            }
          }}
          onMouseEnter={setMouseEnterSE}
          className={styles.bgmControlButton}
        >
          <GoStart theme="filled" size={iconSize} fill="#fff" strokeWidth={3} strokeLinejoin="miter" />
        </div>
        <div
          onClick={() => {
            setClickSE();
            const bgmControl: HTMLAudioElement = document.getElementById('currentBgm') as HTMLAudioElement;
            bgmControl?.play().then();
          }}
          onMouseEnter={setMouseEnterSE}
          className={styles.bgmControlButton}
        >
          <PlayOne theme="filled" size={iconSize} fill="#fff" strokeWidth={3} strokeLinejoin="miter" />
        </div>
        <div
          onClick={() => {
            setClickSE();
            if (foundCurrentBgmIndex >= bgmListLen - 1) {
              setBgmByIndex(0);
            } else {
              setBgmByIndex(foundCurrentBgmIndex + 1);
            }
          }}
          onMouseEnter={setMouseEnterSE}
          className={styles.bgmControlButton}
        >
          <GoEnd theme="filled" size={iconSize} fill="#fff" strokeWidth={3} strokeLinejoin="miter" />
        </div>
        <div
          onClick={() => {
            setClickSE();
            const bgmControl: HTMLAudioElement = document.getElementById('currentBgm') as HTMLAudioElement;
            bgmControl.pause();
          }}
          onMouseEnter={setMouseEnterSE}
          className={styles.bgmControlButton}
        >
          <SquareSmall theme="filled" size={iconSize} fill="#fff" strokeWidth={3} strokeLinejoin="miter" />
        </div>
        <div className={styles.bgmName}>{foundCurrentBgmName}</div>
        <div
          onClick={() => {
            setClickSE();
            isShowBgmList.set(!isShowBgmList.value);
          }}
          onMouseEnter={setMouseEnterSE}
          className={styles.bgmControlButton}
          style={{ marginLeft: 'auto' }}
        >
          <MusicList theme="filled" size={iconSize} fill="#fff" strokeWidth={3} strokeLinejoin="miter" />
        </div>
      </div>
      {isShowBgmList.value && <div className={styles.bgmListContainer}> {showBgmList}</div>}
    </div>
  );
}
