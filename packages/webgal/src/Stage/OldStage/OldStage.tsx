// import styles from '@/Components/Stage/stage.module.scss';
// import { FigureContainer } from '@/Components/Stage/FigureContainer/FigureContainer';
// import { useEffect } from 'react';
// import { IEffect } from '@/store/stageInterface';
// import { useSelector } from 'react-redux';
// import { RootState } from '@/store/store';

export default function OldStage() {
  // const stageState = useSelector((state: RootState) => state.stage);
  // const oldBg = useSelector((state: RootState) => state.stageTemp.oldBg);
  // const oldBgKey = useSelector((state: RootState) => state.stageTemp.oldBgKey);
  //
  // /**
  //  * 设置效果
  //  */
  // useEffect(() => {
  //   const effectList: Array<IEffect> = stageState.effects;
  //   setTimeout(() => {
  //     effectList.forEach((effect) => {
  //       const target = document.getElementById(effect.target);
  //       if (target) {
  //         if (effect.filter !== '') {
  //           target.style.filter = effect.filter;
  //         }
  //         if (effect.transform !== '') {
  //           target.style.transform = effect.transform;
  //         }
  //       }
  //     });
  //   }, 100);
  // });
  //
  // let stageWidth = '100%';
  // let stageHeight = '100%';
  // let top = '0';
  // if (stageState.enableFilm !== '') {
  //   stageHeight = '76%';
  //   top = '12%';
  // }
  //
  // return (
  //   <div className={styles.MainStage_main_container} style={{ width: stageWidth, height: stageHeight, top: top }}>
  //     {oldBg !== '' && (
  //       <div
  //         key={'bgOld' + oldBg + oldBgKey}
  //         id="MainStage_bg_OldContainer"
  //         className={styles.MainStage_oldBgContainer}
  //         style={{
  //           backgroundImage: `url("${oldBg}")`,
  //           backgroundSize: 'cover',
  //         }}
  //       />
  //     )}
  //     <div
  //       key={'bgMain' + stageState.bgName}
  //       id="MainStage_bg_MainContainer"
  //       className={styles.MainStage_bgContainer}
  //       style={{
  //         backgroundImage: `url("${stageState.bgName}")`,
  //         backgroundSize: 'cover',
  //       }}
  //     />
  //     <FigureContainer />
  //   </div>
  // );
}
