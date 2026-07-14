import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { Order } from '../../types';
import { ordersService } from './ordersService';
import { RootState } from '../../app/store';

interface OrdersState {
  items:        Order[];
  fetchStatus:  'idle' | 'loading' | 'failed';
  createStatus: 'idle' | 'loading' | 'failed';
  updateStatus: 'idle' | 'loading' | 'failed';
  message:      string | null;
  error:        string | null;
}

const initialState: OrdersState = {
  items:        [],
  fetchStatus:  'idle',
  createStatus: 'idle',
  updateStatus: 'idle',
  message:      null,
  error:        null,
};

export const fetchOrders = createAsyncThunk<
  Order[], void, { state: RootState; rejectValue: string }
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
      state.message      = null;
      state.error        = null;
      state.createStatus = 'idle';
      state.updateStatus = 'idle';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending,   (s) => { s.fetchStatus = 'loading'; s.error = null; })
      .addCase(fetchOrders.fulfilled, (s, a) => { s.fetchStatus = 'idle'; s.items = a.payload; })
      .addCase(fetchOrders.rejected,  (s, a) => { s.fetchStatus = 'failed'; s.error = a.payload ?? 'Load failed'; });

    builder
      .addCase(createOrder.pending,   (s) => { s.createStatus = 'loading'; s.message = null; s.error = null; })
      .addCase(createOrder.fulfilled, (s, a) => {
        s.createStatus = 'idle';
        s.items        = [a.payload, ...s.items];
        s.message      = 'Order created successfully';
      })
      .addCase(createOrder.rejected,  (s, a) => { s.createStatus = 'failed'; s.error = a.payload ?? 'Create failed'; });

    builder
      .addCase(updateOrderStatus.pending,   (s) => { s.updateStatus = 'loading'; s.message = null; s.error = null; })
      .addCase(updateOrderStatus.fulfilled, (s, a) => {
        s.updateStatus = 'idle';
        const idx = s.items.findIndex((o) => o.id === a.payload.id);
        if (idx !== -1) s.items[idx] = a.payload;
        s.message = 'Order status updated';
      })
      .addCase(updateOrderStatus.rejected,  (s, a) => { s.updateStatus = 'failed'; s.error = a.payload ?? 'Update failed'; });
  },
});

export const { clearOrderMessage } = ordersSlice.actions;
export default ordersSlice.reducer;