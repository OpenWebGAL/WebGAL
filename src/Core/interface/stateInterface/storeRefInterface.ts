import React from "react";
import { GuiStore } from "./guiInterface";
import { StageStore } from "./stageInterface";
import { UserDataStore } from "./userDataInterface";
/**
 * @interface IStoreRef 全局存储的引用接口
 */
export interface IStoreRef {
    GuiRef: React.MutableRefObject<GuiStore|null> | null,
    stageRef: React.MutableRefObject<StageStore|null> | null,
    userDataRef: React.MutableRefObject<UserDataStore|null> | null,
}
