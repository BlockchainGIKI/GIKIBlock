import { configureStore } from '@reduxjs/toolkit';
import accountReducer from './accountSlice';
import changeReducer from './changeSlice';

export default configureStore({
    reducer: {
        account: accountReducer,
        change: changeReducer
    }
})