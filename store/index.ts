import { combineReducers, configureStore } from '@reduxjs/toolkit';
import '../services/auth/activate-account.rtkq'; // Import to register endpoints
import '../services/auth/login.rtkq'; // Import to register endpoints
import '../services/auth/recovery.rtkq'; // Import to register endpoints
import '../services/profile/profile.rtkq'; // Import to register endpoints
import '../services/question/area.rtkq'; // Import to register endpoints
import '../services/question/exam-type.rtkq'; // Import to register endpoints
import '../services/question/question.rtkq'; // Import to register endpoints
import '../services/question/specialty.rtkq'; // Import to register endpoints
import '../services/question/theme.rtkq'; // Import to register endpoints
import '../services/question/year.rtkq'; // Import to register endpoints
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
