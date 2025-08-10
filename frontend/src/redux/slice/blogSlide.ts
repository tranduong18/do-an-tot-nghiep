import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { IModelPaginate, IBackendRes, IBlog } from "@/types/backend";
import { callBlogList } from "@/config/api";

interface IState {
    isFetching: boolean;
    meta: { page: number; pageSize: number; pages: number; total: number };
    result: IBlog[];
}

export const fetchBlog = createAsyncThunk<
    IBackendRes<IModelPaginate<IBlog>>,
    { query: string; adminView?: boolean }
>("blog/fetchBlog", async ({ query, adminView }) => {
    const res = await callBlogList(query, adminView);
    return res;
});

const initialState: IState = {
    isFetching: true,
    meta: { page: 1, pageSize: 10, pages: 0, total: 0 },
    result: [],
};

export const blogSlide = createSlice({
    name: "blog",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(fetchBlog.pending, (state) => {
            state.isFetching = true;
        });
        builder.addCase(fetchBlog.rejected, (state) => {
            state.isFetching = false;
        });
        builder.addCase(fetchBlog.fulfilled, (state, action) => {
            if (action.payload?.data) {
                state.isFetching = false;
                state.meta = action.payload.data.meta;
                state.result = action.payload.data.result;
            }
        });
    },
});

export default blogSlide.reducer;
