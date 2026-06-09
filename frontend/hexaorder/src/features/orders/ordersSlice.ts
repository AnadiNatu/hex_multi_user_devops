import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { Order } from '../../types';
import { ordersService } from './ordersService';
import { RootState } from '../../app/store';

interface OrdersState {
  items: Order[];
  fetchStatus: 'idle' | 'loading' | 'failed';
  createStatus: 'idle' | 'loading' | 'failed';
  updateStatus: 'idle' | 'loading' | 'failed';
  message: string | null;
  error: string | null;
}

const initialState: OrdersState = {
  items: [],
  fetchStatus: 'idle',
  createStatus: 'idle',
  updateStatus: 'idle',
  message: null,
  error: null,
};

export const fetchOrders = createAsyncThunk<
  Order[],
  void,
  { state: RootState; rejectValue: string }
>('orders/fetchOrders', async (_, { getState, rejectWithValue }) => {
  try {
    const rawRole = getState().auth.user?.rawRole;
    return await ordersService.getOrders(rawRole);
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : 'Unable to load orders');
  }
});

export const createOrder = createAsyncThunk<
  Order,
  { items: Array<{ productId: string; quantity: number }> },
  { rejectValue: string }
>('orders/createOrder', async (payload, { rejectWithValue }) => {
  try {
    return await ordersService.createOrder(payload);
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : 'Unable to create order');
  }
});

export const updateOrderStatus = createAsyncThunk<
  Order,
  { id: string; status: Order['status'] },
  { rejectValue: string }
>('orders/updateOrderStatus', async ({ id, status }, { rejectWithValue }) => {
  try {
    return await ordersService.updateOrderStatus(id, status);
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : 'Unable to update order');
  }
});

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    clearOrderMessage(state) {
      state.message = null;
      state.error = null;
      state.createStatus = 'idle';
      state.updateStatus = 'idle';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.fetchStatus = 'loading';
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.fetchStatus = 'idle';
        state.items = action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.fetchStatus = 'failed';
        state.error = action.payload ?? 'Unable to load orders';
      });

    builder
      .addCase(createOrder.pending, (state) => {
        state.createStatus = 'loading';
        state.message = null;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.createStatus = 'idle';
        state.items = [action.payload, ...state.items];
        state.message = 'Order created successfully';
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.createStatus = 'failed';
        state.error = action.payload ?? 'Unable to create order';
      });

    builder
      .addCase(updateOrderStatus.pending, (state) => {
        state.updateStatus = 'loading';
        state.message = null;
        state.error = null;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.updateStatus = 'idle';
        const idx = state.items.findIndex((o) => o.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
        state.message = 'Order status updated';
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.updateStatus = 'failed';
        state.error = action.payload ?? 'Unable to update order';
      });
  },
});

export const { clearOrderMessage } = ordersSlice.actions;
export default ordersSlice.reducer;