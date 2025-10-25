import { setFastButton, startFast, stopAll, stopFast } from '@/Core/controller/gamePlay/fastSkip';
import { nextSentence } from '@/Core/controller/gamePlay/nextSentence';
import { fastSaveGame } from '@/Core/controller/storage/fastSaveLoad';
import { setStorage } from '@/Core/controller/storage/storageController';
import { WebGAL } from '@/Core/WebGAL';
import { useGenSyncRef } from '@/hooks/useGenSyncRef';
import { useMounted, useUnMounted, useUpdated } from '@/hooks/useLifeCycle';
import { componentsVisibility, MenuPanelTag } from '@/store/guiInterface';
import { setVisibility } from '@/store/GUIReducer';
import { RootState } from '@/store/store';
import { setOptionData } from '@/store/userDataReducer';
import styles from '@/UI/Backlog/backlog.module.scss';
import throttle from 'lodash/throttle';
import { useCallback, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import useFullScreen from './useFullScreen';

// options备用
export interface HotKeyType {
  MouseRight: {} | boolean;
  MouseWheel: {} | boolean;
  Ctrl: boolean;
  Esc:
    | {
        href: string;
        nav: 'replace' | 'push';
      }
    | boolean;
  AutoSave: {} | boolean;
}

export interface Keyboard {
  lock: (keys: string[]) => Promise<void>;
  unlock: () => Promise<void>;
}

export const keyboard: Keyboard | undefined = 'keyboard' in navigator && (navigator.keyboard as any); // FireFox and Safari not support

// export const fastSaveGameKey = `FastSaveKey`;
// export const isFastSaveKey = `FastSaveActive`;

export function useHotkey(opt?: HotKeyType) {
  useMouseRightClickHotKey();
  useMouseWheel();
  useSkip();
  usePanic();
  useFastSaveBeforeUnloadPage();
  useSpaceAndEnter();
  useToggleFullScreen();
}

/**
 * 右键关闭 & 打开 菜单栏
 */
export function useMouseRightClickHotKey() {
  const GUIStore = useGenSyncRef((state: RootState) => state.GUI);
  const setComponentVisibility = useSetComponentVisibility();
  const isGameActive = useGameActive<typeof GUIStore>(GUIStore);
  const isInBackLog = useIsInBackLog<typeof GUIStore>(GUIStore);
  const isOpenedDialog = useIsOpenedDialog<typeof GUIStore>(GUIStore);
  const validMenuPanelTag = useValidMenuPanelTag<typeof GUIStore>(GUIStore);
  const isShowExtra = useIsOpenedExtra<typeof GUIStore>(GUIStore);
  const handleContextMenu = useCallback((ev: MouseEvent) => {
    if (isOpenedDialog()) {
      setComponentVisibility('showGlobalDialog', false);
      ev.preventDefault();
      return false;
    }
    if (isShowExtra()) {
      setComponentVisibility('showExtra', false);
    }
    if (isGameActive()) {
      setComponentVisibility('showTextBox', !GUIStore.current.showTextBox);
    }
    if (isInBackLog()) {
      setComponentVisibility('showBacklog', false);
      setComponentVisibility('showTextBox', true);
    }
    if (validMenuPanelTag()) {
      setComponentVisibility('showMenuPanel', false);
    }
    ev.preventDefault();
    return false;
  }, []);
  useMounted(() => {
    document.addEventListener('contextmenu', handleContextMenu);
  });
  useUnMounted(() => {
    document.removeEventListener('contextmenu', handleContextMenu);
  });
}

let wheelTimeout = setTimeout(() => {
  // 初始化，什么也不干
}, 0);

/**
 * 滚轮向上打开历史记录
 * 滚轮向下关闭历史记录
 * 滚轮向下下一句
 */
export function useMouseWheel() {
  const GUIStore = useGenSyncRef((state: RootState) => state.GUI);
  const setComponentVisibility = useSetComponentVisibility();
  const isGameActive = useGameActive(GUIStore);
  const isInBackLog = useIsInBackLog(GUIStore);
  const isPanicOverlayOpen = useIsPanicOverlayOpen(GUIStore);
  const next = useCallback(
    throttle(() => {
      nextSentence();
    }, 100),
    [],
  );
  // 防止一直往下滚的时候顺着滚出历史记录
  // 问就是抄的999
  const prevDownWheelTimeRef = useRef(0);
  const handleMouseWheel = useCallback((ev) => {
    if (isPanicOverlayOpen()) return;
    const direction =
      (ev.wheelDelta && (ev.wheelDelta > 0 ? 'up' : 'down')) ||
      (ev.detail && (ev.detail < 0 ? 'up' : 'down')) ||
      'down';
    const ctrlKey = ev.ctrlKey;
    const dom = document.querySelector(`.${styles.backlog_content}`);
    if (isGameActive() && direction === 'up' && !ctrlKey) {
      setComponentVisibility('showBacklog', true);
      setComponentVisibility('showTextBox', false);
    } else if (isInBackLog() && direction === 'down' && !ctrlKey) {
      if (dom) {
        let flag = hasScrollToBottom(dom);
        let curTime = new Date().getTime();
        // 滚动到底部 & 非连续滚动
        if (flag && curTime - prevDownWheelTimeRef.current > 100) {
          setComponentVisibility('showBacklog', false);
          setComponentVisibility('showTextBox', true);
        }
        prevDownWheelTimeRef.current = curTime;
      }
      // setComponentVisibility('showBacklog', false);
    } else if (isGameActive() && direction === 'down' && !ctrlKey) {
      clearTimeout(wheelTimeout);
      // 已开启快进模式
      if (WebGAL.gameplay.isFast) stopFast();
      WebGAL.gameplay.isFast = true;
      // 滚轮视作快进
      setFastButton(true);
      setTimeout(() => {
        WebGAL.gameplay.isFast = false;
        setFastButton(false);
      }, 150);
      next();
    }
  }, []);
  useMounted(() => {
    document.addEventListener('wheel', handleMouseWheel);
  });
  useUnMounted(() => {
    document.removeEventListener('wheel', handleMouseWheel);
  });
}

/**
 * Panic Button, use Esc and Backquote
 */
export function usePanic() {
  const panicButtonList = ['Escape', 'Backquote'];
  const isPanicButton = (ev: KeyboardEvent) =>
    !ev.isComposing && !ev.defaultPrevented && panicButtonList.includes(ev.code);
  const GUIStore = useGenSyncRef((state: RootState) => state.GUI);
  const isTitleShown = useCallback(() => GUIStore.current.showTitle, [GUIStore]);
  const isPanicOverlayOpen = useIsPanicOverlayOpen(GUIStore);
  const setComponentVisibility = useSetComponentVisibility();
  const handlePressPanicButton = useCallback((ev: KeyboardEvent) => {
    if (!isPanicButton(ev) || isTitleShown()) return;
    if (isPanicOverlayOpen()) {
      setComponentVisibility('showPanicOverlay', false);
      // todo: resume
    } else {
      setComponentVisibility('showPanicOverlay', true);
      stopAll(); // despite the name, it only disables fast mode and auto mode
      // todo: pause music & animation for better performance
    }
  }, []);
  useMounted(() => {
    document.addEventListener('keyup', handlePressPanicButton);
  });
  useUnMounted(() => {
    document.removeEventListener('keyup', handlePressPanicButton);
  });
}

/**
 * ctrl控制快进
 */
export function useSkip() {
  // 因为document事件只绑定一次 为了防止之后更新GUIStore时取不到最新值
  // 使用Ref共享GUIStore
  const GUIStore = useGenSyncRef((state: RootState) => state.GUI);
  // 判断是否位于标题 & 存读档，选项 & 回想等页面
  const isGameActive = useGameActive(GUIStore);
  // 判断按键是否为ctrl
  const isCtrlKey = useCallback((e) => e.keyCode === 17, []);
  const handleCtrlKeydown = useCallback((e) => {
    if (isCtrlKey(e) && isGameActive()) {
      startFast();
    }
  }, []);
  const handleCtrlKeyup = useCallback((e) => {
    if (isCtrlKey(e) && isGameActive()) {
      stopFast();
    }
  }, []);
  const handleWindowBlur = useCallback((e) => {
    // 停止快进
    stopFast();
  }, []);
  // mounted时绑定事件
  useMounted(() => {
    document.addEventListener('keydown', handleCtrlKeydown);
    document.addEventListener('keyup', handleCtrlKeyup);
    window.addEventListener('blur', handleWindowBlur);
  });
  // unmounted解绑
  useUnMounted(() => {
    document.removeEventListener('keydown', handleCtrlKeydown);
    document.removeEventListener('keyup', handleCtrlKeyup);
    window.removeEventListener('blur', handleWindowBlur);
  });
  // updated时验证状态
  useUpdated(() => {
    if (!isGameActive()) {
      stopFast();
    }
  });
}

/**
 * F5刷新 & 其他情况下导致页面卸载时快速保存
 */
export function useFastSaveBeforeUnloadPage() {
  const validMenuGameStart = useValidMenuGameStart();
  const handleWindowUnload = useCallback(async (e: BeforeUnloadEvent) => {
    if (validMenuGameStart()) {
      // 游戏启动了才保存数据 防止无效数据覆盖现在的数据
      await fastSaveGame();
    }
  }, []);
  useMounted(() => {
    window.addEventListener('beforeunload', handleWindowUnload);
  });
  useUnMounted(() => {
    window.removeEventListener('beforeunload', handleWindowUnload);
  });
}

// 判断游戏是否激活
function useGameActive<T = any>(GUIStore: T & any): () => boolean {
  return useCallback(() => {
    return (
      !GUIStore.current.showTitle &&
      !GUIStore.current.showMenuPanel &&
      !GUIStore.current.showBacklog &&
      !GUIStore.current.showPanicOverlay
    );
  }, [GUIStore]);
}

// 判断是否打开backlog
function useIsInBackLog<T = any>(GUIStore: T & any): () => boolean {
  return useCallback(() => {
    return GUIStore.current.showBacklog;
  }, [GUIStore]);
}

// 判断是否打开了全局对话框
function useIsOpenedDialog<T = any>(GUIStore: T & any): () => boolean {
  return useCallback(() => {
    return GUIStore.current.showGlobalDialog;
  }, [GUIStore]);
}

// 判断是否打开了鉴赏模式
function useIsOpenedExtra<T = any>(GUIStore: T & any): () => boolean {
  return useCallback(() => {
    return GUIStore.current.showExtra;
  }, [GUIStore]);
}

function useIsPanicOverlayOpen<T = any>(GUIStore: T & any): () => boolean {
  return useCallback(() => {
    return GUIStore.current.showPanicOverlay;
  }, [GUIStore]);
}

// 验证是否在存档 / 读档 / 选项页面
function useValidMenuPanelTag<T = any>(GUIStore: T & any): () => boolean {
  return useCallback(() => {
    return [MenuPanelTag.Save, MenuPanelTag.Load, MenuPanelTag.Option].includes(GUIStore.current.currentMenuTag);
  }, [GUIStore]);
}

function useValidMenuGameStart() {
  return useCallback(() => {
    // return !(runtime_currentSceneData.currentSentenceId === 0 &&
    //   runtime_currentSceneData.currentScene.sceneName === 'start.txt');
    return !(WebGAL.sceneManager.sceneData.currentSentenceId === 0);
  }, [WebGAL.sceneManager.sceneData]);
}

function useSetComponentVisibility(): (component: keyof componentsVisibility, visibility: boolean) => void {
  const dispatch = useDispatch();
  return (component: keyof componentsVisibility, visibility: boolean) => {
    dispatch(setVisibility({ component, visibility }));
  };
}

function nextTick(callback: () => void) {
  // 具体实现根据浏览器的兼容实现微任务
  if (typeof Promise !== 'undefined') {
    const p = Promise.resolve();
    p.then(callback);
  } else {
    // 兼容IE
    setTimeout(callback, 0);
  }
}

/**
 * 空格 & 回车 跳转到下一条
 */
export function useSpaceAndEnter() {
  const GUIStore = useGenSyncRef((state: RootState) => state.GUI);
  const isGameActive = useGameActive(GUIStore);
  const setComponentVisibility = useSetComponentVisibility();
  // 防止一直触发keydown导致快进
  const lockRef = useRef(false);
  // 判断按键是否为空格 & 回车
  const isSpaceOrEnter = useCallback((e) => {
    return e.keyCode === 32 || e.keyCode === 13;
  }, []);
  const handleKeydown = useCallback((e) => {
    if (isSpaceOrEnter(e) && isGameActive() && !lockRef.current) {
      if (!GUIStore.current.showTextBox) {
        setComponentVisibility('showTextBox', true);
        return;
      }
      stopAll();
      nextSentence();
      lockRef.current = true;
    }
  }, []);
  const handleKeyup = useCallback((e) => {
    if (isSpaceOrEnter(e) && isGameActive()) {
      lockRef.current = false;
    }
  }, []);
  const handleWindowBlur = useCallback((e) => {
    lockRef.current = false;
  }, []);
  // mounted时绑定事件
  useMounted(() => {
    document.addEventListener('keydown', handleKeydown);
    document.addEventListener('keyup', handleKeyup);
    document.addEventListener('blur', handleWindowBlur);
  });
  // unmounted解绑
  useUnMounted(() => {
    document.removeEventListener('keydown', handleKeydown);
    document.removeEventListener('keyup', handleKeyup);
    document.removeEventListener('blur', handleWindowBlur);
  });
}

/**
 * 是否滚动到底部
 * @param dom
 */
function hasScrollToBottom(dom: Element) {
  const { scrollTop, clientHeight, scrollHeight } = dom;
  return scrollTop === 0;
}

/**
 * F11 进入全屏
 */
function useToggleFullScreen() {
  const { isSupported, isFullScreen, toggle } = useFullScreen();
  if (!isSupported) return;
  const dispatch = useDispatch();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => e.repeat || (e.key === 'F11' && toggle());
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
  useEffect(() => {
    dispatch(setOptionData({ key: 'fullScreen', value: isFullScreen ? 0 : 1 }));
    if (WebGAL.gameKey) setStorage();
  }, [isFullScreen]);
}
