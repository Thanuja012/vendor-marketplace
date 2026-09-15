import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authApi } from '../api';

export const loginUser = createAsyncThunk('auth/login', async (data, { rejectWithValue }) => {
  try {
    const res = await authApi.login(data);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Login failed');
  }
});

export const registerUser = createAsyncThunk('auth/register', async (data, { rejectWithValue }) => {
  try {
    const res = await authApi.register(data);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Registration failed');
  }
});

export const fetchMe = createAsyncThunk('auth/me', async (_, { rejectWithValue }) => {
  try {
    const res = await authApi.getMe();
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

const stored = localStorage.getItem('user');
const initialState = {
  user: stored ? JSON.parse(stored) : null,
  token: localStorage.getItem('token') || null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    clearError(state) { state.error = null; },
    updateUser(state, action) {
      state.user = { ...state.user, ...action.payload };
      localStorage.setItem('user', JSON.stringify(state.user));
    },
  },
  extraReducers: (builder) => {
    const handleAuth = (state, action) => {
      state.loading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('user', JSON.stringify(action.payload.user));
    };
    builder
      .addCase(loginUser.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(loginUser.fulfilled, handleAuth)
      .addCase(loginUser.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(registerUser.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(registerUser.fulfilled, handleAuth)
      .addCase(registerUser.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(fetchMe.fulfilled, (s, a) => { s.user = a.payload.user; localStorage.setItem('user', JSON.stringify(a.payload.user)); });
  },
});

export const { logout, clearError, updateUser } = authSlice.actions;
export default authSlice.reducer;
