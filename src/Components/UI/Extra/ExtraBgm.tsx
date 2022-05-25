import {useSelector} from "react-redux";
import {RootState} from "@/Core/store/store";
import React from "react";
import styles from "@/Components/UI/Extra/extra.module.scss";
import {useObject} from "@/hooks/useObject";

export function ExtraBgm() {
  const extraState = useSelector((state: RootState) => state.userData.appreciationData);
  const currentPlayingBgmName = useObject('');
  const showBgmList = extraState.bgm.map(e => {
    let className = styles.bgmElement;
    if (e.name === currentPlayingBgmName.value) {
      className = className + ' ' + styles.bgmElement_active;
    }
    return <div onClick={() => currentPlayingBgmName.set(e.name)} key={e.name} className={className}>
      {e.name}
    </div>;
  });
  return <div className={styles.bgmContainer}>
    {showBgmList}
  </div>;
}
