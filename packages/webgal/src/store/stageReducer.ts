/**
 * 所有会被Save和Backlog记录下的信息，构成当前的舞台状态（也包括游戏运行时变量）
 * 舞台状态是演出结束后的“终态”，在读档时不发生演出，只是将舞台状态替换为读取的状态。
 */

import { ISetGameVar, ISetStagePayload, IStageState } from '@/store/stageInterface';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import cloneDeep from 'lodash/cloneDeep';

// 初始化舞台数据

export const initState: IStageState = {
  oldBgName: '',
  bgName: '', // 背景文件地址（相对或绝对）
  figName: '', // 立绘_中 文件地址（相对或绝对）
  figNameLeft: '', // 立绘_左 文件地址（相对或绝对）
  figNameRight: '', // 立绘_右 文件地址（相对或绝对）
  freeFigure: [],
  showText: '', // 文字
  showTextSize: -1,
  showName: '', // 人物名
  command: '', // 语句指令
  choose: [], // 选项列表，现在不用，先预留
  vocal: '', // 语音 文件地址（相对或绝对）
  vocalVolume: 100, // 语音 音量调整（0 - 100）
  bgm: '', // 背景音乐 文件地址（相对或绝对）
  bgmEnter: 0, // 背景音乐 淡入或淡出的毫秒数
  bgmVolume: 100, // 背景音乐 音量调整（0 - 100）
  uiSe: '', // 用户界面音效 文件地址（相对或绝对）
  seVolume: 100, // 音效 音量调整（0 - 100）
  miniAvatar: '', // 小头像 文件地址（相对或绝对）
  GameVar: {}, // 游戏内变量
  effects: [], // 应用的效果
  bgFilter: '', // 现在不用，先预留
  bgTransform: '', // 现在不用，先预留
  PerformList: [], // 要启动的演出列表
  currentDialogKey: 'initial',
  live2dMotion: [],
  // currentPerformDelay: 0
  currentConcatDialogPrev: '',
  enableFilm: '',
  isDisableTextbox: false,
};

/**
 * 创建舞台的状态管理
 */
const stageSlice = createSlice({
  name: 'stage',
  initialState: cloneDeep(initState),
  reducers: {
    /**
     * 替换舞台状态
     * @param state 当前状态
     * @param action 替换的状态
     */
    resetStageState: (state, action: PayloadAction<IStageState>) => {
      Object.assign(state, action.payload);
    },
    /**
     * 设置舞台状态
     * @param state 当前状态
     * @param action 要替换的键值对
     */
    setStage: (state, action: PayloadAction<ISetStagePayload>) => {
      // @ts-ignore
      state[action.payload.key] = action.payload.value;
    },
    /**
     * 修改舞台状态变量
     * @param state 当前状态
     * @param action 要改变或添加的变量
     */
    setStageVar: (state, action: PayloadAction<ISetGameVar>) => {
      state.GameVar[action.payload.key] = action.payload.value;
    },
  },
});

export const { resetStageState, setStage, setStageVar } = stageSlice.actions;
export default stageSlice.reducer;

// /**
//  * 创建舞台的状态管理
//  * @return {IStageState} 舞台状态
//  * @return {function} 改变舞台状态
//  */
// export function stageStateStore():StageStore {
//     const [stageState, setStageState] = useState(_.cloneDeep(initState));
//
//     /**
//      * 设置舞台状态，以后会改
//      * @param key
//      * @param value
//      */
//     const setStage = <K extends keyof IStageState>(key: K, value: any) => {
//
//         setStageState(state => {
//             state[key] = value;
//             return {...state};
//         });
//
//     };
//
//     const getStageState = () => {
//         return stageState;
//     };
//
//     const restoreStage = (newState: IStageState) => {
//         setStageState((state) => ({ ...state, ...newState }));
//     };
//
//     return {
//         stageState,
//         setStage,
//         getStageState,
//         restoreStage,
//     };
// }
