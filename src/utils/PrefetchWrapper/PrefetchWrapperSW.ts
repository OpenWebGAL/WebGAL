import { getUrl } from "..";

const cacheVersion = 1;
const cacheNamePrefix = 'webgal-cache-v';
const cacheName = cacheNamePrefix + cacheVersion;
/**
 * 在 ServiceWorker activate 后使用，场景级预加载
 *
 * 有 ServiceWorker 负责 cache，Wrapper 只管 fetch
 *
 * @see getScene()
 * @see LoadSavedGame()
 * @see jumpFromBacklog()
 */
export class PrefetchWrapperSW {
    /**
     * 每批次加载的最大请求数，防止 HTTP 429
     * @type {Number}
     */
    maxRequestBatch = 6;

    /**
     * 两批次加载间的最小时间间隔（毫秒），防止 HTTP 429
     * @type {Number}
     */
    minRequestInterval = 3000;

    /** 
     * 预加载管线
     * @type {Array.<String>} 
     */
    _prefetchPipeline: string[] = [];

    /**
     * 定时器id
     * @type {NodeJS.Timeout|null}
     */
    _batchID: NodeJS.Timeout | null = null;

    /** 
     * 缓存列表
     * @type {Set.<String>} 
     */
    _cachedAssets: Set<string> = new Set();

    /**
     * 当前场景与索引
     * @type {{scene:string,idx:number}}
     */
    _currentCursor = { scene: '', idx: 0 };

    /**
     * 变换场景时回调，基于当前场景更新预加载管线
     * @param {String} newSceneUrl 新场景文件的 URL
     * @param {Number} startIdx 开始行索引（从 0 开始）
     */
    async onSceneChange(newSceneUrl: string, startIdx: number = 0) {
        const syncCachePromise = this._syncCacheInfo();
        if (newSceneUrl === this._currentCursor.scene && startIdx === this._currentCursor.idx) return;

        this._currentCursor.scene = newSceneUrl;
        this._currentCursor.idx = startIdx;

        // clear pipeline
        this.signalPause();
        this.flushPipeline();

        const resp = await fetch(newSceneUrl);
        if (!resp.ok) throw new Error(`[prefetcher] request for ${newSceneUrl} failed with status ${resp.status}`);

        // todo: consider moving to worker
        const newAssets = extractAssetUrl(await resp.text(), { sceneUrl: newSceneUrl, startLine: 1 + startIdx });
        // start urgent fetch
        const urgentPromises = newAssets.urgent.map((asset) => {
            return fetch(asset.replace(/\s*(-left|-right|-next)\s*/g, ''))
        });

        // discard cached assets from prefetch list
        await syncCachePromise;
        newAssets.all.forEach((asset) => {
            if (this._cachedAssets.has(asset) || newAssets.urgent.includes(asset)) newAssets.all.delete(asset);
        });

        this.flushPipeline();  // flush again
        this._addToPipeline(newAssets);
        this.signalResume();

        newAssets.map.get('scene')!.forEach((scene: string) => this.suggestNextScene(scene));

        return Promise.allSettled(urgentPromises);
    }

    /**
     * @description: 将 `assets.all` 中的资源加入预加载管线
     * @param {{all: Set.<String>, map: Map.<String, Array.<String>>}} assets
     * @return {*}
     */
    private _addToPipeline(assets: { all: Set<string>, map: Map<string, Array<string>> }) {
        // Set() preserves insertion order
        this._prefetchPipeline.push(...assets.all);  // simple non-heuristic approach
    }

    /**
     * 扩展可能的下一场景，只有急用资源加入预加载管线
     * @param {String} nextSceneUrl 下一场景文件的 URL
     * @param {Number} startIdx 开始行索引（从 0 开始）
     */
    suggestNextScene(nextSceneUrl: string, startIdx: number = 0) {
        const fakeQuery = new URLSearchParams([['expand', 'true'], ['start-idx', startIdx + '']]).toString();
        // re-fetching a scene is cheap, especially given the caches
        this._prefetchPipeline.push(`${nextSceneUrl}?${fakeQuery}`);
        this.signalResume();
    }

    /**
     * @description: 清空预加载管线
     * @param {*}
     * @return {*}
     */
    flushPipeline() {
        this._prefetchPipeline.length = 0;
    }

    /**
     * 暂停预加载，并不清空管线
     * @see flushPipeline()
     */
    signalPause() {
        if (this._batchID !== null) clearTimeout(this._batchID);
        this._batchID = null;
    }

