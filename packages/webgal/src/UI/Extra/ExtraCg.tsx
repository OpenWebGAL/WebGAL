import styles from '@/UI/Extra/extra.module.scss';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { useValue } from '@/hooks/useValue';
import { ExtraCgElement } from '@/UI/Extra/ExtraCgElement';
import useSoundEffect from '@/hooks/useSoundEffect';
import useApplyStyle from '@/hooks/useApplyStyle';
import { useDelayedVisibility } from '@/hooks/useDelayedVisibility';
import { IExtraOption } from './Extra';
import { Icon } from '@icon-park/react/lib/runtime';
import { Close } from '@icon-park/react';

interface IExtraFullScreenBarButtonProps {
  icon?: Icon;
  onClick?: () => void;
}

export function ExtraCg(props: IExtraOption) {
  const extraState = useSelector((state: RootState) => state.userData.appreciationData);
  const currentPage = useValue(1);
  const { playSeEnter, playSeClick } = useSoundEffect();
  const applyStyle = useApplyStyle('UI/Extra/extra.scss');

  const [showFull, setShowFull] = useState(false);
  const delayedShowFull = useDelayedVisibility(showFull);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [mediaType, setMediaType] = useState<'video' | 'image' | 'unknown'>('unknown');

  const extraFullScreenBarButton = (props: IExtraFullScreenBarButtonProps) => {
    return (
      <div
        className={`${applyStyle('extra_cg_full_screen_bar_button', styles.extra_cg_full_screen_bar_button)}`}
        onClick={props.onClick}
        onMouseEnter={playSeEnter}
      >
        {props.icon && (
          <props.icon
            className={applyStyle('extra_cg_full_screen_bar_button_icon', styles.extra_cg_full_screen_bar_button_icon)}
            strokeWidth={4}
          />
        )}
      </div>
    );
  };

  // 根据 series 过滤 CG 列表
  const filteredCgList = props.series ? extraState.cg.filter((cg) => cg.series === props.series) : extraState.cg;

  const cgList = filteredCgList.map((cg, index) => {
    return (
      <ExtraCgElement
        name={cg.name}
        series={props.series ? undefined : cg.series}
        resourceUrl={cg.url}
        transformDeg={Random(-5, 5)}
        index={index}
        key={index.toString() + cg.url}
        onClick={(idx: number, mediaType: 'video' | 'image' | 'unknown') => {
          setCurrentIndex(idx);
          setMediaType(mediaType);
          setShowFull(true);
        }}
      />
    );
  });

  return (
    <>
      {delayedShowFull && (
        <div
          onClick={() => {
            setShowFull(false);
            playSeClick();
          }}
          className={`${applyStyle('extra_cg_full_screen', styles.extra_cg_full_screen)} ${
            showFull ? '' : applyStyle('extra_cg_full_screen_hide', styles.extra_cg_full_screen_hide)
          }`}
        >
          {mediaType === 'video' && (
            <video
              src={filteredCgList[currentIndex].url}
              controls
              autoPlay
              playsInline
              className={applyStyle('extra_cg_full_screen_video', styles.extra_cg_full_screen_video)}
            />
          )}
          {mediaType === 'image' && (
            <img
              alt={filteredCgList[currentIndex].name}
              src={filteredCgList[currentIndex].url}
              className={applyStyle('extra_cg_full_screen_image', styles.extra_cg_full_screen_image)}
            />
          )}
          {mediaType === 'unknown' && (
            <div
              className={applyStyle('extra_cg_full_screen_media', styles.extra_cg_full_screen_media)}
              style={{
                backgroundImage: `url('${filteredCgList[currentIndex].url}')`,
              }}
            />
          )}
          <div className={applyStyle('extra_cg_full_screen_bar', styles.extra_cg_full_screen_bar)}>
            {extraFullScreenBarButton({
              icon: Close,
              onClick: () => {
                setShowFull(true);
                playSeClick();
              },
            })}
          </div>
        </div>
      )}
      <div className={applyStyle('extra_cg_main', styles.extra_cg_main)}>
        <div className={applyStyle('extra_cg_container', styles.extra_cg_container)}>{cgList}</div>
      </div>
    </>
  );
}

function Random(min: number, max: number) {
  return Math.round(Math.random() * (max - min)) + min;
}
