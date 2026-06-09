import { configureStore } from '@reduxjs/toolkit';

import authReducer from '../features/auth/authSlice';
import productsReducer from '../features/products/productsSlice';
import ordersReducer from '../features/orders/ordersSlice';
import uiReducer from '../features/ui/uiSlice';

export const createAppStore = () =>
  configureStore({
    reducer: {
      auth: authReducer,
      products: productsReducer,
      orders: ordersReducer,
      ui: uiReducer,
    },
  });

export type AppStore = ReturnType<typeof createAppStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];

export const store = createAppStore();