import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    token: localStorage.getItem("token") || null,
    username: localStorage.getItem("username") || null, // Get the username's information from local storage
  },
  reducers: {
    setToken: (state, action) => {
      state.token = action.payload;
    },
    setUsername: (state, action) => {
      state.username = action.payload; // Set the username's information
    },
    clearToken: (state) => {
      state.token = null;
      state.username = null; // Clear username information when logging out
    },
  },
});

export const { setToken, setUsername, clearToken } = authSlice.actions;

export const selectToken = (state) => state.auth.token;

export default authSlice.reducer;
