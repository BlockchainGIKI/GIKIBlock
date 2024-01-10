import { createSlice } from '@reduxjs/toolkit';

export const changeSlice = createSlice({
    name: 'change',
    initialState: {
        value: true
    },
    reducers: {
        setChange: (state, action) => {
            state.value = action.payload;
        }
    }
})

export const { setChange } = changeSlice.actions

export default changeSlice.reducer

export const selectChange = state => state.change.value