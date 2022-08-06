import styles from './backlog.module.scss';
import {runtime_currentBacklog} from '@/Core/runtime/backlog';
import {CloseSmall, Return, VolumeNotice} from '@icon-park/react';
import {jumpFromBacklog} from '@/Core/controller/storage/jumpFromBacklog';
import {useDispatch, useSelector} from "react-redux";
import {RootState, webgalStore} from '@/store/store';
import {setVisibility} from "@/store/GUIReducer";
import {logger} from "@/Core/util/etc/logger";
import React, {useEffect, useMemo, useRef, useState} from "react";
import {NodeJS} from "timers";


export const Backlog = () => {
  // logger.info('Backlog render');
  const GUIStore = useSelector((state: RootState) => state.GUI);
  const backlogList = [];
  const dispatch = useDispatch();
  const [indexHide, setIndexHide] = useState(false);
  let timeRef = useRef<NodeJS.Timeout>();
  useEffect(() => {
    // 切换为展示历史记录
    if (GUIStore.showBacklog) {
      // 立即清除 防止快速切换后定时器还会执行
      if (timeRef.current) {
        clearTimeout(timeRef.current);
      }
      setIndexHide(false);
    } else {
      // 隐藏历史记录
      timeRef.current = setTimeout(() => {
        setIndexHide(true);
        timeRef.current = null;
        // 700是和动画一样的延时 保险起见多个80ms
      }, 700 + 80)
    }
  }, [GUIStore.showBacklog]);
  // @todo lazy-load
  for (let i = 0; i < runtime_currentBacklog.length; i++) {
    const backlogItem = runtime_currentBacklog[i];
    const singleBacklogView = (
      <div
        className={styles.backlog_item}
        style={{animationDelay: `${20 * (runtime_currentBacklog.length - i)}ms`}}
        key={'backlogItem' + backlogItem.currentStageState.showText + backlogItem.saveScene.currentSentenceId}
      >
        <div className={styles.backlog_func_area}>
          {backlogItem.currentStageState.showName !== '' && <div className={styles.backlog_item_content_name}>
            {backlogItem.currentStageState.showName}
            {/* {backlogItem.currentStageState.showName === '' ? '' : '：'} */}
          </div>}
          <div className={styles.backlog_item_button_list}>
            <div
              onClick={(e) => {
                jumpFromBacklog(i);
                e.preventDefault();
                e.stopPropagation();
              }}
              className={styles.backlog_item_button_element}
            >
              <Return theme="outline" size="23" fill="#ffffff" strokeWidth={3}/>
            </div>
            <div onClick={() => {
              // 获取到播放 backlog 语音的元素
              const backlog_audio_element: any = document.getElementById('backlog_audio_play_element_' + i);
              if (backlog_audio_element) {
                backlog_audio_element.currentTime = 0;
                const userDataStore = webgalStore.getState().userData;
                const mainVol = userDataStore.optionData.volumeMain;
                backlog_audio_element.volume = mainVol * 0.01 * userDataStore.optionData.vocalVolume * 0.01;
                backlog_audio_element.play();
              }
            }} className={styles.backlog_item_button_element}>
              <VolumeNotice theme="outline" size="23" fill="#ffffff" strokeWidth={3}/>
            </div>
          </div>
        </div>
        <div className={styles.backlog_item_content}>
          <span className={styles.backlog_item_content_text}>{backlogItem.currentStageState.showText}</span>
        </div>
        <audio id={'backlog_audio_play_element_' + i} src={backlogItem.currentStageState.vocal}/>
      </div>
    );
    backlogList.unshift(singleBacklogView);
  }
  return (
    <>
      {(
        // ${indexHide ? styles.Backlog_main_out_IndexHide : ''}
        <div className={`${GUIStore.showBacklog ? styles.Backlog_main : styles.Backlog_main_out} ${indexHide ? styles.Backlog_main_out_IndexHide : ''}`}>
          <div className={styles.backlog_top}>
            <CloseSmall
              className={styles.backlog_top_icon}
              onClick={() => {
                dispatch(setVisibility({component: 'showBacklog', visibility: false}));
                dispatch(setVisibility({component: 'showTextBox', visibility: true}));
              }}
              theme="outline"
              size="4em"
              fill="#ffffff"
              strokeWidth={3}
            />
            <div className={styles.backlog_title} onClick={() => {
              logger.info('Rua! Testing');
            }}>回想</div>
          </div>
          <div className={styles.backlog_content}>{backlogList}</div>
        </div>
      )}
    </>
  );
};
