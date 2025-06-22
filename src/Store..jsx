import { configureStore } from '@reduxjs/toolkit';
import AlertSlice from "./slices/AlertSlice";

const store = configureStore({
    reducer: {
        alert: AlertSlice
    },
});

export default store;