import { createSlice } from '@reduxjs/toolkit';

const WorkspaceInfoSlice = createSlice({
    name: {
        no:0,
        name:""
    },
    initialState: {
        no:0,
        name:""
    },
    reducers: {
        setWorkspaceInfo: (state, action) => action.payload
    },
});
export const { setWorkspaceInfo } = WorkspaceInfoSlice.actions;
export default WorkspaceInfoSlice.reducer;