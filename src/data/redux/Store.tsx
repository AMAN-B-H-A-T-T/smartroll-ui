import {configureStore} from '@reduxjs/toolkit'
import authSlice from './slices/authSlice'
import loaderSlice from './slices/loaderSlice';
const Store = configureStore({
    reducer: {
        auth: authSlice,
        loader : loaderSlice
    } 
})

// Define types for RootState and AppDispatch for better type support across the app
export type RootState = ReturnType<typeof Store.getState>;
export type AppDispatch = typeof Store.dispatch;

export default Store