    /**
     * @description: 恢复预加载，多次调用*不会*产生多个请求
     * @param {*}
     * @return {*}
     */
    signalResume() {
        if (this._batchID !== null) return;
        const tryBatch = async (selfID: NodeJS.Timeout) => {
            if (selfID !== this._batchID) return;
            if (this._prefetchPipeline.length > 0) {
                await this._fetchBatch(selfID)
                if (selfID === this._batchID) {
                    this._syncCacheInfo();
                    const id: NodeJS.Timeout = setTimeout(() => tryBatch(id), this.minRequestInterval);
                    this._batchID = id;
                }
            } else {
                this._syncCacheInfo();
                const id: NodeJS.Timeout = setTimeout(() => tryBatch(id), this.minRequestInterval);
                this._batchID = id;
            }
        };
        this._syncCacheInfo();
        const id: NodeJS.Timeout = setTimeout(() => tryBatch(id), 100);
        this._batchID = id;
    }

    /**
     * @description: 对文件进行预加载
     * @param {NodeJS.Timeout} selfID 定时器id
     * @return {Promise<PromiseSettledResult<Response>[]>}
     */
    private _fetchBatch(selfID: NodeJS.Timeout) {
        const promises = [];
        for (let budget = this.maxRequestBatch; budget > 0; budget--) {
            const assetUrl = this._prefetchPipeline.shift();
            // 如果预加载管线为空，则直接跳出循环
            if (assetUrl === undefined) break;
            // 如果缓存中存在需要预加载的文件，则跳到下一个循环
            if (this._cachedAssets.has(assetUrl)) continue;
            // check the (fake) query string of scene
            // 如果预加载的文件为场景文件
            if (assetUrl.split('/', 2)[1] === 'scene')
                promises.push(this._tryExpandScene(assetUrl, selfID));
            // 如果预加载文件为图片视频音频等
            else promises.push(fetch(assetUrl.replace(/\s*(-left|-right|-next)\s*/g, '')));
        }
        return Promise.allSettled(promises);
    }

    /**
     * @description: 对场景文件内的资源进行预加载
     * @param {string} sceneUrl
     * @param {NodeJS.Timeout} selfID
     * @return {*}
     */
    _tryExpandScene(sceneUrl: string, selfID: NodeJS.Timeout) {
        const qsIdx = sceneUrl.lastIndexOf('?');
        // todo: handle existing query strings and hashes
        if (qsIdx < 0)
            // no query string
            return fetch(sceneUrl);

        const qsParam = new URLSearchParams(sceneUrl.substring(qsIdx));
        sceneUrl = sceneUrl.substring(0, qsIdx);  // cut query string for now
        if (qsParam.get('expand') !== `${true}`) return fetch(sceneUrl);

        const startIdx = Number(qsParam.get('start-idx'));
        return fetch(sceneUrl).then((resp) => {
            if (resp.ok) {
                resp.clone().text().then((sceneText) => {
                    const nextAssets = extractAssetUrl(sceneText, {
                        sceneUrl: sceneUrl,
                        startLine: 1 + startIdx,
                        urgentBudget: 6,  // todo: move this arg to param
                        urgentOnly: true,
                    });
                    for (const asset of nextAssets.urgent) {
                        // 如果在缓存和预加载管线中都不存在对应的文件，则将文件加入预加载管线
                        if (!this._cachedAssets.has(asset) && !this._prefetchPipeline.includes(asset))
                            this._prefetchPipeline.push(asset.replace(/\s*(-left|-right|-next)\s*/g, ''))
                    }
                });
            }
            return resp;
        });
    }

    /**
     * @description: 同步真正 CacheStorage 被缓存的资源
     * @param {*}
     * @return {*}
     */
    private async _syncCacheInfo() {
        if (window.caches === undefined) return;
        try {
            const cache = await caches.open(cacheName);
            const keys = await cache.keys();
            this._cachedAssets = new Set(keys.map((req) => req.url.substring(window.location.href.length)));
        } catch {
        }
    }
}


/**
 * 解析场景中用到的资源
 * @param {String} sceneText 场景文本
 * @param {{sceneUrl: String, startLine: Number, maxLine: Number, urgentBudget: Number, urgentOnly: Boolean}} options <br/>
 *      `sceneUrl` 场景文件 URL，用以去除自引用；<br/>
 *      `startLine` 开始解析的自然行（从 1 开始，含）；<br/>
 *      `maxLine` 最大解析行数；<br/>
 *      `urgentBudget` 最大急用资源数；<br/>
 *      `urgentOnly` 只解析到急用资源预算耗尽；<br/>
 * @returns {{all: Set.<String>, map: Map.<String, Array.<String>>, urgent: Array.<String>}} 去重、去自引用的资源，格式 `game/type/name`<br/>
 *      `all` 全部；<br/>
 *      `map` 分类后，键: `background`, `bgm`, `figure`, `scene`, `vocal`；<br/>
 *      `urgent` 急用；<br/>
 */
