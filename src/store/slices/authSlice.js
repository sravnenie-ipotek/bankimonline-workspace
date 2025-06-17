import { createSlice } from '@reduxjs/toolkit';
import { EAuthSteps } from '../../../types/enums/authSteps.enum.ts';
import { ERestorePasswordSteps } from '../../../types/enums/restorePasswordSteps.enum.ts';
import { ESignUpSteps } from '../../../types/enums/signUpSteps.enum.ts';
const initialState = {
    authStep: EAuthSteps.Auth,
    restorePasswordStep: ERestorePasswordSteps.TypeVerify,
    signUpStep: ESignUpSteps.SignUp,
    activeTab: 'phone',
};
const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setAuthSteps: (state, action) => {
            state.authStep = action.payload;
        },
        setRestorePasswordSteps: (state, action) => {
            state.restorePasswordStep = action.payload;
        },
        setSignUpSteps: (state, action) => {
            state.signUpStep = action.payload;
        },
        setActiveTab: (state, action) => {
            state.activeTab = action.payload;
        },
    },
});
export const { setAuthSteps, setRestorePasswordSteps, setSignUpSteps, setActiveTab, } = authSlice.actions;
export const authStepSelector = (state) => state.auth.authStep;
export const restorePasswordStepSelector = (state) => state.auth.restorePasswordStep;
export const signUpStepSelector = (state) => state.auth.signUpStep;
export const activeTabSelector = (state) => state.auth.activeTab;
export default authSlice.reducer;
