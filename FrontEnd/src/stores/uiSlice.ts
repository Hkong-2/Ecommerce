import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface UiState {
  isAddressModalOpen: boolean;
  addressToEdit: number | null; // null if creating a new one
}

const initialState: UiState = {
  isAddressModalOpen: false,
  addressToEdit: null,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    openAddressModal(state, action: PayloadAction<number | null>) {
      state.isAddressModalOpen = true;
      state.addressToEdit = action.payload;
    },
    closeAddressModal(state) {
      state.isAddressModalOpen = false;
      state.addressToEdit = null;
    },
  },
});

export const { openAddressModal, closeAddressModal } = uiSlice.actions;
export default uiSlice.reducer;
