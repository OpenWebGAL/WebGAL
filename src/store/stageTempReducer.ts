import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface IStageTempState {
  oldBg: string;
}

const initState: IStageTempState = {
  oldBg: '',
};

/**
 * 舞台临时状态
 */
const stageTempState = createSlice({
  name: 'stageTemp',
  initialState: initState,
  reducers: {
    setOldBg: (state, action: PayloadAction<string>) => {
      state.oldBg = action.payload;
    },
  },
});

export const { setOldBg } = stageTempState.actions;

export default stageTempState.reducer;
