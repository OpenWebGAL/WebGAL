import { State as SceneState } from "@/hooks/sceneScripts"
import type { GameInfo } from "@/store/gameInfo"
import { PlaySpeed, Runtime, SaveOption, SaveState, SaveTemporaryOption } from "@/types"
import pako from 'pako'
import type { MouseEvent } from 'react'
/**
 * @description: 需要渐显的文字内容
 * @param {string} textArray 文字数组
 * @param {PlaySpeed} playSpeed 渐显速度
 * @return {*}
 */
export const showText = (textArray: string[], playSpeed: PlaySpeed = PlaySpeed.low) => {
    return (showingText = true) => {
        return textArray.map((o, i) => <span key={guid()} style={{ opacity: showingText ? 0 : 1, animation: showingText ? `textFade 0.5s linear ${i * playSpeed}ms forwards` : 'none' }}>{o}</span>)
    }
}

/**
 * @description: intro文字渐显
 * @param {string} paragraphArray 文字数组
 * @return {*}
 */
export const showParagraph = (paragraphArray: string[]) => {
    const list = paragraphArray
    return list.map((o, i) => {
        return (
            <div className="introSingleRow" style={{ opacity: 0, animation: `showSoftly 1.25s linear ${(i + 1) * 1.5}s forwards` }} key={i}>
                {o}
            </div>
        )
    })
}

/**
 * @description: 阻止react vdom点击事件冒泡至document
 * @param {MouseEvent} e
 * @return {*}
 */
export const stopPropagation = (e: MouseEvent<HTMLDivElement>) => { e.nativeEvent.stopImmediatePropagation() }

/**
 * @description: 判断值是否存在
 * @param {unknown} v 需要判断的值
 * @return {*}
 */
export const exit = (v: unknown) => v !== null && v !== undefined && v !== ''

/**
 * @description: 获取路径
 * @param {string} name 文件名称
 * @param {string} prefix 路径前缀
 * @return {*}
 */
export const getUrl = (name: string | undefined | null | 'none', prefix: string) => exit(name) && name !== 'none' ? `game/${prefix}/${decodeURIComponent(name as string)}` : ''

/**
 * @description: 将驼峰变为下划线
 * @param {string} v 需要变换的内容
 * @return {*}
 */
export const humpToLine = (v: string) => v.replace(/([A-Z])/g, "_$1").toLowerCase()

/**
 * @description: 判断是否是手机环境
 * @param {*}
 * @return {*}
 */
export const isMobile = () => {
    let info = navigator.userAgent;
    let agents = ["Android", "iPhone", "SymbianOS", "Windows Phone", "iPod", "iPad"];
    for (let i = 0; i < agents.length; i++) {
        if (info.indexOf(agents[i]) >= 0) return true;
    }
    return false;
}

/**
 * @param {Number} len uuid的长度
 * @param {Boolean} firstU 将返回的首字母置为"u"
 * @param {Nubmer} radix 生成uuid的基数(意味着返回的字符串都是这个基数),2-二进制,8-八进制,10-十进制,16-十六进制
 */
export const guid = (len = 32, firstU = true, radix = 0) => {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('')
    const uuid = []
    radix = radix || chars.length

    if (len) {
        // 如果指定uuid长度,只是取随机的字符,0|x为位运算,能去掉x的小数位,返回整数位
        for (let i = 0; i < len; i++) uuid[i] = chars[0 | Math.random() * radix]
    } else {
        let r
        // rfc4122标准要求返回的uuid中,某些位为固定的字符
        uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-'
        uuid[14] = '4'

        for (let i = 0; i < 36; i++) {
            if (!uuid[i]) {
                r = 0 | Math.random() * 16
                uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r]
            }
        }
    }
    // 移除第一个字符,并用u替代,因为第一个字符为数值时,该guuid不能用作id或者class
    if (firstU) {
        uuid.shift()
        return `u${uuid.join('')}`
    }
    return uuid.join('')
}

/**
 * @description 深度克隆
 * @param {object} obj 需要深度克隆的对象
 * @returns {*} 克隆后的对象或者原值（不是对象）
 */
export const deepClone: <T>(obj: T) => T = (obj) => {
    const objType = getType(obj)
    if (objType !== 'object' && objType !== 'function' && objType !== 'array') {
        // 原始类型直接返回
        return obj
    }
    const o: any[] | Record<string | number | symbol, any> = Array.isArray(obj) ? [] : {}
    for (const i in obj) {
        if ((obj as Object).hasOwnProperty(i)) {
            o[i as unknown as number] = typeof obj[i] === 'object' ? deepClone(obj[i]) : obj[i]
        }
    }
    return o
}

/**
 * @description: 获取变量的类型
 * @param {any} o 变量
 * @return {*} 类型（小写）
 */
export const getType = (o: any) => Object.prototype.toString.call(o).slice(8, -1).toLowerCase()

