import styles from './backlog.module.scss';
import { CloseSmall, Return, VolumeNotice } from '@icon-park/react';
import { jumpFromBacklog } from '@/Core/controller/storage/jumpFromBacklog';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, webgalStore } from '@/store/store';
import { setVisibility } from '@/store/GUIReducer';
import { logger } from '@/Core/util/logger';
import { ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import useTrans from '@/hooks/useTrans';
import { compileSentence, EnhancedNode } from '@/Stage/TextBox/TextBox';
import useSoundEffect from '@/hooks/useSoundEffect';
import { WebGAL } from '@/Core/WebGAL';
import useApplyStyle from '@/hooks/useApplyStyle';
import { useDelayedVisibility } from '@/hooks/useDelayedVisibility';

export const Backlog = () => {
  const t = useTrans('gaming.');
  // logger.info('Backlog render');
  const { playSeEnter, playSeClick } = useSoundEffect();
  const GUIStore = useSelector((state: RootState) => state.GUI);
  const userData = useSelector((state: RootState) => state.userData);
  const isBacklogOpen = GUIStore.showBacklog;
  const dispatch = useDispatch();
  const applyStyle = useApplyStyle('UI/Backlog/backlog.scss');
  const [isDisableScroll, setIsDisableScroll] = useState(false);
  const [limit, setLimit] = useState(20);
  useEffect(() => {
    if (!isBacklogOpen) {
      return;
    }
    let options = {
      root: null,
      rootMargin: '0px',
      threshold: [1.0],
    };

    let observer = new IntersectionObserver((entries) => {
      if ((entries?.[0]?.intersectionRatio ?? 0) <= 0) return;
      setLimit(limit + 20);
    }, options);

    const observeTarget = document.querySelector(`#backlog_item_${limit - 5}`);
    if (observeTarget) {
      observer.observe(observeTarget);
    }

    return () => {
      observer.disconnect();
    };
  }, [limit, isBacklogOpen]);

  useEffect(() => {
    if (!isBacklogOpen) {
      setLimit(20);
    }
  }, [isBacklogOpen]);

  // 缓存一下vdom
  const backlogList = useMemo<any>(() => {
    let backlogs = [];
    const current_backlog_len = WebGAL.backlogManager.getBacklog().length;
    // logger.info('backlogList render');
    for (let i = 0; i < Math.min(current_backlog_len, limit); i++) {
      const indexOfBacklog = current_backlog_len - i - 1;
      const backlogItem = WebGAL.backlogManager.getBacklog()[indexOfBacklog];
      const showTextArray = compileSentence(backlogItem.currentStageState.showText, false);
      const showTextArray2 = showTextArray.map((line) => {
        return line.map((c) => {
          return c.reactNode;
        });
      });
      const showTextArrayReduced = mergeStringsAndKeepObjects(showTextArray2);
      const showTextElementList = showTextArrayReduced.map((line, index) => {
        return (
          <div
            key={`backlog-line-${index}`}
            className={applyStyle('backlog_item_content_text', styles.backlog_item_content_text)}
          >
            {line.map((e, index) => {
              if (e === '<br />') {
                return <br key={`br${index}`} />;
              } else {
                return e;
              }
            })}
          </div>
        );
      });
      const showNameArray = compileSentence(backlogItem.currentStageState.showName);
      const showNameArray2 = showNameArray.map((line) => {
        return line.map((c) => {
          return c.reactNode;
        });
      });
      const showNameArrayReduced = mergeStringsAndKeepObjects(showNameArray2);
      const nameElementList = showNameArrayReduced.map((line, index) => {
        return (
          <div
            key={`backlog-line-${index}`}
            className={applyStyle('backlog_item_content_speaker', styles.backlog_item_content_speaker)}
          >
            {line.map((e, index) => {
              if (e === '<br />') {
                return <br key={`br${index}`} />;
              } else {
                return e;
              }
            })}
          </div>
        );
      });
      const singleBacklogView = (
        <div
          className={applyStyle('styles.backlog_item', styles.backlog_item)}
          id={`backlog_item_${i}`}
          style={{ ['--backlog-item-index' as any]: `${i}` }}
          key={'backlogItem' + backlogItem.currentStageState.showText + backlogItem.saveScene.currentSentenceId}
        >
          <div className={applyStyle('backlog_item_button_list', styles.backlog_item_button_list)}>
            <div
              onClick={(e) => {
                playSeClick();
                jumpFromBacklog(indexOfBacklog);
                e.preventDefault();
                e.stopPropagation();
              }}
              onMouseEnter={playSeEnter}
              className={applyStyle('backlog_item_button', styles.backlog_item_button)}
            >
              <Return strokeWidth={4} />
            </div>
            {backlogItem.currentStageState.vocal ? (
              <div
                onClick={() => {
                  playSeClick();
                  // 获取到播放 backlog 语音的元素
                  const backlog_audio_element: any = document.getElementById(
                    'backlog_audio_play_element_' + indexOfBacklog,
                  );
                  if (backlog_audio_element) {
                    backlog_audio_element.currentTime = 0;
                    const userDataStore = webgalStore.getState().userData;
                    const mainVol = userDataStore.optionData.volumeMain;
                    backlog_audio_element.volume = mainVol * 0.01 * userDataStore.optionData.vocalVolume * 0.01;
                    backlog_audio_element?.play();
                  }
                }}
                onMouseEnter={playSeEnter}
                className={applyStyle('backlog_item_button', styles.backlog_item_button)}
              >
                <VolumeNotice strokeWidth={4} />
              </div>
            ) : null}
          </div>
          <div className={applyStyle('backlog_item_content', styles.backlog_item_content)}>
            <div
              className={applyStyle(
                'backlog_item_content_speaker_container',
                styles.backlog_item_content_speaker_container,
              )}
            >
              {nameElementList}
            </div>
            <div
              className={applyStyle('backlog_item_content_text_container', styles.backlog_item_content_text_container)}
            >
              {showTextElementList}
            </div>
          </div>
          <audio id={'backlog_audio_play_element_' + indexOfBacklog} src={backlogItem.currentStageState.vocal} />
        </div>
      );
      backlogs.push(singleBacklogView);
    }
    return backlogs;
  }, [
    WebGAL.backlogManager.getBacklog()[WebGAL.backlogManager.getBacklog().length - 1]?.saveScene?.currentSentenceId ??
      0,
    limit,
  ]);

  useEffect(() => {
    /* 切换为展示历史记录时触发 */
    // 清除延迟定时器
    if (GUIStore.showBacklog) {
      // 向上滑动触发回想时会带着backlog一起滑一下 我也不知道为什么，可能是我的鼠标问题 所以先ban掉滚动
      setIsDisableScroll(true);
      // nextTick开启滚动
      setTimeout(() => {
        setIsDisableScroll(false);
      }, 0);
    }
  }, [GUIStore.showBacklog]);

  // 退场时延迟隐藏
  const delayedShowBacklog = useDelayedVisibility(GUIStore.showBacklog);

  return (
    <>
      {delayedShowBacklog && (
        <div
          className={`${applyStyle('backlog_main', styles.backlog_main)} ${
            GUIStore.showBacklog ? '' : applyStyle('backlog_main_hide', styles.backlog_main_hide)
          }`}
          style={{ ['--ui-transition-duration' as any]: `${userData.optionData.uiTransitionDuration}ms` }}
        >
          <div className={applyStyle('backlog_bar', styles.backlog_bar)}>
            <CloseSmall
              className={applyStyle('backlog_bar_close_button', styles.backlog_bar_close_button)}
              onClick={() => {
                playSeClick();
                dispatch(setVisibility({ component: 'showBacklog', visibility: false }));
                dispatch(setVisibility({ component: 'showTextBox', visibility: true }));
              }}
              onMouseEnter={playSeEnter}
              theme="outline"
              strokeWidth={3}
            />
            <div className={applyStyle('backlog_title', styles.backlog_title)}>{t('buttons.backlog')}</div>
          </div>
          <div
            className={`${applyStyle('backlog_content', styles.backlog_content)} ${
              isDisableScroll ? applyStyle('backlog_main_disable_scroll', styles.backlog_main_disable_scroll) : ''
            }`}
          >
            {backlogList}
          </div>
        </div>
      )}
    </>
  );
};

export function mergeStringsAndKeepObjects(arr: ReactNode[]): ReactNode[][] {
  let result = [];
  let currentString = '';

  // eslint-disable-next-line @typescript-eslint/prefer-for-of
  for (let i = 0; i < arr.length; i++) {
    const currentItem = arr[i];

    if (typeof currentItem === 'string') {
      currentString += currentItem;
    } else {
      if (currentString !== '') {
        result.push(currentString);
        currentString = '';
      }
      result.push(currentItem);
    }
  }

  if (currentString !== '') {
    result.push(currentString);
  }

  return result as ReactNode[][];
}
