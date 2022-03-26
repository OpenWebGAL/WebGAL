import * as localforage from "localforage";
import {gameInfo} from "../../runtime/etc";
import {getRef} from "../../store/storeRef";
import {logger} from "../../util/logger";
import {IUserData} from "../../store/userData";


export const setStorage = debounce(() => {
    localforage.setItem(gameInfo.gameKey, getRef('userDataRef').userDataState).then(() => {
        logger.info('写入本地存储');
    });
}, 100);

export const getStorage = debounce(() => {
    localforage.getItem(gameInfo.gameKey).then(newUserData => {
        getRef('userDataRef').replaceUserData(<IUserData>newUserData);
    })
}, 100);

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