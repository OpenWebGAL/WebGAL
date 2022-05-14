import * as localforage from 'localforage';
import {IUserData} from '../../interface/stateInterface/userDataInterface';
import {gameInfo} from '../../runtime/etc';
import {logger} from '../../util/logger';
import {webgalStore} from "@/Core/store/store";
import {resetUserData} from "@/Core/store/userDataReducer";

/**
 * 写入本地存储
 */
export const setStorage = debounce(() => {
    const userDataState = webgalStore.getState().userData;
    localforage.setItem(gameInfo.gameKey, userDataState).then(() => {
        logger.info('写入本地存储');
    });
}, 100);

/**
 * 从本地存储获取数据
 */
export const getStorage = debounce(() => {
    localforage.getItem(gameInfo.gameKey).then((newUserData) => {
        // 如果没有数据，初始化
        if (!newUserData) {
            setStorage();
            return;
        }
        webgalStore.dispatch(resetUserData(newUserData as IUserData));
    });
}, 100);

/**
 * 防抖函数
 * @param func 要执行的函数
 * @param wait 防抖等待时间
 */
function debounce<T, K>(func: (...args: T[]) => K, wait: number) {
    let timeout: ReturnType<typeof setTimeout>;

    function context(...args: T[]): K {
        clearTimeout(timeout);
        let ret!: K;
        timeout = setTimeout(() => {
            ret = func.apply(context, args);
        }, wait);
        return ret;
    }

    return context;
}

export const syncStorageFast = () => {
    const userDataState = webgalStore.getState().userData;
    localforage.setItem(gameInfo.gameKey, userDataState).then(() => {
        localforage.getItem(gameInfo.gameKey).then((newUserData) => {
            // 如果没有数据，初始化
            if (!newUserData) {
                setStorage();
                return;
            }
            webgalStore.dispatch(resetUserData(newUserData as IUserData));
        });
        logger.info('同步本地存储');
    });
};
