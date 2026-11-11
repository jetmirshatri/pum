import { createSlice } from '@reduxjs/toolkit';

import type { PayloadAction } from '@reduxjs/toolkit';

type ModeState = { dark: boolean; hasExplicit: boolean };

const initialState: ModeState = {
  dark: false,
  hasExplicit: false
};

const modeSlice = createSlice({
  name: 'mode',
  initialState,
  reducers: {
    setMode(state, action: PayloadAction<boolean>) {
      state.dark = action.payload;
    },
    setExplicitMode(state, action: PayloadAction<boolean>) {
      state.dark = action.payload;
      state.hasExplicit = true;
    },
    toggleMode(state) {
      state.dark = !state.dark;
      state.hasExplicit = true;
    }
  }
});

export const { setMode, setExplicitMode, toggleMode } = modeSlice.actions;

export default modeSlice.reducer;
