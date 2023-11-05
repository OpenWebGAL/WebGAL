/**
 * 所有会被Save和Backlog记录下的信息，构成当前的舞台状态（也包括游戏运行时变量）
 * 舞台状态是演出结束后的“终态”，在读档时不发生演出，只是将舞台状态替换为读取的状态。
 */

import {
  IEffect,
  IFreeFigure,
  ILive2DExpression,
  ILive2DMotion,
  IRunPerform,
  ISetGameVar,
  ISetStagePayload,
  IStageState,
} from '@/store/stageInterface';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import cloneDeep from 'lodash/cloneDeep';
import { commandType } from '@/Core/controller/scene/sceneInterface';

// 初始化舞台数据

export const initState: IStageState = {
  oldBgName: '',
  bgName: '', // 背景文件地址（相对或绝对）
  figName: '', // 立绘_中 文件地址（相对或绝对）
  figNameLeft: '', // 立绘_左 文件地址（相对或绝对）
  figNameRight: '', // 立绘_右 文件地址（相对或绝对）
  freeFigure: [],
  figureAssociatedAnimation: [],
  showText: '', // 文字
  showTextSize: -1,
  showName: '', // 人物名
  command: '', // 语句指令
  choose: [], // 选项列表，现在不用，先预留
  vocal: '', // 语音 文件地址（相对或绝对）
  vocalVolume: 100, // 语音 音量调整（0 - 100）
  bgm: {
    // 背景音乐
    src: '', // 背景音乐 文件地址（相对或绝对）
    enter: 0, // 背景音乐 淡入或淡出的毫秒数
    volume: 100, // 背景音乐 音量调整（0 - 100）
  },
  uiSe: '', // 用户界面音效 文件地址（相对或绝对）
  miniAvatar: '', // 小头像 文件地址（相对或绝对）
  GameVar: {}, // 游戏内变量
  effects: [], // 应用的效果
  bgFilter: '', // 现在不用，先预留
  bgTransform: '', // 现在不用，先预留
  PerformList: [], // 要启动的演出列表
  currentDialogKey: 'initial',
  live2dMotion: [],
  live2dExpression: [],
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
    updateEffect: (state, action: PayloadAction<IEffect>) => {
      const { target, transform } = action.payload;
      // 尝试找到待修改的 Effect
      const effectIndex = state.effects.findIndex((e) => e.target === target);
      if (effectIndex >= 0) {
        // Update the existing effect
        state.effects[effectIndex].transform = transform;
      } else {
        // Add a new effect
        state.effects.push({
          target,
          transform,
        });
      }
    },
    removeEffectByTargetId: (state, action: PayloadAction<string>) => {
      const index = state.effects.findIndex((e) => e.target === action.payload);
      if (index >= 0) {
        state.effects.splice(index, 1);
      }
    },
    addPerform: (state, action: PayloadAction<IRunPerform>) => {
      state.PerformList.push(action.payload);
    },
    removePerformByName: (state, action: PayloadAction<string>) => {
      for (let i = 0; i < state.PerformList.length; i++) {
        const performItem: IRunPerform = state.PerformList[i];
        if (performItem.id === action.payload) {
          state.PerformList.splice(i, 1);
          i--;
        }
      }
    },
    removeAllPixiPerforms: (state, action: PayloadAction<undefined>) => {
      for (let i = 0; i < state.PerformList.length; i++) {
        const performItem: IRunPerform = state.PerformList[i];
        if (performItem.script.command === commandType.pixi) {
          state.PerformList.splice(i, 1);
          i--;
        }
      }
    },
    setFreeFigureByKey: (state, action: PayloadAction<IFreeFigure>) => {
      const currentFreeFigures = state.freeFigure;
      const newFigure = action.payload;
      const index = currentFreeFigures.findIndex((figure) => figure.key === newFigure.key);
      if (index >= 0) {
        currentFreeFigures[index].basePosition = newFigure.basePosition;
        currentFreeFigures[index].name = newFigure.name;
      } else {
        // 新加
        if (newFigure.name !== '') currentFreeFigures.push(newFigure);
      }
    },
    setLive2dMotion: (state, action: PayloadAction<ILive2DMotion>) => {
      const { target, motion } = action.payload;

      const index = state.live2dMotion.findIndex((e) => e.target === target);

      if (index < 0) {
        // Add a new motion
        state.live2dMotion.push({ target, motion });
      } else {
        // Update the existing motion
        state.live2dMotion[index].motion = motion;
      }
    },
    setLive2dExpression: (state, action: PayloadAction<ILive2DExpression>) => {
      const { target, expression } = action.payload;

      const index = state.live2dExpression.findIndex((e) => e.target === target);

      if (index < 0) {
        // Add a new expression
        state.live2dExpression.push({ target, expression });
      } else {
        // Update the existing expression
        state.live2dExpression[index].expression = expression;
      }
    },
  },
});

export const { resetStageState, setStage, setStageVar } = stageSlice.actions;
export const stageActions = stageSlice.actions;
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
