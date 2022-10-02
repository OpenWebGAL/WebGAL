import { configureStore } from '@reduxjs/toolkit';
import stageReducer from '@/store/stageReducer';
import GUIReducer from '@/store/GUIReducer';
import userDataReducer from '@/store/userDataReducer';
import stageTempReducer from '@/store/stageTempReducer';

/**
 * WebGAL 全局状态管理
 */
export const webgalStore = configureStore({
  reducer: {
    stage: stageReducer,
    GUI: GUIReducer,
    userData: userDataReducer,
    stageTemp: stageTempReducer,
  },
});

// 在 TS 中的类型声明
export type RootState = ReturnType<typeof webgalStore.getState>;
