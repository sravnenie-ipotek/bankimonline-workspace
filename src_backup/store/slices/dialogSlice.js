import { createSlice } from '@reduxjs/toolkit';
const initialState = {
    title: null,
    onOk: null,
    okTitle: null,
    onCancel: null,
    onClose: null,
    cancelTitle: null,
    isVisible: false,
    content: null,
    isCloseIcon: false,
    maxWidth: null,
};
const dialogSlice = createSlice({
    name: 'dialog',
    initialState,
    reducers: {
        setDialog: (state, action) => {
            return {
                ...state,
                ...action.payload,
                isVisible: true,
            };
        },
        cancelDialog: (state) => {
            return { ...initialState };
        },
    },
});
export const { setDialog, cancelDialog } = dialogSlice.actions;
export const dialogSelector = (state) => state.dialog;
export default dialogSlice.reducer;
