import * as localforage from "localforage";
import {IUserData} from "../../interface/stateInterface/userDataInterface";
import {gameInfo} from "../../runtime/etc";
import {getRef} from "../../store/storeRef";
import {logger} from "../../util/logger";

/**
 * 写入本地存储
 */
export const setStorage = debounce(() => {
    localforage.setItem(gameInfo.gameKey, getRef('userDataRef').userDataState).then(() => {
        logger.info('写入本地存储');
    });
}, 100);

/**
 * 从本地存储获取数据
 */
export const getStorage = debounce(() => {
    localforage.getItem(gameInfo.gameKey).then(newUserData => {
        //如果没有数据，初始化
        if (!newUserData) {
            setStorage();
            return;
        }
        getRef('userDataRef').replaceUserData(<IUserData>newUserData);
    })
}, 100);

/**
 * 防抖函数
 * @param func 要执行的函数
 * @param wait 防抖等待时间
 */
function debounce(func: Function, wait: number) {
    let timeout: any;

    return function (this: any, ...args: any[]) {
        let context: any = this; // 保存this指向
        clearTimeout(timeout)
        timeout = setTimeout(function () {
            func.apply(context, args)
        }, wait);
    }
}