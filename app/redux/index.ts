import { combineReducers, configureStore } from '@reduxjs/toolkit';
import {
  useDispatch as useReduxDispatch,
  useSelector as useReduxSelector,
  useStore as useReduxStore
} from 'react-redux';

import modeReducer from '@/store/modules/Mode';
import storyReducer from '@/store/modules/Story';

import type { ThunkDispatch, UnknownAction } from '@reduxjs/toolkit';

const rootReducer = combineReducers({
  mode: modeReducer,
  story: storyReducer
});

export type ApplicationState = ReturnType<typeof rootReducer>;

export const configureAppStore = (preloadedState?: Partial<ApplicationState>) =>
  configureStore({
    reducer: rootReducer,
    preloadedState,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
    devTools: process.env.NODE_ENV !== 'production'
  });

export type AppStore = ReturnType<typeof configureAppStore>;
export type AppDispatch = ThunkDispatch<
  ApplicationState,
  undefined,
  UnknownAction
>;

export const useAppDispatch = useReduxDispatch.withTypes<AppDispatch>();
export const useAppSelector = useReduxSelector.withTypes<ApplicationState>();
export const useAppStore = useReduxStore.withTypes<AppStore>();

export default rootReducer;
