import { useValue } from '@/hooks/useValue';
import styles from '@/UI/Extra/extra.module.scss';
import React, { useMemo } from 'react';
import useSoundEffect from '@/hooks/useSoundEffect';
import useApplyStyle from '@/hooks/useApplyStyle';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import useTrans from '@/hooks/useTrans';

interface IProps {
  name: string;
  series?: string;
  resourceUrl: string;
  transformDeg: number;
  index: number;
  onClick: (index: number, type: 'video' | 'image' | 'unknown') => void;
}

export function ExtraCgElement(props: IProps) {
  const showFull = useValue(false);
  const { playSeEnter, playSeClick } = useSoundEffect();
  const optionData = useSelector((state: RootState) => state.userData.optionData);
  const t = useTrans('extra.');
  const applyStyle = useApplyStyle('UI/Extra/extra.scss');

  // Determine if the resource is a video based on file extension
  const isVideo = useMemo(() => {
    const extension = props.resourceUrl.split('.').pop()?.toLowerCase() || '';
    return ['mp4', 'webm', 'mkv', 'mov'].includes(extension);
  }, [props.resourceUrl]);

  // Determine if the resource is an image based on file extension
  const isImage = useMemo(() => {
    const extension = props.resourceUrl.split('.').pop()?.toLowerCase() || '';
    return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(extension);
  }, [props.resourceUrl]);

  // Render media content based on resource type
  const renderMedia = (fullScreen: boolean) => {
    if (isVideo) {
      return (
        <video
          src={props.resourceUrl}
          autoPlay
          loop
          muted
          playsInline
          className={applyStyle('extra_cg_element_video', styles.extra_cg_element_video)}
        />
      );
    } else if (isImage) {
      return (
        <img
          className={applyStyle('extra_cg_element_image', styles.extra_cg_element_image)}
          src={props.resourceUrl}
          alt={props.name}
          loading="lazy"
        />
      );
    } else {
      // Fallback for unsupported file types
      return (
        <div
          className={applyStyle('extra_cg_element_media', styles.extra_cg_element_media)}
          style={{
            backgroundImage: `url('${props.resourceUrl}')`,
          }}
        />
      );
    }
  };

  return (
    <div
      onClick={() => {
        props.onClick(props.index, isVideo ? 'video' : isImage ? 'image' : 'unknown');
        playSeClick();
      }}
      onMouseEnter={playSeEnter}
      key={props.name}
      className={applyStyle('extra_cg_element', styles.extra_cg_element)}
      style={{
        ['--ui-transition-duration' as any]: `${optionData.uiTransitionDuration}ms`,
        ['--extra-cg-element-index' as any]: props.index,
      }}
    >
      {renderMedia(false)}
      <div className={applyStyle('extra_cg_element_info', styles.extra_cg_element_info)}>
        <div className={applyStyle('extra_cg_element_name', styles.extra_cg_element_name)}>{props.name}</div>
        {props.series && (
          <div className={applyStyle('extra_cg_element_series', styles.extra_cg_element_series)}>
            {props.series === 'default' ? t('defaultSeries') : props.series}
          </div>
        )}
      </div>
    </div>
  );
}
