import { configureStore } from '@reduxjs/toolkit';
import userLocationReducer from './userLocationSlice';

export const store = configureStore({
  reducer: {
    userLocation: userLocationReducer,
    // Add other reducers here as needed
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 