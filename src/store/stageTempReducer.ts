import { createSlice, PayloadAction } from '@reduxjs/toolkit';

/**
 * 舞台临时状态
 */
const stageTempState = createSlice({
  name: 'stageTemp',
  initialState: {
    oldBg: '',
  },
  reducers: {
    setOldBg: (state, action: PayloadAction<string>) => {
      state.oldBg = action.payload;
    },
  },
});

export const { setOldBg } = stageTempState.actions;

export default stageTempState.reducer;
