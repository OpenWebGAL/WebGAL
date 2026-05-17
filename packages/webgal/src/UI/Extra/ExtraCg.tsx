import styles from '@/UI/Extra/extra.module.scss';
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { useValue } from '@/hooks/useValue';
import './extraCG_animation_List.scss';
import { ExtraCgElement, isVideoFile } from '@/UI/Extra/ExtraCgElement';
import useSoundEffect from '@/hooks/useSoundEffect';
import { IAppreciationAsset } from '@/store/userDataInterface';

interface IExtraCgDisplayItem {
  key: string;
  name: string;
  resources: IAppreciationAsset[];
}

export function ExtraCg() {
  const cgPerPage = 8;
  const extraState = useSelector((state: RootState) => state.userData.appreciationData);
  const groupedCgList = useMemo(() => buildGroupedCgList(extraState.cg), [extraState.cg]);
  const pageNumber = Math.ceil(groupedCgList.length / cgPerPage);
  const currentPage = useValue(1);
  const { playSeEnter, playSeClick } = useSoundEffect();

  // 开始生成立绘鉴赏的图片
  const showCgList = [];
  const len = groupedCgList.length;
  for (
    let i = (currentPage.value - 1) * cgPerPage;
    i < Math.min(len, (currentPage.value - 1) * cgPerPage + cgPerPage);
    i++
  ) {
    const index = i - (currentPage.value - 1) * cgPerPage;
    const deg = Random(-5, 5);
    const temp = (
      <ExtraCgElement
        name={groupedCgList[i].name}
        resources={groupedCgList[i].resources}
        transformDeg={deg}
        index={index}
        key={groupedCgList[i].key}
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

function buildGroupedCgList(cgList: IAppreciationAsset[]): IExtraCgDisplayItem[] {
  const groupedCgList: IExtraCgDisplayItem[] = [];
  const seriesIndexMap = new Map<string, number>();

  cgList.forEach((cg, index) => {
    // 视频不进行分组
    if (cg.series !== 'default' && !isVideoFile(cg.url)) {
      const groupedIndex = seriesIndexMap.get(cg.series);
      if (groupedIndex !== undefined) {
        groupedCgList[groupedIndex].resources.push(cg);
        return;
      }

      seriesIndexMap.set(cg.series, groupedCgList.length);
      groupedCgList.push({
        key: `series:${cg.series}`,
        name: cg.name,
        resources: [cg],
      });
      return;
    }

    groupedCgList.push({
      key: `default:${index}:${cg.url}`,
      name: cg.name,
      resources: [cg],
    });
  });

  return groupedCgList.map((groupedCg) => ({
    ...groupedCg,
    resources: groupedCg.resources.length > 1 ? [...groupedCg.resources].sort(sortCgByOrder) : groupedCg.resources,
  }));
}

function sortCgByOrder(prev: IAppreciationAsset, next: IAppreciationAsset) {
  return (prev.order ?? 0) - (next.order ?? 0);
}
