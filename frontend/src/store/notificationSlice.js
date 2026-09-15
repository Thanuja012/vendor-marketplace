import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { notificationApi } from '../api';

export const fetchNotifications = createAsyncThunk('notifications/fetch', async (_, { rejectWithValue }) => {
  try {
    const res = await notificationApi.getNotifications();
    return res.data.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const markAllRead = createAsyncThunk('notifications/markAll', async () => {
  await notificationApi.markAllRead();
});

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: { items: [], unreadCount: 0, loading: false },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.items = action.payload.notifications || [];
        state.unreadCount = action.payload.unreadCount || 0;
        state.loading = false;
      })
      .addCase(markAllRead.fulfilled, (state) => { state.unreadCount = 0; state.items.forEach((n) => { n.read = true; }); });
  },
});

export default notificationSlice.reducer;
