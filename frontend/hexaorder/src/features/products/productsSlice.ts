import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Product, ProductFormData, ProductStatistics, PaginationState } from '../../types';
import { productsService } from './productsService';
import { RootState } from '../../app/store';

interface ProductsState {
  items: Product[];
  selectedProduct: Product | null;
  statistics: ProductStatistics | null;
  pagination: PaginationState;
  fetchStatus: 'idle' | 'loading' | 'failed';
  createStatus: 'idle' | 'loading' | 'failed';
  updateStatus: 'idle' | 'loading' | 'failed';
  deleteStatus: 'idle' | 'loading' | 'failed';
  message: string | null;
  error: string | null;
}

const initialState: ProductsState = {
  items: [],
  selectedProduct: null,
  statistics: null,
  pagination: { page: 0, size: 12, total: 0, totalPages: 1 },
  fetchStatus: 'idle',
  createStatus: 'idle',
  updateStatus: 'idle',
  deleteStatus: 'idle',
  message: null,
  error: null,
};

// ─── Thunks ──────────────────────────────────────────────────────────────────

export const fetchProducts = createAsyncThunk<
  { products: Product[]; statistics?: ProductStatistics },
  void,
  { state: RootState; rejectValue: string }
>('products/fetchProducts', async (_, { getState, rejectWithValue }) => {
  try {
    const rawRole = getState().auth.user?.rawRole;
    return await productsService.getProducts(rawRole);
  } catch (error) {
    return rejectWithValue(
      error instanceof Error ? error.message : 'Unable to load products'
    );
  }
});

export const searchProducts = createAsyncThunk<
  Product[],
  string,
  { state: RootState; rejectValue: string }
>(
  'products/searchProducts',
  async (keyword, { getState, rejectWithValue }) => {
    try {
      // Pass rawRole so service can route to the correct endpoint per role
      const rawRole = getState().auth.user?.rawRole;
      return await productsService.searchProducts(keyword, rawRole);
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Search failed'
      );
    }
  }
);

export const fetchProductById = createAsyncThunk<
  Product,
  string,
  { rejectValue: string }
>('products/fetchProductById', async (id, { rejectWithValue }) => {
  try {
    return await productsService.getProductById(id);
  } catch (error) {
    return rejectWithValue(
      error instanceof Error ? error.message : 'Unable to load product'
    );
  }
});

export const createProduct = createAsyncThunk<
  Product,
  { formData: ProductFormData; imageFile?: File | null },
  { rejectValue: string }
>('products/createProduct', async ({ formData, imageFile }, { rejectWithValue }) => {
  try {
    return await productsService.createProduct(formData, imageFile);
  } catch (error) {
    return rejectWithValue(
      error instanceof Error ? error.message : 'Unable to create product'
    );
  }
});

export const updateProduct = createAsyncThunk<
  Product,
  { id: string; formData: ProductFormData; imageFile?: File | null },
  { rejectValue: string }
>('products/updateProduct', async ({ id, formData, imageFile }, { rejectWithValue }) => {
  try {
    return await productsService.updateProduct(id, formData, imageFile);
  } catch (error) {
    return rejectWithValue(
      error instanceof Error ? error.message : 'Unable to update product'
    );
  }
});

export const deleteProduct = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>('products/deleteProduct', async (id, { rejectWithValue }) => {
  try {
    await productsService.deleteProduct(id);
    return id;
  } catch (error) {
    return rejectWithValue(
      error instanceof Error ? error.message : 'Unable to delete product'
    );
  }
});

export const updateProductStock = createAsyncThunk<
  Product,
  { id: string; quantity: number },
  { rejectValue: string }
>('products/updateStock', async ({ id, quantity }, { rejectWithValue }) => {
  try {
    return await productsService.updateStock(id, quantity);
  } catch (error) {
    return rejectWithValue(
      error instanceof Error ? error.message : 'Unable to update stock'
    );
  }
});

export const toggleProductActive = createAsyncThunk<
  Product,
  string,
  { rejectValue: string }
>('products/toggleActive', async (id, { rejectWithValue }) => {
  try {
    return await productsService.toggleActive(id);
  } catch (error) {
    return rejectWithValue(
      error instanceof Error ? error.message : 'Unable to toggle status'
    );
  }
});

