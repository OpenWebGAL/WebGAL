/**
 * 用于存储与本地存储交换的状态信息。
 * 这些状态会在指定的生命周期与本地存储发生交换，比如打开存档界面、存档、修改设置时。
 * 在引擎初始化时会将这些状态从本地存储加载到运行时状态。
 */
import {
  IAppreciationAsset,
  ISaveData,
  ISetOptionDataPayload,
  ISetUserDataPayload,
  IUserData,
  playSpeed,
  textFont,
  textSize,
} from '@/store/userDataInterface';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import cloneDeep from 'lodash/cloneDeep';

const initialOptionSet = {
  slPage: 1,
  volumeMain: 100, // 主音量
  textSpeed: playSpeed.normal, // 文字速度
  autoSpeed: playSpeed.normal, // 自动播放速度
  textSize: textSize.medium,
  vocalVolume: 100, // 语音音量
  bgmVolume: 25, // 背景音乐音量
  textboxFont: textFont.song,
};

// 初始化用户数据
export const initState: IUserData = {
  saveData: [],
  optionData: initialOptionSet,
  appreciationData: {
    bgm: [],
    cg: [],
  },
  quickSaveData: null,
};

const userDataSlice = createSlice({
  name: 'userData',
  initialState: cloneDeep(initState),
  reducers: {
    /**
     * 设置用户数据
     * @param state
     * @param action
     */
    setUserData: (state, action: PayloadAction<ISetUserDataPayload>) => {
      const { key, value } = action.payload;
      state[key] = value;
    },
    unlockCgInUserData: (state, action: PayloadAction<IAppreciationAsset>) => {
      const { name, url, series } = action.payload;
      // 检查是否存在
      let isExist = false;
      state.appreciationData.cg.forEach((e) => {
        if (name === e.name) {
          isExist = true;
          e.url = url;
          e.series = series;
        }
      });
      if (!isExist) {
        state.appreciationData.cg.push(action.payload);
      }
    },
    unlockBgmInUserData: (state, action: PayloadAction<IAppreciationAsset>) => {
      const { name, url, series } = action.payload;
      // 检查是否存在
      let isExist = false;
      state.appreciationData.bgm.forEach((e) => {
        if (name === e.name) {
          isExist = true;
          e.url = url;
          e.series = series;
        }
      });
      if (!isExist) {
        state.appreciationData.bgm.push(action.payload);
      }
    },
    /**
     * 替换用户数据
     * @param state
     * @param action
     */
    resetUserData: (state, action: PayloadAction<IUserData>) => {
      Object.assign(state, action.payload);
    },
    /**
     * 设置选项数据
     * @param state
     * @param action
     */
    setOptionData: (state, action: PayloadAction<ISetOptionDataPayload>) => {
      const { key, value } = action.payload;
      (state.optionData as any)[key] = value;
    },
    /**
     * 设置存档/读档页面
     * @param state
     * @param action
     */
    setSlPage: (state, action: PayloadAction<number>) => {
      state.optionData.slPage = action.payload;
    },
    setFastSave: (state, action: PayloadAction<ISaveData | null>) => {
      state.quickSaveData = action.payload;
    },
    resetOptionSet(state) {
      Object.assign(state.optionData, initialOptionSet);
    },
    resetAllData(state) {
      Object.assign(state, cloneDeep(initState));
    },
    resetSaveData(state) {
      state.saveData.splice(0, state.saveData.length);
    },
  },
});

export const {
  setUserData,
  resetUserData,
  setOptionData,
  setSlPage,
  unlockCgInUserData,
  unlockBgmInUserData,
  setFastSave,
  resetOptionSet,
  resetSaveData,
  resetAllData,
} = userDataSlice.actions;
export default userDataSlice.reducer;

// /**
//  * 创建用户数据的状态管理
//  * @return {IUserData} 用户数据
//  * @return {function} 改变用户数据
//  */
// export function userDataStateStore():UserDataStore {
//     const [userDataState, setUserDataState] = useState(initState);
//
//     // 设置用户数据
//     const setUserData = <K extends keyof IUserData>(key: K, value: any) => {
//
//         setUserDataState(state => {
//             state[key] = value;
//             return {...state};
//         });
//
//     };
//
//     // 替换用户数据（多用于与本地存储交互）
//     const replaceUserData = (newUserData: IUserData) => {
//
//         setUserDataState(state => ({...state, ...newUserData}));
//     };
//
//     const setOptionData = <K extends keyof IOptionData>(key: K, value: any) => {
//         setUserDataState(state => {
//             state.optionData[key] = value;
//             return {...state};
//         });
//     };
//
//     const setSlPage = (index: number) => {
//         setUserDataState(state => {
//             state.optionData.slPage = index;
//             return {...state};
//         });
//
//     };
//
//     return {
//         userDataState,
//         setUserData,
//         replaceUserData,
//         setOptionData,
//         setSlPage,
//     };
// }
