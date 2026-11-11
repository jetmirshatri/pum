import { createSlice } from '@reduxjs/toolkit';

import type { PayloadAction } from '@reduxjs/toolkit';

import type { ApplicationState } from '@/store/index';

// The flags the reader gives `vitex create` on the home page. They live in
// the Redux store, so the choice follows the reader to every demo page.

export const FLAGS = ['demo', 'postgres', 'install', 'git'] as const;
export type Flag = (typeof FLAGS)[number];
export type Flags = Record<Flag, boolean>;

const initialState: Flags = {
  demo: true,
  postgres: true,
  install: false,
  git: false
};

const storySlice = createSlice({
  name: 'story',
  initialState,
  reducers: {
    setFlag(state, action: PayloadAction<{ flag: Flag; on: boolean }>) {
      state[action.payload.flag] = action.payload.on;
    }
  }
});

export const { setFlag } = storySlice.actions;

export const selectFlags = (state: ApplicationState): Flags => state.story;

/** The command the flags describe. */
export const createCommand = (flags: Flags): string =>
  [
    'vitex create my-app --yes',
    ...FLAGS.filter((flag) => flags[flag]).map((flag) => `--${flag}`)
  ].join(' ');

export default storySlice.reducer;
