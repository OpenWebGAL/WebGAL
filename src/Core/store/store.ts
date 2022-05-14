import {configureStore} from "@reduxjs/toolkit";
import stageReducer from "@/Core/store/stageReducer";
import GUIReducer from "@/Core/store/GUIReducer";
import userDataReducer from "@/Core/store/userDataReducer";

export const webgalStore = configureStore({
    reducer: {
        stage: stageReducer,
        GUI: GUIReducer,
        userData: userDataReducer
    }
});

// 在 TS 中的类型声明
export type RootState = ReturnType<typeof webgalStore.getState>;
