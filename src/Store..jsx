import { configureStore } from '@reduxjs/toolkit';
import AlertSlice from "./slices/AlertSlice";
import WorkspaceInfoSlice from "./slices/WorkspaceInfoSlice";
import StreamInfoSlice from "./slices/StreamInfoSlice";

const store = configureStore({
    reducer: {
        alert: AlertSlice,
        workspaceInfo: WorkspaceInfoSlice,
        streamInfo: StreamInfoSlice,
    },
});

export default store;