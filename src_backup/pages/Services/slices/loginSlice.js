import { createSlice } from '@reduxjs/toolkit';
const loginSlice = createSlice({
    name: 'login',
    initialState: {
        activeModal: 'login',
        loginData: {},
        registrationData: {},
        isLogin: false,
        activeTab: 'phone',
    },
    reducers: {
        setActiveModal: (state, action) => {
            state.activeModal = action.payload;
        },
        setActiveTab: (state, action) => {
            state.activeTab = action.payload;
        },
        updateLoginData: (state, action) => {
            state.loginData = {
                ...state.loginData,
                ...action.payload,
            };
            state.activeModal = 'code';
        },
        updateRegistrationData: (state, action) => {
            state.registrationData = {
                ...state.registrationData,
                ...action.payload,
            };
        },
        setIsLogin: (state) => {
            state.isLogin = true;
        },
    },
});
export const { setActiveModal, updateLoginData, setIsLogin, setActiveTab, updateRegistrationData, } = loginSlice.actions;
export default loginSlice.reducer;
