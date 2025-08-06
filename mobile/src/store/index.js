import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers } from '@reduxjs/toolkit';

import authSlice from './slices/authSlice';
import animalsSlice from './slices/animalsSlice';
import schedulesSlice from './slices/schedulesSlice';
import inventorySlice from './slices/inventorySlice';
import marketplaceSlice from './slices/marketplaceSlice';
import enhancementsSlice from './slices/enhancementsSlice';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth'], // Only persist auth state
};

const rootReducer = combineReducers({
  auth: authSlice,
  animals: animalsSlice,
  schedules: schedulesSlice,
  inventory: inventorySlice,
  marketplace: marketplaceSlice,
  enhancements: enhancementsSlice,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export const persistor = persistStore(store); 