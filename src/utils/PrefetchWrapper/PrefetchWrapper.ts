import { runtime } from "@/store/scene";
import { getUrl } from "..";
import logger from "../logger";
import { PrefetchWrapperSW } from ".";
const startSceneUrl = 'game/scene/start.txt';

const prefetcher = new PrefetchWrapperSW();

/**
 * @description: 初始化service worker
 * @param {*}
 * @return {*}
 */
function initServiceWorkerPrefetchWrapper() {
    prefetcher.suggestNextScene(startSceneUrl);
    const contScene = runtime.SceneName;
    if (contScene && (contScene !== 'start.txt' || runtime.SentenceID))
        prefetcher.suggestNextScene(getUrl(contScene, 'scene'), runtime.SentenceID);
}

if (window.isSecureContext) {
    if (navigator.serviceWorker) {
        window.addEventListener('load', async () => {
            try {
                const reg = await navigator.serviceWorker.register('webgal-sw.js')
                // on a new service worker being installing
                reg.onupdatefound = () => {
                    // hack: re-register every time
                    // the service worker is for prefetching rather than offline storage
                    window.addEventListener('beforeunload', () => {
                        reg.unregister();
                    });

                    if (reg.installing) reg.installing.onstatechange = (ev) => {
                        if ((ev.target as any).state === 'activated') {
                            logger.info('[service worker] claimed');
                            initServiceWorkerPrefetchWrapper();
                        }
                    };
                };
            } catch (e) {
                // reject usually indicates a typo in the filename of service worker
                // redundant service worker is NOT rejected
                console.error('[service worker] registration failed: ' + e);
            }

        });
    } else {
        // only private mode in Firefox falls in this category
        logger.warn('ServiceWorker not supported.');
        // no ServiceWorker, no CacheStorage
        // could be threated as BrowserCache
    }
} else {
    console.warn('Context not secure. Requiring HTTPS to enable CacheStorage and ServiceWorker.');

    window.addEventListener('load', () => {
        // current implementation is somewhat compatible with browser cache
        // initBrowserCachePrefetchWrapper();
        initServiceWorkerPrefetchWrapper();
        prefetcher.maxRequestBatch = 6;
        prefetcher.minRequestInterval = 5000;
    });
}

export { prefetcher, startSceneUrl };
