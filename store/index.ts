import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { api } from './api';

const rootReducer = combineReducers({
  [api.reducerPath]: api.reducer,
  // otros reducers...
});

export const store = configureStore({
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware().concat(api.middleware),
  reducer: rootReducer,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
