import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
import GUIReducer from '@/store/GUIReducer';
import userDataReducer from '@/store/userDataReducer';
import savesReducer from '@/store/savesReducer';

/**
 * WebGAL 全局状态管理
 */
export const webgalStore = configureStore({
  reducer: {
    GUI: GUIReducer,
    userData: userDataReducer,
    saveData: savesReducer,
  },
  middleware: getDefaultMiddleware({
    serializableCheck: false,
  }),
  devTools: process.env.NODE_ENV !== 'production',
});

// 在 TS 中的类型声明
export type RootState = ReturnType<typeof webgalStore.getState>;
