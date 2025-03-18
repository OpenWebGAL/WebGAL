import styles from '@/UI/Extra/extra.module.scss';
import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { useValue } from '@/hooks/useValue';
import './extraCG_animation_List.scss';
import { ExtraCgElement } from '@/UI/Extra/ExtraCgElement';
import useSoundEffect from '@/hooks/useSoundEffect';

export function ExtraCg() {
  const cgPerPage = 8;
  const extraState = useSelector((state: RootState) => state.userData.appreciationData);
  const pageNumber = Math.ceil(extraState.cg.length / cgPerPage);
  // const pageNumber = 10;
  const currentPage = useValue(1);
  const { playSeEnter, playSeClick } = useSoundEffect();

  // 开始生成立绘鉴赏的图片
  const showCgList = [];
  const len = extraState.cg.length;
  for (
    let i = (currentPage.value - 1) * cgPerPage;
    i < Math.min(len, (currentPage.value - 1) * cgPerPage + cgPerPage);
    i++
  ) {
    const index = i - (currentPage.value - 1) * cgPerPage;
    const deg = Random(-5, 5);
    const temp = (
      <ExtraCgElement
        name={extraState.cg[i].name}
        resourceUrl={extraState.cg[i].url}
        transformDeg={deg}
        index={index}
        key={index.toString() + extraState.cg[i].url}
      />
    );
    showCgList.push(temp);
  }

  // 生成cg鉴赏的导航
  const showNav = [];
  for (let i = 1; i <= pageNumber; i++) {
    let className = styles.cgNav;
    if (currentPage.value === i) {
      className = className + ' ' + styles.cgNav_active;
    }
    const temp = (
      <div
        onClick={() => {
          currentPage.set(i);
          playSeClick();
        }}
        key={'nav' + i}
        onMouseEnter={playSeEnter}
        className={className}
      >
        {i}
      </div>
    );
    showNav.push(temp);
  }

  return (
    <div className={styles.cgMain}>
      <div className={styles.cgShowDiv}>
        <div className={styles.cgShowDivWarpper}>{showNav}</div>
      </div>
      <div className={styles.cgContainer}>{showCgList}</div>
    </div>
  );
}

function Random(min: number, max: number) {
  return Math.round(Math.random() * (max - min)) + min;
}
