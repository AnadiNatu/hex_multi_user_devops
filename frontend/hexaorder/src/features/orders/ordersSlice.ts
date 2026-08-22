import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { Order } from '../../types';
import { ordersService } from './ordersService';
import { RootState } from '../../app/store';

// interface OrdersState {
//   items:        Order[];
//   fetchStatus:  'idle' | 'loading' | 'failed';
//   createStatus: 'idle' | 'loading' | 'failed';
//   updateStatus: 'idle' | 'loading' | 'failed';
//   message:      string | null;
//   error:        string | null;
// }

// const initialState: OrdersState = {
//   items:        [],
//   fetchStatus:  'idle',
//   createStatus: 'idle',
//   updateStatus: 'idle',
//   message:      null,
//   error:        null,
// };

// export const fetchOrders = createAsyncThunk<
//   Order[], void, { state: RootState; rejectValue: string }
// >('orders/fetchOrders', async (_, { getState, rejectWithValue }) => {
//   try {
//     const rawRole = getState().auth.user?.rawRole;
//     return await ordersService.getOrders(rawRole);
//   } catch (error) {
//     return rejectWithValue(error instanceof Error ? error.message : 'Unable to load orders');
//   }
// });

// export const createOrder = createAsyncThunk<
//   Order,
//   { items: Array<{ productId: string; quantity: number }> },
//   { rejectValue: string }
// >('orders/createOrder', async (payload, { rejectWithValue }) => {
//   try {
//     return await ordersService.createOrder(payload);
//   } catch (error) {
//     return rejectWithValue(error instanceof Error ? error.message : 'Unable to create order');
//   }
// });

// export const updateOrderStatus = createAsyncThunk<
//   Order,
//   { id: string; status: Order['status'] },
//   { rejectValue: string }
// >('orders/updateOrderStatus', async ({ id, status }, { rejectWithValue }) => {
//   try {
//     return await ordersService.updateOrderStatus(id, status);
//   } catch (error) {
//     return rejectWithValue(error instanceof Error ? error.message : 'Unable to update order');
//   }
// });

// export const cancelOrder = createAsyncThunk<Order, string, {rejectValue:string}>('orders/cancelOrder', async( id, {rejectWithValue})=>{
// try{
// return await ordersService.cancelOrder(id);
// }

// catch(error){
// return rejectWithValue(error instanceof Error?error.message:'Unable to cancel order');
// }
// });


// export const deleteOwnOrder = createAsyncThunk<string,string,{rejectValue:string}>('orders/deleteOwn',async(id,{rejectWithValue})=>{
// try{
// await ordersService.deleteOwnOrder(id);
// return id;
// }
// catch(error){
// return rejectWithValue(error instanceof Error?error.message:'Delete failed');
// }
// });

// export const deleteAdminOrder = createAsyncThunk< string, string, {rejectValue:string}>('orders/deleteAdmin', async(id,{rejectWithValue})=>{
// try{
// await ordersService.deleteAdminOrder(id);
// return id;
// }
// catch(error){
// return rejectWithValue(error instanceof Error?error.message:'Delete failed');
// }
// });



// const ordersSlice = createSlice({
//   name: 'orders',
//   initialState,
//   reducers: {
//     clearOrderMessage(state) {
//       state.message      = null;
//       state.error        = null;
//       state.createStatus = 'idle';
//       state.updateStatus = 'idle';
//     },
//   },
//   extraReducers: (builder) => {
//     builder
//       .addCase(fetchOrders.pending,   (s) => { s.fetchStatus = 'loading'; s.error = null; })
//       .addCase(fetchOrders.fulfilled, (s, a) => { s.fetchStatus = 'idle'; s.items = a.payload; })
//       .addCase(fetchOrders.rejected,  (s, a) => { s.fetchStatus = 'failed'; s.error = a.payload ?? 'Load failed'; });

//     builder
//       .addCase(createOrder.pending,   (s) => { s.createStatus = 'loading'; s.message = null; s.error = null; })
//       .addCase(createOrder.fulfilled, (s, a) => {
//         s.createStatus = 'idle';
//         s.items        = [a.payload, ...s.items];
//         s.message      = 'Order created successfully';
//       })
//       .addCase(createOrder.rejected,  (s, a) => { s.createStatus = 'failed'; s.error = a.payload ?? 'Create failed'; });

//     builder
//       .addCase(updateOrderStatus.pending,   (s) => { s.updateStatus = 'loading'; s.message = null; s.error = null; })
//       .addCase(updateOrderStatus.fulfilled, (s, a) => {
//         s.updateStatus = 'idle';
//         const idx = s.items.findIndex((o) => o.id === a.payload.id);
//         if (idx !== -1) s.items[idx] = a.payload;
//         s.message = 'Order status updated';
//       })
//       .addCase(updateOrderStatus.rejected,  (s, a) => { s.updateStatus = 'failed'; s.error = a.payload ?? 'Update failed'; });

