import { useValue } from '@/hooks/useValue';
import styles from '@/UI/Extra/extra.module.scss';
import React, { useMemo, useState } from 'react';
import useSoundEffect from '@/hooks/useSoundEffect';
import { IAppreciationAsset } from '@/store/userDataInterface';

export const isVideoFile = (url: string) => {
  const extension = url.split('.').pop()?.toLowerCase() || '';
  return ['mp4', 'webm', 'mkv'].includes(extension);
}

interface IProps {
  name: string;
  resources: IAppreciationAsset[];
  transformDeg: number;
  index: number;
}

export function ExtraCgElement(props: IProps) {
  const showFull = useValue(false);
  const [currentResourceIndex, setCurrentResourceIndex] = useState(0);
  const { playSeEnter, playSeClick } = useSoundEffect();
  const previewResource = props.resources[0];
  const currentResource = props.resources[currentResourceIndex] ?? previewResource;

  // Determine if the resource is a video based on file extension
  const isVideo = useMemo(() => {
    return isVideoFile(previewResource.url);
  }, [previewResource.url]);

  // Determine if the resource is an image based on file extension
  const isImage = useMemo(() => {
    const extension = previewResource.url.split('.').pop()?.toLowerCase() || '';
    return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(extension);
  }, [previewResource.url]);
  const isStackPreview = props.resources.length > 1 && isImage;
  const animationDelay = 100 + props.index * 100;
  const stackResources = isStackPreview ? [...props.resources].reverse() : [];

  const getStackItemStyle = (index: number, length: number) => {
    const offset = index - (length - 1) / 2;
    return {
      zIndex: index,
      animationDelay: `${animationDelay + index * 140}ms`,
      '--cg-stack-start-transform': `translate(${offset * 1.5}%, ${offset * -0.8}%) rotate(${offset * 2}deg)`,
      '--cg-stack-end-transform': `translate(${offset * 6}%, ${offset * -3}%) rotate(${offset * 6}deg)`,
    } as React.CSSProperties;
  };

  // Render media content based on resource type
  const renderMedia = (resourceUrl: string) => {
    if (isVideo) {
      return (
        <video
          src={resourceUrl}
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
            backgroundImage: `url('${resourceUrl}')`,
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
            backgroundImage: `url('${resourceUrl}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            width: '100%',
            height: '100%',
          }}
        />
      );
    }
  };

  const openFullPreview = () => {
    setCurrentResourceIndex(0);
    showFull.set(true);
    playSeClick();
  };

  const closeFullPreview = () => {
    setCurrentResourceIndex(0);
    showFull.set(false);
    playSeClick();
  };

  const handleFullPreviewClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();

    if (currentResourceIndex >= props.resources.length - 1) {
      closeFullPreview();
      return;
    }

    playSeClick();
    setCurrentResourceIndex((currentIndex) => currentIndex + 1);
  };

  return (
    <>
      {showFull.value && (
        <div
          onClick={closeFullPreview}
          className={styles.showFullContainer}
          onMouseEnter={playSeEnter}
        >
          <div className={styles.showFullCgMain} onClick={(e) => handleFullPreviewClick(e)}>
            {renderMedia(currentResource.url)}
          </div>
        </div>
      )}
      <div
        onClick={openFullPreview}
        onMouseEnter={playSeEnter}
        style={{
          animation: `cg_softIn_${isStackPreview ? 0 : props.transformDeg} 1.5s ease-out ${animationDelay}ms forwards`,
        }}
        key={props.name}
        className={`${styles.cgElement} ${isStackPreview ? styles.cgElementStack : ''}`}
      >
        {isStackPreview ? (
          <>
            {stackResources.map((resource, index) => (
              <div className={styles.cgStackItem} style={getStackItemStyle(index, stackResources.length)} key={`${resource.url}_${index}`}>
                {renderMedia(resource.url)}
              </div>
            ))}
          </>
        ) : (
          renderMedia(previewResource.url)
        )}
      </div>
    </>
  );
}
