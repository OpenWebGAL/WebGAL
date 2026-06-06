import { useEffect, useMemo, useRef, useCallback, SyntheticEvent } from 'react';
import { RootState, webgalStore } from '@/store/store';
import { useSelector } from 'react-redux';
import { isEqual } from 'lodash';
import { WebGalAPI, WebGalAPIEventsKeyNames } from './interface';
import { setScriptManagedGlobalVar } from '@/store/userDataReducer';
import { WebGAL } from '@/Core/WebGAL';
import { nextSentence as nextSentenceController } from '@/Core/controller/gamePlay/nextSentence';
import { IIFrame } from '@/Core/Modules/stage/stageInterface';
import { stageStateManager } from '@/Core/Modules/stage/stageStateManager';
import { useStageState } from '@/hooks/useStageState';

export default function Iframe({ id, sandbox, src, width, height, wait, injectArgs, style }: IIFrame) {
  const idString = `iframe-${id}`;
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const GUI = useSelector((state: RootState) => state.GUI, isEqual);
  const userData = useSelector((state: RootState) => state.userData, isEqual);
  const saveData = useSelector((state: RootState) => state.saveData, isEqual);
  const stage = useStageState();

  useEffect(() => {
    const globalPersistentData = (window as any).__iframePersistentData;
    if (globalPersistentData?.has(id)) {
      const persistentData = globalPersistentData.get(id);
      stageStateManager.updateIframePersistentData({ id, persistentData });
      globalPersistentData.delete(id);
    }
  }, [id]);

  const store = useMemo(() => ({ stage, GUI, userData, saveData }), [stage, GUI, userData, saveData]);
  const storeRef = useRef(store);
  storeRef.current = store;

  const eventsMap = useMemo(
    () => ({ save: WebGAL.events.save, load: WebGAL.events.load, sentence: WebGAL.events.userInteractNext }),
    [],
  );

  const apiRef = useRef<WebGalAPI | null>(null);
  if (!apiRef.current) {
    const api: WebGalAPI = Object.create(null);

    const getNestedValue = (obj: any, path: string) =>
      path.split('.').reduce((acc: any, part: string) => acc?.[part], obj);

    const getValue = (source: string | string[] | ((store: RootState) => any), state: RootState) => {
      const isFunction = typeof source === 'function';
      const isArray = Array.isArray(source);
      const isString = typeof source === 'string';
      if (isFunction) return (source as (store: RootState) => any)(state);
      if (isArray) {
        const result: any = {};
        (source as string[]).forEach((key: string) => {
          result[key] = getNestedValue(state, key);
        });
        return result;
      }
      if (isString) return getNestedValue(state, source as string);
      return state;
    };

    const watchers: Record<string, any> = {};
    (api as any)._watchers = watchers;

    api.getReactiveStore = (source, callback, options = {}) => {
      const watcherId = Date.now() + Math.random();
      const currentValue = getValue(source, storeRef.current);
      watchers[watcherId] = {
        source,
        callback,
        options,
        oldValue: currentValue,
      };
      if (options.immediate) callback(currentValue, undefined);
      return () => {
        delete watchers[watcherId];
      };
    };

    api.getStageState = () => storeRef.current.stage;
    api.getGUIState = () => storeRef.current.GUI;
    api.getUserData = () => storeRef.current.userData;
    api.getSaveData = () => storeRef.current.saveData;

    api.isBlockSentence = () => {
      let isBlockingNext = false;
      WebGAL.gameplay.performController.performList.forEach((e) => {
        if (e.blockingNext()) isBlockingNext = true;
      });
      return isBlockingNext;
    };
    api.nextSentence = () => nextSentenceController();

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
      if (key) stageStateManager.removeIframe({ id: key });
      else stageStateManager.removeIframe({ id });
    };
    api.openIframe = (key?: string) => {
      if (!key) {
        console.warn('openIframe 需要指定 iframe 的 key');
        return;
      }
      const iframe = storeRef.current.stage.iframes.find((e: any) => e.id === key);
      if (!iframe) {
        console.error(`找不到 id 为 ${key} 的 iframe`);
        return;
      }
      const existingIndex = storeRef.current.stage.iframes.findIndex((e: any) => e.id === key);
      if (existingIndex === -1) stageStateManager.addIframe(iframe);
    };

    api.getGameVar = (key: string) => storeRef.current.stage.GameVar[key];
    api.getGlobalGameVar = (key: string) => storeRef.current.userData.globalGameVar[key];
    api.setGameVar = (key: string, value: any) => stageStateManager.setStageVarAndCommit({ key, value });
    api.setGlobalGameVar = (key: string, value: any) => webgalStore.dispatch(setScriptManagedGlobalVar({ key, value }));

    api.complete = (returnValue?: any) => {
      if (wait) {
        window.parent.postMessage(
          {
            type: 'webgal-frame-complete',
            frameId: id,
            returnValue,
          },
          window.location.origin,
        );
      }
    };

    api.getPersistentData = (key?: string) => {
      const iframe = storeRef.current.stage.iframes.find((e: any) => e.id === id);
      if (!iframe?.persistentData) return key ? undefined : {};
      return key ? iframe.persistentData[key] : iframe.persistentData;
    };
    api.setPersistentData = (key: string, value: any) => {
      const iframe = storeRef.current.stage.iframes.find((e: any) => e.id === id);
      if (!iframe) {
        console.error(`找不到id为${id}的iframe`);
        return;
      }
      const currentData = iframe.persistentData || {};
      stageStateManager.updateIframePersistentData({
        id,
        persistentData: { ...currentData, [key]: value },
      });
    };
    api.clearPersistentData = (key?: string) => {
      const iframe = storeRef.current.stage.iframes.find((e: any) => e.id === id);
      if (!iframe) {
        console.error(`找不到id为${id}的iframe`);
        return null;
      }
      if (key) {
        if (iframe.persistentData?.[key]) {
          const newData = { ...iframe.persistentData };
          delete newData[key];
          stageStateManager.updateIframePersistentData({
            id,
            persistentData: newData,
          });
        }
      } else {
        stageStateManager.updateIframePersistentData({ id, persistentData: {} });
      }
    };
    api.postIframeMessage = (key: string, data?: any) => {
      const targetIframe = storeRef.current.stage.iframes.find((e: any) => e.id === key);
      if (!targetIframe) {
        console.error(`找不到id为${key}的iframe`);
        return;
      }
      const targetIframeElement = document.getElementById(`iframe-${key}`) as HTMLIFrameElement;
      if (!targetIframeElement) {
        console.error(`找不到id为iframe-${key}的iframe元素`);
        return;
      }
      try {
        targetIframeElement.contentWindow?.postMessage(
          {
            type: 'webgal-iframe-message',
            sourceId: id,
            data,
          },
          window.location.origin,
        );
      } catch (e) {
        console.error(`向iframe ${key} 发送消息失败:`, e);
      }
    };

    apiRef.current = api;
  }

  const apiInstance = apiRef.current!;

  useEffect(() => {
    return stageStateManager.subscribe(() => {
      const watchers = (apiRef.current as any)?._watchers;
      if (!watchers) return;
      const getNestedValue = (obj: any, path: string) =>
        path.split('.').reduce((acc: any, part: string) => acc?.[part], obj);
      const getValue = (source: string | string[] | ((store: RootState) => any), s: any) => {
        const isFunction = typeof source === 'function';
        const isArray = Array.isArray(source);
        const isString = typeof source === 'string';
        if (isFunction) return source(s);
        if (isArray) {
          const r: any = {};
          (source as string[]).forEach((key: string) => {
            r[key] = getNestedValue(s, key);
          });
          return r;
        }
        if (isString) return getNestedValue(s, source as string);
        return s;
      };
      Object.entries(watchers).forEach(([, watcher]: [string, any]) => {
        const newValue = getValue(watcher.source, storeRef.current);
        const oldValue = watcher.oldValue;
        if (!isEqual(newValue, oldValue)) {
          watcher.callback(newValue, oldValue);
          watcher.oldValue = newValue;
        }
      });
    });
  }, []);

  const onError = useCallback(
    (e: SyntheticEvent<HTMLIFrameElement, Event>) => {
      console.error('iframe加载失败', e);
      stageStateManager.removeIframe({ id });
    },
    [id],
  );

  if (!src || !id) {
    return null;
  }

  useEffect(() => {
    const iframe = iframeRef.current;
    if (iframeRef.current?.contentWindow) {
      Object.defineProperty(iframeRef.current.contentWindow, 'webgal', {
        value: apiInstance,
        configurable: true,
        enumerable: true,
      });

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
        } catch {
          // cross-origin is expected
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
        ...style,
        width,
        height,
      }}
    />
  );
}
