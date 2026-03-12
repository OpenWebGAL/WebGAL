import { useEffect, useMemo, useRef, useCallback, SyntheticEvent } from 'react';
import { IIFrame } from '@/store/stageInterface';
import { RootState, webgalStore } from '@/store/store';
import { useSelector } from 'react-redux';
import { isEqual } from 'lodash';
import { ReactiveWatcher, WebGalAPI } from './interface';
import { setStageVar, stageActions } from '@/store/stageReducer';
import { setScriptManagedGlobalVar } from '@/store/userDataReducer';

export default function Iframe({ id, sandbox, src, width, height, wait, returnValue }: IIFrame) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const stage = useSelector((state: RootState) => state.stage, isEqual);
  const GUI = useSelector((state: RootState) => state.GUI, isEqual);
  const userData = useSelector((state: RootState) => state.userData, isEqual);
  const saveData = useSelector((state: RootState) => state.saveData, isEqual);

  const store = useMemo(() => ({ stage, GUI, userData, saveData }), [stage, GUI, userData, saveData]);

  const watchersRef = useRef<Map<number, ReactiveWatcher>>(new Map());
  const watcherIdRef = useRef(0);

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
    api.closeFrame = () => webgalStore.dispatch(stageActions.removeFrame(id));
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
    return api;
  }, [store, id, wait]);

  const onError = useCallback((e: SyntheticEvent<HTMLIFrameElement, Event>) => {
    console.error('iframe加载失败', e);
    // 加载失败，则移除该Frame
    webgalStore.dispatch(stageActions.removeFrame(id));
  }, []);

  if (!src) {
    return null;
  }

  const onLoad = useCallback(() => {
    if (iframeRef.current?.contentWindow) {
      Object.defineProperty(iframeRef.current.contentWindow, 'webgal', {
        value: apiInstance,
        configurable: true,
        enumerable: true,
      });
    }
  }, [apiInstance]);

  useEffect(() => {
    const iframe = iframeRef.current;
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
  }, []);

  return (
    <iframe
      ref={iframeRef}
      width={width}
      height={height}
      id={`iframe-${id}`}
      src={src}
      sandbox={sandbox}
      onError={onError}
      onLoad={onLoad}
    />
  );
}
