import { createSlice } from '@reduxjs/toolkit';

const StreamInfoSlice = createSlice({
    name: {
        no:0,
        name:""
    },
    initialState: {
        no:0,
        name:""
    },
    reducers: {
        setStreamInfo: (state, action) => action.payload
    },
});
export const { setStreamInfo } = StreamInfoSlice.actions;
export default StreamInfoSlice.reducer;