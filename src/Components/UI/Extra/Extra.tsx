import styles from './extra.module.scss';
import React, {useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "@/Core/store/store";
import {setVisibility} from '@/Core/store/GUIReducer';
import {CloseSmall} from "@icon-park/react";

export function Extra() {
  const extraState = useSelector((state: RootState) => state.userData.appreciationData);
  const showExtra = useSelector((state: RootState) => state.GUI.showExtra);
  const dispatch = useDispatch();
  const [currentPlayingBgmName, setCurrentBgmName] = useState('');
  const cgPerPage = 9;
  const pageNumber = Math.ceil(extraState.cg.length / cgPerPage);
  const [currentPage, setCurrentPage] = useState(1);
  const showBgmList = extraState.bgm.map(e => {
    let className = styles.bgmElement;
    if (e.name === currentPlayingBgmName) {
      className = className + ' ' + styles.bgmElement_active;
    }
    return <div onClick={() => setCurrentBgmName(e.name)} key={e.name} className={className}>
      {e.name}
    </div>;
  });

  // 开始生成立绘鉴赏的图片
  const showCgList = [];
  const len = extraState.cg.length;
  console.log(len);
  for (let i = (currentPage - 1) * cgPerPage; i < Math.min(len, (currentPage - 1) * cgPerPage + cgPerPage); i++) {
    const index = i - (currentPage - 1) * cgPerPage;
    const deg = Random(-5, 5);
    const temp = <div style={{
      transform: `rotate(${deg}deg)`,
      animationDelay: `${index * 50}ms`
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
    if (currentPage === i) {
      className = className + ' ' + styles.cgNav_active;
    }
    const temp = <div onClick={() => setCurrentPage(i)} key={'nav' + i} className={className}>
      {i}
    </div>;
    showNav.push(temp);
  }
  return <>
    {showExtra && <div className={styles.extra}>
      <div className={styles.extra_top}>
        <CloseSmall
          className={styles.extra_top_icon}
          onClick={() => {
            dispatch(setVisibility({component: 'showExtra', visibility: false}));
          }}
          theme="outline"
          size="4em"
          fill="#fff"
          strokeWidth={3}
        />
        <div className={styles.extra_title}>鉴赏模式</div>
      </div>
      <div className={styles.mainContainer}>
        <div className={styles.bgmContainer}>
          {showBgmList}
        </div>
        <div className={styles.cgMain}>
          <div className={styles.cgContainer}>
            {showCgList}
          </div>
          <div className={styles.cgShowDiv}>
            {showNav}
          </div>
        </div>

      </div>
    </div>
    }</>;
}

function Random(min: number, max: number) {
  return Math.round(Math.random() * (max - min)) + min;
}
