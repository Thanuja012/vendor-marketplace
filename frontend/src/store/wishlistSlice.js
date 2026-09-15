import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { wishlistApi } from '../api';

export const fetchWishlist = createAsyncThunk('wishlist/fetch', async (_, { rejectWithValue }) => {
  try {
    const res = await wishlistApi.getWishlist();
    return res.data.data.wishlist;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const addToWishlist = createAsyncThunk('wishlist/add', async (productId, { rejectWithValue }) => {
  try {
    const res = await wishlistApi.addToWishlist(productId);
    return res.data.data.wishlist;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const removeFromWishlist = createAsyncThunk('wishlist/remove', async (productId, { rejectWithValue }) => {
  try {
    const res = await wishlistApi.removeFromWishlist(productId);
    return res.data.data.wishlist;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: { products: [], loading: false },
  reducers: {
    resetWishlist(state) { state.products = []; },
  },
  extraReducers: (builder) => {
    const setWishlist = (state, action) => {
      state.loading = false;
      state.products = action.payload?.products || [];
    };
    builder
      .addCase(fetchWishlist.pending, (s) => { s.loading = true; })
      .addCase(fetchWishlist.fulfilled, setWishlist)
      .addCase(fetchWishlist.rejected, (s) => { s.loading = false; })
      .addCase(addToWishlist.fulfilled, setWishlist)
      .addCase(removeFromWishlist.fulfilled, setWishlist);
  },
});

export const { resetWishlist } = wishlistSlice.actions;
export const selectIsWishlisted = (productId) => (state) =>
  state.wishlist.products.some((p) => (p._id || p) === productId);
export default wishlistSlice.reducer;