//       builder
//       .addCase(cancelOrder.fulfilled , (s,a) => {const idx = s.items.findIndex(o => o.id === a.payload.id) ; 
//         if (idx !== -1){s.items[idx]=a.payload;}
//         s.message='Order cancelled';
//       })

//       builder
//       .addCase(deleteOwnOrder.fulfilled , (s,a) => {s.items = s.items.filter(o => o.id !== a.payload); 
//         s.message = 'Order deleted';
//       })

//       builder
//       .addCase(deleteAdminOrder.fulfilled , (s,a) => {s.items = s.items.filter(o => o.id! == a.payload);
//         s.message = 'Order deleted';
//       })
//   },
// });

// export const { clearOrderMessage } = ordersSlice.actions;
// export default ordersSlice.reducer;


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
    return rejectWithValue(
      error instanceof Error ? error.message : 'Unable to load orders'
    );
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
    return rejectWithValue(
      error instanceof Error ? error.message : 'Unable to create order'
    );
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
    return rejectWithValue(
      error instanceof Error ? error.message : 'Unable to update order'
    );
  }
});

export const cancelOrder = createAsyncThunk<
  Order,
  string,
  { rejectValue: string }
>('orders/cancelOrder', async (id, { rejectWithValue }) => {
  try {
    return await ordersService.cancelOrder(id);
  } catch (error) {
    return rejectWithValue(
      error instanceof Error ? error.message : 'Unable to cancel order'
    );
  }
});

export const deleteOwnOrder = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>('orders/deleteOwn', async (id, { rejectWithValue }) => {
  try {
    await ordersService.deleteOwnOrder(id);
    return id;
  } catch (error) {
    return rejectWithValue(
      error instanceof Error ? error.message : 'Delete failed'
    );
  }
});

export const deleteAdminOrder = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>('orders/deleteAdmin', async (id, { rejectWithValue }) => {
  try {
    await ordersService.deleteAdminOrder(id);
    return id;
  } catch (error) {
    return rejectWithValue(
      error instanceof Error ? error.message : 'Delete failed'
    );
  }
});

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    clearOrderMessage(state) {
      state.message = null;
      state.error = null;
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
      })

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
      })

      .addCase(updateOrderStatus.pending, (state) => {
        state.updateStatus = 'loading';
        state.message = null;
        state.error = null;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.updateStatus = 'idle';

        const index = state.items.findIndex(
          (order) => order.id === action.payload.id
        );

        if (index !== -1) {
          state.items[index] = action.payload;
        }

        state.message = 'Order status updated';
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.updateStatus = 'failed';
        state.error = action.payload ?? 'Unable to update order status';
      })

      .addCase(cancelOrder.pending, (state) => {
        state.updateStatus = 'loading';
        state.message = null;
        state.error = null;
      })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        state.updateStatus = 'idle';

        const index = state.items.findIndex(
          (order) => order.id === action.payload.id
        );

        if (index !== -1) {
          state.items[index] = action.payload;
        }

        state.message = 'Order cancelled successfully';
      })
      .addCase(cancelOrder.rejected, (state, action) => {
        state.updateStatus = 'failed';
        state.error = action.payload ?? 'Unable to cancel order';
      })

      .addCase(deleteOwnOrder.pending, (state) => {
        state.updateStatus = 'loading';
        state.message = null;
        state.error = null;
      })
      .addCase(deleteOwnOrder.fulfilled, (state, action) => {
        state.updateStatus = 'idle';
        state.items = state.items.filter(
          (order) => order.id !== action.payload
        );
        state.message = 'Order deleted successfully';
      })
      .addCase(deleteOwnOrder.rejected, (state, action) => {
        state.updateStatus = 'failed';
        state.error = action.payload ?? 'Unable to delete order';
      })

      .addCase(deleteAdminOrder.pending, (state) => {
        state.updateStatus = 'loading';
        state.message = null;
        state.error = null;
      })
      .addCase(deleteAdminOrder.fulfilled, (state, action) => {
        state.updateStatus = 'idle';
        state.items = state.items.filter(
          (order) => order.id !== action.payload
        );
        state.message = 'Order deleted successfully';
      })
      .addCase(deleteAdminOrder.rejected, (state, action) => {
        state.updateStatus = 'failed';
        state.error = action.payload ?? 'Unable to delete order';
      });
  },
});

export const { clearOrderMessage } = ordersSlice.actions;

export default ordersSlice.reducer;
