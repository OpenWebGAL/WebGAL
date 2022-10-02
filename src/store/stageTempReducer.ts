import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface IStageTempState {
  oldBg: string;
  oldBgKey: string;
}

const initState: IStageTempState = {
  oldBg: '',
  oldBgKey: '',
};

/**
 * 舞台临时状态
 */
const stageTempState = createSlice({
  name: 'stageTemp',
  initialState: initState,
  reducers: {
    setOldBg: (state, action: PayloadAction<{ value: string; key: string }>) => {
      state.oldBg = action.payload.value;
      state.oldBgKey = action.payload.key;
    },
  },
});

export const { setOldBg } = stageTempState.actions;

export default stageTempState.reducer;