// ─── Slice ────────────────────────────────────────────────────────────────────

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearProductMessage(state) {
      state.message = null;
      state.error = null;
      state.createStatus = 'idle';
      state.updateStatus = 'idle';
      state.deleteStatus = 'idle';
    },
    clearSelectedProduct(state) {
      state.selectedProduct = null;
    },
    setPage(state, action: PayloadAction<number>) {
      state.pagination.page = action.payload;
    },
    setPageSize(state, action: PayloadAction<number>) {
      state.pagination.size = action.payload;
      state.pagination.page = 0;
    },
  },
  extraReducers: (builder) => {
    // Fetch all
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.fetchStatus = 'loading';
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.fetchStatus = 'idle';
        state.items = action.payload.products;
        if (action.payload.statistics) {
          state.statistics = action.payload.statistics;
        }
        state.pagination.total = action.payload.products.length;
        state.pagination.totalPages = Math.ceil(
          action.payload.products.length / state.pagination.size
        );
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.fetchStatus = 'failed';
        state.error = action.payload ?? 'Unable to load products';
      });

    // Search
    builder
      .addCase(searchProducts.pending, (state) => {
        state.fetchStatus = 'loading';
      })
      .addCase(searchProducts.fulfilled, (state, action) => {
        state.fetchStatus = 'idle';
        state.items = action.payload;
        state.pagination.total = action.payload.length;
        state.pagination.totalPages = Math.ceil(
          action.payload.length / state.pagination.size
        );
      })
      .addCase(searchProducts.rejected, (state, action) => {
        state.fetchStatus = 'failed';
        state.error = action.payload ?? 'Search failed';
      });

    // Fetch single
    builder
      .addCase(fetchProductById.pending, (state) => {
        state.fetchStatus = 'loading';
        state.error = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.fetchStatus = 'idle';
        state.selectedProduct = action.payload;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.fetchStatus = 'failed';
        state.error = action.payload ?? 'Unable to load product';
      });

    // Create
    builder
      .addCase(createProduct.pending, (state) => {
        state.createStatus = 'loading';
        state.message = null;
        state.error = null;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.createStatus = 'idle';
        state.items = [action.payload, ...state.items];
        state.message = 'Product created successfully';
        state.pagination.total += 1;
        state.pagination.totalPages = Math.ceil(
          state.pagination.total / state.pagination.size
        );
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.createStatus = 'failed';
        state.error = action.payload ?? 'Unable to create product';
      });

    // Update
    builder
      .addCase(updateProduct.pending, (state) => {
        state.updateStatus = 'loading';
        state.message = null;
        state.error = null;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.updateStatus = 'idle';
        const idx = state.items.findIndex((p) => p.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
        if (state.selectedProduct?.id === action.payload.id) {
          state.selectedProduct = action.payload;
        }
        state.message = 'Product updated successfully';
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.updateStatus = 'failed';
        state.error = action.payload ?? 'Unable to update product';
      });

    // Delete
    builder
      .addCase(deleteProduct.pending, (state) => {
        state.deleteStatus = 'loading';
        state.message = null;
        state.error = null;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.deleteStatus = 'idle';
        state.items = state.items.filter((p) => p.id !== action.payload);
        state.message = 'Product deleted successfully';
        state.pagination.total = Math.max(0, state.pagination.total - 1);
        state.pagination.totalPages = Math.ceil(
          state.pagination.total / state.pagination.size
        );
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.deleteStatus = 'failed';
        state.error = action.payload ?? 'Unable to delete product';
      });

    // Stock update
    builder.addCase(updateProductStock.fulfilled, (state, action) => {
      const idx = state.items.findIndex((p) => p.id === action.payload.id);
      if (idx !== -1) state.items[idx] = action.payload;
      if (state.selectedProduct?.id === action.payload.id) {
        state.selectedProduct = action.payload;
      }
      state.message = 'Stock updated successfully';
    });

    // Toggle active
    builder.addCase(toggleProductActive.fulfilled, (state, action) => {
      const idx = state.items.findIndex((p) => p.id === action.payload.id);
      if (idx !== -1) state.items[idx] = action.payload;
      if (state.selectedProduct?.id === action.payload.id) {
        state.selectedProduct = action.payload;
      }
      state.message = 'Product status updated';
    });
  },
});

export const {
  clearProductMessage,
  clearSelectedProduct,
  setPage,
  setPageSize,
} = productsSlice.actions;
export default productsSlice.reducer;