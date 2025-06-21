import { useValue } from '@/hooks/useValue';
import styles from '@/UI/Extra/extra.module.scss';
import React, { useMemo } from 'react';
import useSoundEffect from '@/hooks/useSoundEffect';

interface IProps {
  name: string;
  resourceUrl: string;
  transformDeg: number;
  index: number;
}

export function ExtraCgElement(props: IProps) {
  const showFull = useValue(false);
  const { playSeEnter, playSeClick } = useSoundEffect();

  // Determine if the resource is a video based on file extension
  const isVideo = useMemo(() => {
    const extension = props.resourceUrl.split('.').pop()?.toLowerCase() || '';
    return ['mp4', 'webm', 'mkv'].includes(extension);
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
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      );
    } else if (isImage) {
      return (
        <div
          style={{
            backgroundImage: `url('${props.resourceUrl}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            width: '100%',
            height: '100%',
          }}
        />
      );
    } else {
      // Fallback for unsupported file types
      return (
        <div
          style={{
            backgroundImage: `url('${props.resourceUrl}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            width: '100%',
            height: '100%',
          }}
        />
      );
    }
  };

  return (
    <>
      {showFull.value && (
        <div
          onClick={() => {
            showFull.set(!showFull.value);
            playSeClick();
          }}
          className={styles.showFullContainer}
          onMouseEnter={playSeEnter}
        >
          <div className={styles.showFullCgMain}>{renderMedia(true)}</div>
        </div>
      )}
      <div
        onClick={() => {
          showFull.set(!showFull.value);
          playSeClick();
        }}
        onMouseEnter={playSeEnter}
        style={{
          animation: `cg_softIn_${props.transformDeg} 1.5s ease-out ${100 + props.index * 100}ms forwards`,
        }}
        key={props.name}
        className={styles.cgElement}
      >
        {renderMedia(false)}
      </div>
    </>
  );
}
