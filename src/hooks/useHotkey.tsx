import {useGenSyncRef} from "@/hooks/useGenSyncRef";
import {RootState, webgalStore} from "@/store/store";
import {useMounted, useUnMounted, useUpdated} from "@/hooks/useLifeCycle";
import {useCallback, useRef} from "react";
import {componentsVisibility, MenuPanelTag} from "@/interface/stateInterface/guiInterface";
import {setVisibility} from "@/store/GUIReducer";
import {useDispatch} from "react-redux";
import {startFast, stopAll, stopFast} from "@/Core/controller/gamePlay/fastSkip";
import cloneDeep from "lodash/cloneDeep";
import {ISaveData} from "@/interface/stateInterface/userDataInterface";
import {generateCurrentStageData} from "@/Core/controller/storage/saveGame";
import {loadGameFromStageData} from "@/Core/controller/storage/loadGame";
import {gameInfo} from "@/Core/runtime/etc";
import {logger} from "@/Core/util/etc/logger";
import {runtime_currentSceneData} from "@/Core/runtime/sceneData";
import {nextSentence} from "@/Core/controller/gamePlay/nextSentence";
import {setFastSave} from "@/store/userDataReducer";
import {getStorageAsync, setStorageAsync} from "@/Core/controller/storage/storageController";

// options备用
export interface HotKeyType {
  MouseRight: {} | boolean,
  MouseWheel: {} | boolean,
  Ctrl: boolean,
  Esc: {
    href: string,
    nav: 'replace' | 'push'
  } | boolean,
  AutoSave: {} | boolean
}

export let fastSaveGameKey = '';
export let isFastSaveKey = '';
let lock = true;

export function initKey() {
  lock = false;
  fastSaveGameKey = `FastSaveKey-${gameInfo.gameName}-${gameInfo.gameKey}`;
  isFastSaveKey = `FastSaveActive-${gameInfo.gameName}-${gameInfo.gameKey}`;
}

// export const fastSaveGameKey = `FastSaveKey`;
// export const isFastSaveKey = `FastSaveActive`;

export function useHotkey(opt?: HotKeyType) {
  useMouseRightClickHotKey();
  useMouseWheel();
  useSkip();
  useEscape();
  useFastSaveBeforeUnloadPage();
  useSpaceAndEnter();

}

/**
 * 右键关闭 & 打开 菜单栏
 */
export function useMouseRightClickHotKey() {
  const GUIStore = useGenSyncRef((state: RootState) => state.GUI);
  const setComponentVisibility = useSetComponentVisibility();
  const isGameActive = useGameActive<typeof GUIStore>(GUIStore);
  const isInBackLog = useIsInBackLog<typeof GUIStore>(GUIStore);
  const validMenuPanelTag = useValidMenuPanelTag<typeof GUIStore>(GUIStore);
  const handleContextMenu = useCallback((ev: MouseEvent) => {
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

/**
 * 滚轮向上打开历史记录
 */
export function useMouseWheel() {
  const GUIStore = useGenSyncRef((state: RootState) => state.GUI);
  const setComponentVisibility = useSetComponentVisibility();
  const isGameActive = useGameActive(GUIStore);
  const handleMouseWheel = useCallback((ev) => {
    const direction = (ev.wheelDelta && (ev.wheelDelta > 0 ? "up" : "down")) || (ev.detail && (ev.detail < 0 ? "up" : "down")) || "down";
    const ctrlKey = ev.ctrlKey;
    if (isGameActive() && (direction === 'up') && !ctrlKey) {
      setComponentVisibility('showBacklog', true);
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
 * 我真的不是二次元
 * 按ESC紧急回避
 * 立即卸载#app & 跳转到度娘 & 移除历史记录
 * @todo 自定义URL
 */
export function useEscape() {
  const isEscKey = useCallback((e) => e.keyCode === 27, []);
  const GUIStore = useGenSyncRef((state: RootState) => state.GUI);
  const gameActive = useGameActive(GUIStore);
  const lockRef = useRef(false);
  const navigate = useCallback((url: string) => {
    // 简单加个延时 防止没保存完就跳走了
    setTimeout(() => {
      location.replace(url);
    }, 100);
  }, []);
  const handlePressEsc = useCallback((e) => {
    if (isEscKey(e)) {
      nextTick(async () => {
        lockRef.current = true;
        // document.body.innerText = '';
        if (gameActive()) {
          try {
            document.body.innerText = '';
            await fastSaveGame();
          } catch (e) {
            logger.error('保存失败', e);
          }
          logger.info('保存完成');
        } else {
          logger.info('游戏未激活 直接退出');
        }
      });
      navigate('https://baidu.com');
    }
  }, []);
  useMounted(() => {
    document.addEventListener('keydown', handlePressEsc);
  });
  useUnMounted(() => {
    document.removeEventListener('keydown', handlePressEsc);
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
    return (!GUIStore.current.showTitle)
      && (!GUIStore.current.showMenuPanel)
      && (!GUIStore.current.showBacklog);
  }, [GUIStore]);
}

// 判断是否打开backlog
function useIsInBackLog<T = any>(GUIStore: T & any): () => boolean {
  return useCallback(() => {
    return (GUIStore.current.showBacklog);
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
    return !(runtime_currentSceneData.currentSentenceId === 0);
  }, [runtime_currentSceneData]);
}

function useSetComponentVisibility(): (component: (keyof componentsVisibility), visibility: boolean) => void {
  const dispatch = useDispatch();
  return (component: (keyof componentsVisibility), visibility: boolean) => {
    dispatch(setVisibility({component, visibility}));
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
 * 用于紧急回避时的数据存储 & 快速保存
 */
export async function fastSaveGame() {
  const saveData: ISaveData = generateCurrentStageData(-1);
  const newSaveData = cloneDeep(saveData);
  // localStorage.setItem(fastSaveGameKey, JSON.stringify(newSaveData));
  // localStorage.setItem(isFastSaveKey, JSON.stringify(true));
  // localStorage.setItem('currentSentenceId', JSON.stringify(runtime_currentSceneData.currentSentenceId));
  // await localforage.setItem(fastSaveGameKey, newSaveData);
  // await localforage.setItem(isFastSaveKey, true);
  webgalStore.dispatch(setFastSave(newSaveData));
  await setStorageAsync();
}

/**
 * 判断是否有无存储紧急回避时的数据
 */
export async function hasFastSaveRecord() {
  // return await localforage.getItem(isFastSaveKey);
  await getStorageAsync();
  return webgalStore.getState().userData.quickSaveData !== null;
}

/**
 * 加载紧急回避时的数据
 */
export async function loadFastSaveGame() {
  // 获得存档文件
  // const loadFile: ISaveData | null = await localforage.getItem(fastSaveGameKey);
  await getStorageAsync();
  const loadFile: ISaveData | null = webgalStore.getState().userData.quickSaveData;
  if (!loadFile) {
    return;
  }
  loadGameFromStageData(loadFile);
}

/**
 * 移除紧急回避的数据
 */
export async function removeFastSaveGameRecord() {
  webgalStore.dispatch(setFastSave(null));
  await setStorageAsync();
  // await localforage.setItem(isFastSaveKey, false);
  // await localforage.setItem(fastSaveGameKey, null);
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
    return (e.keyCode === 32) || (e.keyCode === 13);
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
