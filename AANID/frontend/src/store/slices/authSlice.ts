import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  role?: string;
  profilePicture?: string;
  avatar?: string;
  villeId?: string;
  villeNom?: string;
  pays?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    },
    setVille: (state, action: PayloadAction<{ villeId: string; villeNom: string }>) => {
      if (state.user) {
        state.user.villeId = action.payload.villeId;
        state.user.villeNom = action.payload.villeNom;
      }
    },
  },
});

export const { setCredentials, logout, setVille } = authSlice.actions;
export default authSlice.reducer;

export const selectCurrentUser = (state: { auth: AuthState }) => state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectCurrentVille = (state: { auth: AuthState }) => ({
  villeId: state.auth.user?.villeId || null,
  villeNom: state.auth.user?.villeNom || null,
});
