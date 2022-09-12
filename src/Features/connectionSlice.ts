import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    isAdmin: false,
    accountInfo: {},
}

export const connectionSlice = createSlice({
    name: 'connection',
    initialState,
    reducers: {
        setIsAdmin: (state, action) => {
            state.isAdmin = action.payload
        },
        setAccountInfo: (state, action) => {
            state.accountInfo = action.payload
        }
    },
})

// Action creators are generated for each case reducer function
export const { setIsAdmin, setAccountInfo } = connectionSlice.actions
export default connectionSlice.reducer
