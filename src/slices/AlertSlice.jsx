import { createSlice } from '@reduxjs/toolkit';

const AlertSlice = createSlice({
    name: 'alerts',
    initialState: "",
    reducers: {
        setAlertMessage: (state, action) => action.payload,
    },
});
export const { setAlertMessage } = AlertSlice.actions;
export default AlertSlice.reducer;