/**
 * @description JS对象深度合并
 * @param {object} target 需要拷贝的对象
 * @param {object} source 拷贝的来源对象
 * @returns {object|boolean} 深度合并后的对象或者false（入参有不是对象）
 */
export const deepMerge = (target: Record<string | number | symbol, any> = {}, source: Record<string | number | symbol, any> = {}) => {
    target = deepClone(target)
    if (typeof target !== 'object' || typeof source !== 'object') return false
    for (const prop in source) {
        if (!source.hasOwnProperty(prop)) continue
        if (prop in target) {
            if (typeof target[prop] !== 'object') {
                target[prop] = source[prop]
            } else if (typeof source[prop] !== 'object') {
                target[prop] = source[prop]
            } else if (target[prop].concat && source[prop].concat) {
                target[prop] = target[prop].concat(source[prop])
            } else {
                target[prop] = deepMerge(target[prop], source[prop])
            }
        } else {
            target[prop] = source[prop]
        }
    }
    return target
}

/**
 * @description: 对base64进行解压缩
 * @param {string} b64Data
 * @return {*}
 */
export const unzipStr = (b64Data: string) => {
    try {
        let strData = atob(b64Data);
        const charData = strData.split('').map(function (x) {
            return x.charCodeAt(0);
        });
        const binData = new Uint8Array(charData);
        const data = pako.inflate(binData);
        strData = String.fromCharCode.apply(null, new Uint16Array(data) as unknown as number[]);
        return decodeURIComponent(strData);
    } catch (e) {
        console.error(e)
        return '{}'
    }
}

/**
 * @description: 对字符串进行压缩
 * @param {string} str
 * @return {*} base64 string
 */
export const zipStr = (str: string) => {
    try {
        const binaryString = pako.gzip(encodeURIComponent(str), { to: 'string' })
        return btoa(binaryString);
    } catch (e) {
        console.error(e)
        return ''
    }
}

/**
 * @description: 保存游戏进度
 * @param {GameInfo} gameInfo 游戏基本信息
 * @param {SaveOption} toStoreage 要保存的信息
 * @return {*}
 */
export const saveGame = (gameInfo: GameInfo, toStoreage: SaveOption) => {
    const gzip = zipStr(JSON.stringify(toStoreage));
    localStorage.setItem(gameInfo.Game_key, gzip)
}

/**
 * @description: 读取游戏进度
 * @param {GameInfo} gameInfo 游戏基本信息
 * @return {*}
 */
export const loadGame = (gameInfo: GameInfo) => {
    const storage = localStorage.getItem(gameInfo.Game_key)
    return storage ? JSON.parse(unzipStr(storage)) : {}
}

/**
 * @description: 创建临时存档
 * @param {GameInfo} gameInfo 游戏基本信息
 * @param {SaveTemporaryOption} toStoreage 游戏基本信息
 * @return {*}
 */
export const saveTemporaryGame = (gameInfo: GameInfo, toStoreage: SaveTemporaryOption) => {
    const gzip = zipStr(JSON.stringify(toStoreage));
    localStorage.setItem(gameInfo.Game_key + '_temporary', gzip)
}

/**
 * @description: 读取临时存档
 * @param {GameInfo} gameInfo 游戏基本信息
 * @return {*}
 */
export const loadTemporaryGame = (gameInfo: GameInfo) => {
    const storage = localStorage.getItem(gameInfo.Game_key + '_temporary')
    return storage ? JSON.parse(unzipStr(storage)) : {}
}

/**
 * @description: 获取当前时间
 * @param {*}
 * @return {*}
 */
export const getTime = () => new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString('chinese', { hour12: false })

/**
 * @description: 获取类型为SaveState的数据
 * @param {Runtime} runtime 
 * @param {SceneState} obj
 * @return {*}
 */
export const getSaveState: (runtime: Runtime, obj: SceneState) => SaveState = (runtime, obj) => {
    return {
        SceneName: runtime.SceneName,
        SentenceID: runtime.SentenceID,
        bg_Name: obj.bg_Name,
        fig_Name: obj.fig_Name,
        fig_Name_left: obj.fig_Name_left,
        fig_Name_right: obj.fig_Name_right,
        showText: obj.showText,
        showName: obj.showName,
        command: obj.showName,
        choose: obj.choose,
        vocal: obj.vocal,
        bgm: obj.bgm,
        miniAvatar: obj.miniAvatar,
        saveTime: obj.saveTime,
        GameVar: obj.GameVar,
        bg_filter: obj.bg_filter,
        bg_transform: obj.bg_transform,
        pixiPerformList: obj.pixiPerformList,
    }
}

export { Calculater } from './calculate'

export { prefetcher, startSceneUrl, extractAssetUrl } from './PrefetchWrapper'

export { pixiRain, pixiRain2, pixiSnow } from './pixi'