import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    token: localStorage.getItem("token") || null,
    username: localStorage.getItem("username") || null,
    userId: localStorage.getItem("userId") || null, // Add userId to the initial state
  },
  reducers: {
    setToken: (state, action) => {
      state.token = action.payload;
    },
    setUsername: (state, action) => {
      state.username = action.payload;
    },
    setUserId: (state, action) => {
      state.userId = action.payload; // Set the userId
    },
    clearToken: (state) => {
      state.token = null;
      state.username = null;
      state.userId = null; // Clear userId when logging out
    },
  },
});

export const { setToken, setUsername, setUserId, clearToken } = authSlice.actions;

export const selectToken = (state) => state.auth.token;

export const selectUsername = (state) => state.auth.username;

export const selectUserId = (state) => {
  const userId = state.auth.userId;
  return userId ? parseInt(userId, 10) : null;
};

export default authSlice.reducer;
