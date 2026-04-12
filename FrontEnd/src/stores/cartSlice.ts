import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface CartState {
  isCartDrawerOpen: boolean;
}

const initialState: CartState = {
  isCartDrawerOpen: false,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    toggleCartDrawer(state) {
      state.isCartDrawerOpen = !state.isCartDrawerOpen;
    },
    setCartDrawerOpen(state, action: PayloadAction<boolean>) {
      state.isCartDrawerOpen = action.payload;
    },
  },
});

export const { toggleCartDrawer, setCartDrawerOpen } = cartSlice.actions;

export default cartSlice.reducer;
