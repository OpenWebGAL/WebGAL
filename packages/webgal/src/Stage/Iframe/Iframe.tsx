import { useEffect, useMemo, useRef, useCallback, SyntheticEvent } from 'react';
import { IIFrame } from '@/store/stageInterface';
import { RootState, webgalStore } from '@/store/store';
import { useSelector } from 'react-redux';
import { isEqual } from 'lodash';
import { ReactiveWatcher, WebGalAPI, WebGalAPIEventsKeyNames } from './interface';
import { setStageVar, stageActions } from '@/store/stageReducer';
import { setScriptManagedGlobalVar } from '@/store/userDataReducer';
import { WebGAL } from '@/Core/WebGAL';
import { nextSentence as nextSentenceController } from '@/Core/controller/gamePlay/nextSentence';

export default function Iframe({ id, sandbox, src, width, height, wait, injectArgs }: IIFrame) {
  const idString = `iframe-${id}`;
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const stage = useSelector((state: RootState) => state.stage, isEqual);
  const GUI = useSelector((state: RootState) => state.GUI, isEqual);
  const userData = useSelector((state: RootState) => state.userData, isEqual);
  const saveData = useSelector((state: RootState) => state.saveData, isEqual);

  // 尝试从全局变量中恢复持久化数据
  useEffect(() => {
    const globalPersistentData = (window as any).__iframePersistentData;
    if (globalPersistentData?.has(id)) {
      const persistentData = globalPersistentData.get(id);
      webgalStore.dispatch(
        stageActions.updateIframePersistentData({
          id,
          persistentData,
        }),
      );
      // 恢复后从全局变量中删除
      globalPersistentData.delete(id);
    }
  }, [id]);

  const store = useMemo(() => ({ stage, GUI, userData, saveData }), [stage, GUI, userData, saveData]);

  const watchersRef = useRef<Map<number, ReactiveWatcher>>(new Map());
  const watcherIdRef = useRef(0);
  const eventsMap = useMemo(
    () => ({ save: WebGAL.events.save, load: WebGAL.events.load, sentence: WebGAL.events.userInteractNext }),
    [],
  );

  // 获取嵌套属性的值
  const getNestedValue = useCallback((obj: any, path: string) => {
    return path.split('.').reduce((acc, part) => acc?.[part], obj);
  }, []);

  // 获取当前值的函数
  const getValue = useCallback(
    (source: string | string[] | ((store: RootState) => any), state: RootState) => {
      const isFunction = typeof source === 'function';
      const isArray = Array.isArray(source);
      const isString = typeof source === 'string';

      if (isFunction) {
        return (source as (store: RootState) => any)(state);
      } else if (isArray) {
        const result: any = {};
        (source as string[]).forEach((key) => {
          result[key] = getNestedValue(state, key);
        });
        return result;
      } else if (isString) {
        return getNestedValue(state, source as string);
      }
      return state;
    },
    [getNestedValue],
  );

  // 检测所有watcher监听的值的变化
  const watchedValues = useSelector((state: RootState) => {
    const result: Record<number, any> = {};
    watchersRef.current.forEach((watcher, watcherId) => {
      result[watcherId] = getValue(watcher.source, state);
    });
    return result;
  }, isEqual);

  useEffect(() => {
    watchersRef.current.forEach((watcher, watcherId) => {
      const newValue = watchedValues[watcherId];
      const oldValue = watcher.oldValue;

      const hasChanged = !isEqual(newValue, oldValue);

      if (hasChanged) {
        watcher.callback(newValue, oldValue);
        // 更新watcher的oldValue
        watchersRef.current.set(watcherId, {
          ...watcher,
          oldValue: newValue,
        });
      }
    });
  }, [watchedValues]);

  const apiInstance = useMemo((): WebGalAPI => {
    const api: WebGalAPI = Object.create(null);
    // 获取响应式状态的方法
    api.getReactiveStore = (source, callback, options = {}) => {
      // 创建新的watcher ID
      const watcherId = watcherIdRef.current++;

      // 获取当前值
      const currentValue = getValue(source, store);

      // 添加watcher到列表
      watchersRef.current.set(watcherId, {
        source,
        callback,
        options,
        oldValue: currentValue,
      });

      // 立即执行回调函数
      if (options.immediate) {
        callback(currentValue, undefined);
      }

      // 返回取消订阅的函数
      return () => {
        watchersRef.current.delete(watcherId);
      };
    };
    // 获取特定状态的方法
    api.getStageState = () => store.stage;
    api.getGUIState = () => store.GUI;
    api.getUserData = () => store.userData;
    api.getSaveData = () => store.saveData;
    // 操作
    api.isBlockSentence = () => {
      let isBlockingNext = false;
      WebGAL.gameplay.performController.performList.forEach((e) => {
        if (e.blockingNext())
          // 阻塞且没有结束的演出
          isBlockingNext = true;
      });
      return isBlockingNext;
    };
    api.nextSentence = () => {
      // 触发下一句执行
      nextSentenceController();
    };
    // 事件
    api.on = (event: WebGalAPIEventsKeyNames, callback: (data?: any) => void) => {
      if (!eventsMap[event]) {
        console.error(`无效的事件类型: ${event}`);
        return;
      }
      eventsMap[event].on(callback);
    };
    api.off = (event: WebGalAPIEventsKeyNames, callback: (data?: any) => void) => {
      if (!eventsMap[event]) {
        console.error(`无效的事件类型: ${event}`);
        return;
      }
      eventsMap[event].off(callback);
    };
    api.closeIframe = (key?: string) => {
      if (key) {
        webgalStore.dispatch(stageActions.removeIframe({ id: key }));
      } else {
        webgalStore.dispatch(stageActions.removeIframe({ id }));
      }
    };
    api.openIframe = (key?: string) => {
      if (!key) {
        console.warn('openIframe 需要指定 iframe 的 key');
        return;
      }
      // 从 stage.iframes 中查找指定 key 的 iframe
      const iframe = stage.iframes.find((e) => e.id === key);
      if (!iframe) {
        console.error(`找不到 id 为 ${key} 的 iframe`);
        return;
      }
      // 如果 iframe 已经存在且被关闭，则重新添加到 iframes 列表中
      const existingIndex = stage.iframes.findIndex((e) => e.id === key);
      if (existingIndex === -1) {
        webgalStore.dispatch(stageActions.addIframe(iframe));
      }
    };
    api.getGameVar = (key: string) => store.stage.GameVar[key];
    api.getGlobalGameVar = (key: string) => store.userData.globalGameVar[key];
    api.setGameVar = (key: string, value: any) => webgalStore.dispatch(setStageVar({ key, value }));
    api.setGlobalGameVar = (key: string, value: any) => webgalStore.dispatch(setScriptManagedGlobalVar({ key, value }));
    api.complete = (returnValue?: any) => {
      if (wait) {
        window.parent.postMessage(
          {
            type: 'webgal-frame-complete',
            frameId: id,
            returnValue,
          },
          window.location.origin, // 使用当前页面的源
        );
      }
    };
    // 持久化数据方法
    api.getPersistentData = (key?: string) => {
      const iframe = stage.iframes.find((e) => e.id === id);
      if (!iframe?.persistentData) {
        return key ? undefined : {};
      }
      return key ? iframe.persistentData[key] : iframe.persistentData;
    };
    api.setPersistentData = (key: string, value: any) => {
      const iframe = stage.iframes.find((e) => e.id === id);
      if (!iframe) {
        console.error(`找不到id为${id}的iframe`);
        return;
      }
      const currentData = iframe.persistentData || {};
      webgalStore.dispatch(
        stageActions.updateIframePersistentData({
          id,
          persistentData: { ...currentData, [key]: value },
        }),
      );
    };
    api.clearPersistentData = (key?: string) => {
      const iframe = stage.iframes.find((e) => e.id === id);
      if (!iframe) {
        console.error(`找不到id为${id}的iframe`);
        return null;
      }
      if (key) {
        // 清除指定key的数据
        if (iframe.persistentData?.[key]) {
          const newData = { ...iframe.persistentData };
          delete newData[key];
          webgalStore.dispatch(
            stageActions.updateIframePersistentData({
              id,
              persistentData: newData,
            }),
          );
        }
      } else {
        // 清除所有持久化数据
        webgalStore.dispatch(
          stageActions.updateIframePersistentData({
            id,
            persistentData: {},
          }),
        );
      }
    };
    return api;
  }, [store, id, wait]);

  const onError = useCallback((e: SyntheticEvent<HTMLIFrameElement, Event>) => {
    console.error('iframe加载失败', e);
    // 加载失败，则移除该iframe
    webgalStore.dispatch(stageActions.removeIframe({ id }));
  }, []);

  if (!src || !id) {
    return null;
  }

  useEffect(() => {
    const iframe = iframeRef.current;
    if (iframeRef.current?.contentWindow) {
      // 将apiInstance注入到window.webgal
      Object.defineProperty(iframeRef.current.contentWindow, 'webgal', {
        value: apiInstance,
        configurable: true,
        enumerable: true,
      });

      // 将injectArgs注入到window.webgal.params
      if (injectArgs && Object.keys(injectArgs).length > 0) {
        Object.defineProperty(apiInstance, 'params', {
          value: injectArgs,
          configurable: true,
          enumerable: true,
        });
      }
    }
    return () => {
      if (iframe?.contentWindow) {
        try {
          delete (iframe.contentWindow as any).webgal;
        } catch (e) {
          // If the iframe has navigated to a different origin, this will fail.
          // This is expected and can be ignored.
        }
      }
    };
  }, [injectArgs]);

  return (
    <iframe
      ref={iframeRef}
      id={idString}
      src={src}
      sandbox={sandbox}
      onError={onError}
      data-frame-id={idString}
      style={{
        width,
        height,
      }}
    />
  );
}
