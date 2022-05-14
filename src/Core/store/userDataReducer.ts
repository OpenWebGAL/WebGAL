/**
 * 用于存储与本地存储交换的状态信息。
 * 这些状态会在指定的生命周期与本地存储发生交换，比如打开存档界面、存档、修改设置时。
 * 在引擎初始化时会将这些状态从本地存储加载到运行时状态。
 */
import {
    ISetOptionDataPayload,
    ISetUserDataPayload,
    IUserData,
    playSpeed,
    textSize
} from '../interface/stateInterface/userDataInterface';
import {createSlice, PayloadAction} from "@reduxjs/toolkit";


// 初始化用户数据
const initState: IUserData = {
    saveData: [],
    optionData: {
        slPage: 1,
        volumeMain: 100, // 主音量
        textSpeed: playSpeed.normal, // 文字速度
        autoSpeed: playSpeed.normal, // 自动播放速度
        textSize: textSize.medium,
        vocalVolume: 100, // 语音音量
        bgmVolume: 25, // 背景音乐音量
    },
};

const userDataSlice = createSlice({
    name: 'userData',
    initialState: initState,
    reducers: {
        setUserData: (state, action: PayloadAction<ISetUserDataPayload>) => {
            const {key, value} = action.payload;
            state[key] = value;
        },
        resetUserData: (state, action: PayloadAction<IUserData>) => {
            Object.assign(state, action.payload);
        },
        setOptionData: (state, action: PayloadAction<ISetOptionDataPayload>) => {
            const {key, value} = action.payload;
            (state.optionData as any)[key] = value;
        },
        setSlPage: (state, action: PayloadAction<number>) => {
            state.optionData.slPage = action.payload;
        },
    }
});

export const {setUserData, resetUserData, setOptionData, setSlPage} = userDataSlice.actions;
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
