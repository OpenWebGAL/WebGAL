import { IIFrame } from '@/store/stageInterface';
import { RootState } from '@/store/store';
import { useEffect, useMemo, useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { isEqual } from 'lodash';

export default function Iframe({ id, sandbox, src, width, height }: IIFrame) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const stage = useSelector((state: RootState) => state.stage, isEqual);
  const GUI = useSelector((state: RootState) => state.GUI, isEqual);
  const userData = useSelector((state: RootState) => state.userData, isEqual);
  const saveData = useSelector((state: RootState) => state.saveData, isEqual);

  const store = useMemo(() => ({ stage, GUI, userData, saveData }), [stage, GUI, userData, saveData]);

  const watchersRef = useRef<
    Map<
      number,
      {
        source: string | string[] | ((store: RootState) => any);
        callback: (newValue: any, oldValue: any) => void;
        options: { immediate?: boolean; deep?: boolean };
        oldValue: any;
      }
    >
  >(new Map());
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

  const apiInstance = useMemo(() => {
    const api = Object.create(null);
    // 获取响应式状态的方法
    api.getReactiveStore = (
      source: string | string[] | ((store: RootState) => any),
      callback: (newValue: any, oldValue: any) => void,
      options: { immediate?: boolean; deep?: boolean } = {},
    ) => {
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
    // 获取变量
    api.getGameVar = (key: string) => store.stage.GameVar[key];
    api.getGlobalGameVar = (key: string) => store.userData.globalGameVar[key];
    return api;
  }, [store]);

  if (!src) {
    return null;
  }

  useEffect(() => {
    if (iframeRef.current) {
      const contentWindow = iframeRef.current.contentWindow;
      Object.defineProperty(contentWindow, 'webgal', {
        value: apiInstance,
        configurable: true,
        enumerable: true,
      });
    }
    return () => {
      if (iframeRef.current) {
        const contentWindow = iframeRef.current.contentWindow;
        delete (contentWindow as any).webgal;
      }
    };
  }, [apiInstance]);

  return <iframe ref={iframeRef} width={width} height={height} id={`iframe-${id}`} src={src} sandbox={sandbox} />;
}
