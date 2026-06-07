import { useEffect, useMemo, useRef, useCallback, SyntheticEvent } from 'react';
import { webgalStore } from '@/store/store';
import { IWatchers, IWebGALBridge, WebGalAPIEventsKeyNames } from './interface';
import { setScriptManagedGlobalVar } from '@/store/userDataReducer';
import { WebGAL } from '@/Core/WebGAL';
import { nextSentence as nextSentenceController } from '@/Core/controller/gamePlay/nextSentence';
import { IIFrame } from '@/Core/Modules/stage/stageInterface';
import { stageStateManager } from '@/Core/Modules/stage/stageStateManager';
import { useStageState } from '@/hooks/useStageState';
import { stopAuto, startAuto } from '@/Core/controller/gamePlay/autoPlay';
import { stopFast, startFast } from '@/Core/controller/gamePlay/fastSkip';
import { playBgm } from '@/Core/controller/stage/playBgm';
import { jumpToLabel } from '@/Core/gameScripts/label/jumpToLabel';

export default function Iframe({ id, sandbox, src, width, height, wait, injectArgs, style }: IIFrame) {
  const idString = `iframe-${id}`;
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const stage = useStageState();

  useEffect(() => {
    const globalPersistentData = (window as any).__iframePersistentData;
    if (globalPersistentData?.has(id)) {
      const persistentData = globalPersistentData.get(id);
      stageStateManager.updateIframePersistentData({ id, persistentData });
      globalPersistentData.delete(id);
    }
  }, [id]);

  const stageRef = useRef(stage);
  stageRef.current = stage;

  const gameVarWatchersRef = useRef<IWatchers | null>(null);
  const prevGameVarRef = useRef<Record<string, any>>({});

  const eventsMap = useMemo(
    () => ({
      save: WebGAL.events.save,
      load: WebGAL.events.load,
      nextSentence: WebGAL.events.userInteractNext,
    }),
    [],
  );

  const apiRef = useRef<IWebGALBridge | null>(null);
  if (!apiRef.current) {
    const api: IWebGALBridge = Object.create(null);

    // variable: game variables, scene, stage, audio, iframe
    const gameVarWatchers: IWatchers = {};
    gameVarWatchersRef.current = gameVarWatchers;

    // flow: navigation and playback controls
    api.flow = {
      next: () => nextSentenceController(),
      autoOn: () => startAuto(),
      autoOff: () => stopAuto(),
      fastSkipOn: () => startFast(),
      fastSkipOff: () => stopFast(),
    };

    api.variable = {
      get: (key: string) => stageRef.current.GameVar[key],
      set: (key: string, value: string | number | boolean, options?: { global?: boolean }) => {
        if (options?.global) {
          webgalStore.dispatch(setScriptManagedGlobalVar({ key, value }));
        } else {
          stageStateManager.setStageVarAndCommit({ key, value });
        }
      },
      onChange: (key: string, callback: (newValue: any) => void) => {
        if (!gameVarWatchers[key]) {
          gameVarWatchers[key] = [];
        }
        const watcher = { callback };
        gameVarWatchers[key].push(watcher);
        return () => {
          const index = gameVarWatchers[key].indexOf(watcher);
          if (index > -1) gameVarWatchers[key].splice(index, 1);
        };
      },
    };

    api.scene = {
      jumpTo: (sceneUrl: string, label?: string) => {
        if (label) {
          jumpToLabel(label);
        }
      },
    };

    api.stage = {
      getBackground: () => stageRef.current.bgName,
      getFigures: () => ({
        left: stageRef.current.figNameLeft,
        center: stageRef.current.figName,
        right: stageRef.current.figNameRight,
      }),
      getCurrentText: () => stageRef.current.showText,
      getCurrentSpeaker: () => stageRef.current.showName,
      getPerformList: () => {
        const performs = stageRef.current.PerformList;
        return performs.map((p) => ({ id: p.id, isHoldOn: p.isHoldOn }));
      },
      isBlockSentence: () => {
        return WebGAL.gameplay.performController.hasBlockingNextPerform();
      },
    };

    api.audio = {
      playBgm: (url: string, options?: { volume?: number; fade?: number }) => {
        playBgm(url, options?.fade ?? 0, options?.volume ?? 100);
      },
      stopBgm: (fade?: number) => {
        const bgmElement = document.getElementById('currentBgm') as HTMLAudioElement | null;
        if (bgmElement) {
          if (fade) {
            const originalVolume = bgmElement.volume;
            const steps = 20;
            const stepTime = (fade / steps) | 0;
            let step = 0;
            const fadeInterval = setInterval(() => {
              step++;
              bgmElement.volume = originalVolume * (1 - step / steps);
              if (step >= steps) {
                clearInterval(fadeInterval);
                bgmElement.pause();
                bgmElement.volume = originalVolume;
              }
            }, stepTime);
          } else {
            bgmElement.pause();
          }
        }
      },
      playEffect: (url: string) => {
        const userDataState = webgalStore.getState().userData;
        const mainVol = userDataState.optionData.volumeMain;
        const seVol = mainVol * 0.01 * (userDataState.optionData?.seVolume ?? 100) * 0.01 * 100 * 0.01;
        const seElement = document.createElement('audio');
        seElement.src = url;
        seElement.volume = seVol;
        seElement.play().catch(() => {});
      },
      setVolume: (type: 'bgm' | 'vocal' | 'effect', volume: number) => {
        const currentStage = stageRef.current;
        if (type === 'bgm') {
          stageStateManager.setStage('bgm', { ...currentStage.bgm, volume });
        } else if (type === 'vocal') {
          stageStateManager.setStage('vocalVolume', volume);
        }
      },
    };

    api.iframe = {
      close: () => stageStateManager.removeIframe({ id }),
      resize: (width: number, height: number) => {
        const iframeElement = document.getElementById(`iframe-${id}`) as HTMLIFrameElement;
        if (iframeElement) {
          iframeElement.style.width = `${width}px`;
          iframeElement.style.height = `${height}px`;
        }
      },
      move: (x: number, y: number) => {
        const iframeElement = document.getElementById(`iframe-${id}`) as HTMLIFrameElement;
        if (iframeElement) {
          iframeElement.style.transform = `translate(${x}px, ${y}px)`;
        }
      },
      getPosition: () => {
        const iframeElement = document.getElementById(`iframe-${id}`) as HTMLIFrameElement;
        if (iframeElement) {
          const rect = iframeElement.getBoundingClientRect();
          return { x: rect.left, y: rect.top, width: rect.width, height: rect.height };
        }
        return { x: 0, y: 0, width: 0, height: 0 };
      },
      complete: (returnValue?: any) => {
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
      },
      openIframe: (key?: string) => {
        const targetId = key ?? id;
        const iframe = stageRef.current.iframes.find((e: any) => e.id === targetId);
        if (iframe) {
          iframe.isActive = true;
          stageStateManager.commit();
        }
      },
      closeIframe: (key?: string) => {
        const targetId = key ?? id;
        stageStateManager.removeIframe({ id: targetId, isActive: true });
      },
    };

    // event: event handling
    api.event = {
      on: (event: WebGalAPIEventsKeyNames, callback: (data?: any) => void) => {
        if (!eventsMap[event]) {
          console.error(`无效的事件类型: ${event}`);
          return;
        }
        eventsMap[event].on(callback);
      },
      off: (event: WebGalAPIEventsKeyNames, callback: (data?: any) => void) => {
        if (!eventsMap[event]) {
          console.error(`无效的事件类型: ${event}`);
          return;
        }
        eventsMap[event].off(callback);
      },
      postIframeMessage: (key: string, data?: any) => {
        const targetIframe = stageRef.current.iframes.find((e: any) => e.id === key);
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
      },
    };

    // store: persistent data
    api.store = {
      getPersistentData: (key?: string) => {
        const iframe = stageRef.current.iframes.find((e: any) => e.id === id);
        if (!iframe?.persistentData) return key ? undefined : {};
        return key ? iframe.persistentData[key] : iframe.persistentData;
      },
      setPersistentData: (key: string, value: any) => {
        const iframe = stageRef.current.iframes.find((e: any) => e.id === id);
        if (!iframe) {
          console.error(`找不到id为${id}的iframe`);
          return;
        }
        const currentData = iframe.persistentData || {};
        stageStateManager.updateIframePersistentData({
          id,
          persistentData: { ...currentData, [key]: value },
        });
      },
      clearPersistentData: (key?: string) => {
        const iframe = stageRef.current.iframes.find((e: any) => e.id === id);
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
      },
    };

    api.frameId = id;

    apiRef.current = api;
  }

  const apiInstance = apiRef.current!;

  useEffect(() => {
    const gameVarWatchers = gameVarWatchersRef.current;
    const prevVars = prevGameVarRef.current;

    if (!gameVarWatchers) return;

    const currentVars = stageRef.current.GameVar;

    for (const key of Object.keys(gameVarWatchers)) {
      if (currentVars[key] !== prevVars[key]) {
        prevVars[key] = currentVars[key];
        gameVarWatchers[key].forEach((watcher: { callback: (newValue: any) => void }) => {
          watcher.callback(currentVars[key]);
        });
      }
    }
  }, [stage]);

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
