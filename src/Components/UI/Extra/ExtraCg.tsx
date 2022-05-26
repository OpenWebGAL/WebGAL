import styles from "@/Components/UI/Extra/extra.module.scss";
import React from "react";
import {useSelector} from "react-redux";
import {RootState} from "@/Core/store/store";
import {useObject} from "@/hooks/useObject";
import './extraCG_animation_List.scss';

export function ExtraCg() {
  const cgPerPage = 9;
  const extraState = useSelector((state: RootState) => state.userData.appreciationData);
  const pageNumber = Math.ceil(extraState.cg.length / cgPerPage);
  const currentPage = useObject(1);

  // 开始生成立绘鉴赏的图片
  const showCgList = [];
  const len = extraState.cg.length;
  for (let i = (currentPage.value - 1) * cgPerPage; i < Math.min(len, (currentPage.value - 1) * cgPerPage + cgPerPage); i++) {
    const index = i - (currentPage.value - 1) * cgPerPage;
    const deg = Random(-5, 5);
    const temp = <div style={{
      // transform: `rotate(${deg}deg)`,
      animation: `cg_softIn_${deg} 1s ease-out ${index * 150}ms forwards `
    }} key={extraState.cg[i].name} className={styles.cgElement}>
      <div style={{
        backgroundImage: `url('${extraState.cg[i].url}')`,
        backgroundSize: `cover`,
        backgroundPosition: "center",
        width: '100%',
        height: '100%',
      }}/>
    </div>;
    showCgList.push(temp);
  }

  // 生成cg鉴赏的导航
  const showNav = [];
  for (let i = 1; i <= pageNumber; i++) {
    let className = styles.cgNav;
    if (currentPage.value === i) {
      className = className + ' ' + styles.cgNav_active;
    }
    const temp = <div onClick={() => currentPage.set(i)} key={'nav' + i} className={className}>
      {i}
    </div>;
    showNav.push(temp);
  }

  return <div className={styles.cgMain}>
    <div className={styles.cgContainer}>
      {showCgList}
    </div>
    <div className={styles.cgShowDiv}>
      {showNav}
    </div>
  </div>;
}

function Random(min: number, max: number) {
  return Math.round(Math.random() * (max - min)) + min;
}
