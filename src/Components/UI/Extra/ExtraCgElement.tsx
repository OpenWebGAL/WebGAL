import { useObject } from '@/hooks/useObject';
import styles from '@/Components/UI/Extra/extra.module.scss';
import React from 'react';

interface IProps {
  name: string;
  imgUrl: string;
  transformDeg: number;
  index: number;
}

export function ExtraCgElement(props: IProps) {
  const showFull = useObject(false);
  return (
    <>
      {showFull.value && (
        <div onClick={() => showFull.set(!showFull.value)} className={styles.showFullContainer}>
          <div className={styles.showFullCgMain}>
            <div
              style={{
                backgroundImage: `url('${props.imgUrl}')`,
                backgroundSize: `cover`,
                backgroundPosition: 'center',
                width: '100%',
                height: '100%',
              }}
            />
          </div>
        </div>
      )}
      <div
        onClick={() => showFull.set(!showFull.value)}
        style={{
          // transform: `rotate(${deg}deg)`,
          animation: `cg_softIn_${props.transformDeg} 1.5s ease-out ${100 + props.index * 100}ms forwards `,
        }}
        key={props.name}
        className={styles.cgElement}
      >
        <div
          style={{
            backgroundImage: `url('${props.imgUrl}')`,
            backgroundSize: `cover`,
            backgroundPosition: 'center',
            width: '100%',
            height: '100%',
          }}
        />
      </div>
    </>
  );
}
