import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { cartApi } from '../api';

export const fetchCart = createAsyncThunk('cart/fetch', async (_, { rejectWithValue }) => {
  try {
    const res = await cartApi.getCart();
    return res.data.data.cart;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const addToCart = createAsyncThunk('cart/add', async (data, { rejectWithValue }) => {
  try {
    const res = await cartApi.addToCart(data);
    return res.data.data.cart;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to add to cart');
  }
});

export const updateCartItem = createAsyncThunk('cart/update', async ({ itemId, quantity }, { rejectWithValue }) => {
  try {
    const res = await cartApi.updateItem(itemId, quantity);
    return res.data.data.cart;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const removeFromCart = createAsyncThunk('cart/remove', async (itemId, { rejectWithValue }) => {
  try {
    const res = await cartApi.removeItem(itemId);
    return res.data.data.cart;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const clearCart = createAsyncThunk('cart/clear', async (_, { rejectWithValue }) => {
  try {
    await cartApi.clearCart();
    return { items: [] };
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

const cartSlice = createSlice({
  name: 'cart',
  initialState: { items: [], loading: false, error: null },
  reducers: {
    resetCart(state) { state.items = []; },
  },
  extraReducers: (builder) => {
    const setCart = (state, action) => {
      state.loading = false;
      state.items = action.payload?.items || [];
    };
    builder
      .addCase(fetchCart.pending, (s) => { s.loading = true; })
      .addCase(fetchCart.fulfilled, setCart)
      .addCase(fetchCart.rejected, (s) => { s.loading = false; })
      .addCase(addToCart.fulfilled, setCart)
      .addCase(updateCartItem.fulfilled, setCart)
      .addCase(removeFromCart.fulfilled, setCart)
      .addCase(clearCart.fulfilled, (s) => { s.items = []; });
  },
});

export const { resetCart } = cartSlice.actions;
export const selectCartCount = (state) => state.cart.items.reduce((sum, i) => sum + i.quantity, 0);
export const selectCartTotal = (state) => state.cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
export default cartSlice.reducer;
