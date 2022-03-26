import * as localforage from "localforage";
import {gameInfo} from "../../runtime/etc";
import {getRef} from "../../store/storeRef";
import {logger} from "../../util/logger";
import {IUserData} from "../../store/userData";

export const setStorage = () => {
    localforage.setItem(gameInfo.gameKey, getRef('userDataRef').userDataState).then(() => {
        logger.info('写入本地存储');
    });
}

export const getStorage = () => {
    localforage.getItem(gameInfo.gameKey).then(newUserData => {
        getRef('userDataRef').replaceUserData(<IUserData>newUserData);
    })
}