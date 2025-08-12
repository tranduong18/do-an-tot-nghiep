import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { callGetUserById } from "@/config/api";

// Thunk để fetch user theo ID
export const fetchUserById = createAsyncThunk(
    "user/fetchById",
    async (id: string) => {
        const response = await callGetUserById(id);
        return response.data;
    }
);

interface IUserState {
    isLoading: boolean;
    error: string;
    user: {
        id?: string;
        email: string;
        name: string;
        age: number;
        gender: string;
        address: string;
        avatar: string;
        cvUrl: string;
    };
}

const initialState: IUserState = {
    isLoading: false,
    error: "",
    user: {
        id: "",
        email: "",
        name: "",
        age: 0,
        gender: "",
        address: "",
        avatar: "",
        cvUrl: ""
    },
};

export const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        setUserDetail: (state, action) => {
            state.user = action.payload;
        },
        clearUserDetail: (state) => {
            state.user = initialState.user;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(fetchUserById.pending, (state) => {
            state.isLoading = true;
            state.error = "";
        });

        builder.addCase(fetchUserById.fulfilled, (state, action) => {
            state.isLoading = false;
            if (action?.payload) {
                state.user.id = action?.payload?.id;
                state.user.email = action.payload.email;
                state.user.name = action.payload.name;

                state.user.age = action?.payload.age;
                state.user.gender = action?.payload.gender;
                state.user.address = action?.payload.address;
                state.user.avatar = action?.payload.avatar;
                state.user.cvUrl = action?.payload.cvUrl;
            }
        });

        builder.addCase(fetchUserById.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.error.message || "Fetch user failed";
        });
    },
});

export const { setUserDetail, clearUserDetail } = userSlice.actions;
export default userSlice.reducer;