export function extractAssetUrl(sceneText: string, {
    sceneUrl = '',
    startLine = 1,
    maxLine = Number.POSITIVE_INFINITY,
    urgentBudget = 6,
    urgentOnly = false
} = {}) {
    /** @type {Set.<String>} */
    const assetAll: Set<string> = new Set();

    /** @type {Map.<String, Array.<String>>} */
    const assetMap: Map<string, Array<string>> = new Map();
    ['background', 'bgm', 'figure', 'scene', 'vocal'].forEach((key) => {
        assetMap.set(key, []);
    });

    /** @type {Array.<String>} */
    const assetUrgent: string[] = [];

    /** @param {String} dialogue */
    const extractVocal = (dialogue: string) => {
        const vocalPrefix = 'vocal-';
        const vocal = dialogue.split(',', 1)[0];
        if (vocal.length < dialogue.length && vocal.length > vocalPrefix.length && vocal.startsWith(vocalPrefix)) return vocal.substring(vocalPrefix.length);
        if (/-.+\.(ogg|mp3|aac|cd|wav|wma|flac|ape)/i.test(dialogue)) {
            const match = dialogue.match(/-.+\.(ogg|mp3|aac|cd|wav|wma|flac|ape)/i)!
            return match[0].replace(/-/, '')
        }
        return '';
    };

    /**
     * @param {String} filetype
     * @param {String} filename
     */
    const addToAssets = (filetype: string, filename: string) => {
        const url = getUrl(filename, filetype);
        if (assetAll.has(url) || (filetype === 'scene' && url === sceneUrl)) return false;
        assetAll.add(url);
        assetMap.get(filetype)!.push(url);
        if (urgentBudget > 0) {
            assetUrgent.push(url);
            urgentBudget--;
        }
        return true;
    };

    const lines = sceneText.split('\n');
    for (const [lineIdx, lineData] of lines.entries()) {
        if (lineIdx + 1 - startLine >= maxLine || (urgentOnly && urgentBudget <= 0)) break;

        if (lineIdx + 1 < startLine) continue;

        const tokens = lineData.split(';', 1)[0];
        if (!tokens) continue;

        const cmdOrDlg = tokens.split(':', 1)[0];
        if (cmdOrDlg.length < tokens.length) {
            // `cmdOrDlg` is command (or name of character)

            const argOrDlg = tokens.substring(cmdOrDlg.length + 1);
            if (!argOrDlg) continue;

            switch (cmdOrDlg) {
                // if hit, then `cmdOrDlg` is command and `argOrDlg` is argument

                case 'changeBG':
                case 'changeBG_next':
                    if (argOrDlg !== 'none') addToAssets('background', argOrDlg);
                    break;

                case 'changeP':
                case 'changeP_left':
                case 'changeP_right':
                case 'changeP_next':
                case 'changeP_left_next':
                case 'changeP_right_next':
                case 'miniAvatar':
                    if (argOrDlg !== 'none') addToAssets('figure', argOrDlg);
                    break;

                case 'changeScene':
                    addToAssets('scene', argOrDlg);
                    // DO NOT return, the command may be skipped
                    break;

                case 'choose': {
                    const choices = argOrDlg.trim().slice(1, -1).split(',');
                    for (const choice of choices) {
                        const args = choice.split(':');
                        if (args.length === 2 && args[1]) addToAssets('scene', args[1]);
                    }
                }
                    break;

                case 'bgm':
                    addToAssets('bgm', argOrDlg);
                    break;

                // ignore these commands
                case 'intro':
                case 'label':
                case 'jump_label':
                case 'choose_label':
                case 'varSet':
                case 'varUp':
                case 'varDrop':
                case 'jump_varReach':
                case 'jump_varBelow':
                    break;

                // `cmdOrDlg` is name of character, `argOrDlg` is dialogue
                default: {
                    const vocal = extractVocal(argOrDlg);
                    if (vocal) addToAssets('vocal', vocal);
                }
                    break;
            }
        } else {
            // `cmdOrDlg` is continued dialogue
            const vocal = extractVocal(cmdOrDlg);
            if (vocal) addToAssets('vocal', vocal);
        }
    }

    return { all: assetAll, map: assetMap, urgent: assetUrgent };
}