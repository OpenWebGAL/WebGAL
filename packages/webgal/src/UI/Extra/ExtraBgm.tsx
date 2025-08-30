import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import React from 'react';
import styles from '@/UI/Extra/extra.module.scss';
import { useValue } from '@/hooks/useValue';
import { setStage } from '@/store/stageReducer';
import { GoEnd, GoStart, MusicList, Pause, PlayOne, SquareSmall } from '@icon-park/react';
import useSoundEffect from '@/hooks/useSoundEffect';
import { setGuiAsset } from '@/store/GUIReducer';
import useApplyStyle from '@/hooks/useApplyStyle';
import { Icon } from '@icon-park/react/lib/runtime';
import { IExtraOption } from './Extra';
import useTrans from '@/hooks/useTrans';

interface IPlayerButtonProps {
  icon: Icon;
  onClick?: () => void;
}

export function ExtraBgm(props: IExtraOption) {
  const { playSeClick, playSeEnter } = useSoundEffect();
  // 检查当前正在播放的bgm是否在bgm列表内
  const currentBgmSrc = useSelector((state: RootState) => state.GUI.titleBgm);
  const extraState = useSelector((state: RootState) => state.userData.appreciationData);
  const optionData = useSelector((state: RootState) => state.userData.optionData);
  const t = useTrans('extra.');
  const applyStyle = useApplyStyle('UI/Extra/extra.scss');
  const initName = 'Title_BGM';
  // 是否展示 bgm 列表
  // const isShowBgmList = useValue(false);
  let foundCurrentBgmName = initName;
  let foundCurrentBgmIndex = -1;
  const bgmListLen = extraState.bgm.length;
  extraState.bgm.forEach((e, i) => {
    if (e.url === currentBgmSrc) {
      foundCurrentBgmName = e.name;
      foundCurrentBgmIndex = i;
    }
  });
  const currentPlayingBgmName = useValue('');
  if (foundCurrentBgmName !== initName && foundCurrentBgmName !== currentPlayingBgmName.value) {
    currentPlayingBgmName.set(foundCurrentBgmName);
  }
  const dispatch = useDispatch();

  function setBgmByIndex(index: number) {
    const e = filteredBgmList[index];
    currentPlayingBgmName.set(e.name);
    dispatch(setGuiAsset({ asset: 'titleBgm', value: e.url }));
  }

  // 根据 series 过滤 BGM 列表
  const filteredBgmList = props.series ? extraState.bgm.filter((bgm) => bgm.series === props.series) : extraState.bgm;

  const bgmList = filteredBgmList.map((e, i) => {
    let className = applyStyle('extra_bgm_element', styles.extra_bgm_element);
    if (e.name === currentPlayingBgmName.value) {
      className = className + ' ' + applyStyle('extra_bgm_element_active', styles.extra_bgm_element_active);
    }
    return (
      <div
        onClick={() => {
          playSeClick();
          currentPlayingBgmName.set(e.name);
          dispatch(setGuiAsset({ asset: 'titleBgm', value: e.url }));
        }}
        key={e.name}
        className={className}
        style={{
          ['--ui-transition-duration' as any]: `${optionData.uiTransitionDuration}ms`,
          ['--extra-bgm-element-index' as any]: i,
        }}
        onMouseEnter={playSeEnter}
      >
        <div className={applyStyle('extra_bgm_element_series', styles.extra_bgm_element_series)}>
          {e.series === 'default' ? t('defaultSeries') : e.series}
        </div>
        <div className={applyStyle('extra_bgm_element_name', styles.extra_bgm_element_name)}>{e.name}</div>
      </div>
    );
  });

  const playerButton = (props: IPlayerButtonProps) => {
    return (
      <div
        className={`${applyStyle('extra_bgm_player_button', styles.extra_bgm_player_button)}`}
        onClick={props.onClick}
        onMouseEnter={playSeEnter}
      >
        {props.icon && (
          <props.icon
            className={applyStyle('extra_bgm_player_button_icon', styles.extra_bgm_player_button_icon)}
            strokeWidth={4}
          />
        )}
      </div>
    );
  };

  return (
    <div className={applyStyle('extra_bgm_main', styles.extra_bgm_main)}>
      <div className={applyStyle('extra_bgm_list', styles.extra_bgm_list)}> {bgmList}</div>
      <div className={applyStyle('extra_bgm_player', styles.extra_bgm_player)}>
        <div className={applyStyle('extra_bgm_player_name', styles.extra_bgm_player_name)}>{foundCurrentBgmName}</div>
        <div className={applyStyle('extra_bgm_player_button_list', styles.extra_bgm_player_button_list)}>
          {playerButton({
            icon: GoStart,
            onClick: () => {
              playSeClick();
              if (foundCurrentBgmIndex <= 0) {
                setBgmByIndex(bgmListLen - 1);
              } else {
                setBgmByIndex(foundCurrentBgmIndex - 1);
              }
            },
          })}
          {playerButton({
            icon: PlayOne,
            onClick: () => {
              playSeClick();
              const bgmControl: HTMLAudioElement = document.getElementById('currentBgm') as HTMLAudioElement;
              bgmControl?.play().then();
            },
          })}
          {playerButton({
            icon: Pause,
            onClick: () => {
              playSeClick();
              const bgmControl: HTMLAudioElement = document.getElementById('currentBgm') as HTMLAudioElement;
              bgmControl.pause();
            },
          })}
          {playerButton({
            icon: GoEnd,
            onClick: () => {
              playSeClick();
              if (foundCurrentBgmIndex >= bgmListLen - 1) {
                setBgmByIndex(0);
              } else {
                setBgmByIndex(foundCurrentBgmIndex + 1);
              }
            },
          })}
        </div>
      </div>
    </div>
  );
}
