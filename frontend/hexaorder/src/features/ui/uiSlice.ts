import { createSlice } from '@reduxjs/toolkit';

interface UiState {
  sidebarOpen: boolean;
  modalOpen: boolean;
  modalType: string | null;
  theme: 'light' | 'dark';
}

const initialState: UiState = {
  sidebarOpen: false,
  modalOpen: false,
  modalType: null,
  theme: 'light',
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar(state) {
      state.sidebarOpen = !state.sidebarOpen;
    },
    closeSidebar(state) {
      state.sidebarOpen = false;
    },
    openSidebar(state) {
      state.sidebarOpen = true;
    },
    openModal(state, action) {
      state.modalOpen = true;
      state.modalType = action.payload;
    },
    closeModal(state) {
      state.modalOpen = false;
      state.modalType = null;
    },
    toggleTheme(state) {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
  },
});

export const { 
  toggleSidebar, 
  closeSidebar, 
  openSidebar,
  openModal, 
  closeModal,
  toggleTheme 
} = uiSlice.actions;

export default uiSlice.reducer;