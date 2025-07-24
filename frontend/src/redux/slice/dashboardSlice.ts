import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { fetchDashboardStats, fetchTopCompanies, fetchUserMonthly } from '@/config/api';

interface DashboardState {
    stats: {
        users: number;
        companies: number;
        jobs: number;
        resumes: number;
    };
    topCompanies: { name: string; count: number }[];
    userMonthly: { label: string; value: number }[];
    loading: boolean;
}

const initialState: DashboardState = {
    stats: {
        users: 0,
        companies: 0,
        jobs: 0,
        resumes: 0,
    },
    topCompanies: [],
    userMonthly: [],
    loading: false,
};

// thunk action
export const fetchDashboardData = createAsyncThunk(
    'dashboard/fetchDashboardData',
    async (_, { rejectWithValue }) => {
        try {
            const [statsRes, companiesRes, monthlyRes] = await Promise.all([
                fetchDashboardStats(),
                fetchTopCompanies(),
                fetchUserMonthly(),
            ]);

            return {
                stats: statsRes.data,
                topCompanies: companiesRes.data,
                userMonthly: monthlyRes.data,
            };
        } catch (err: any) {
            return rejectWithValue(err.response?.data || 'Lỗi fetch dashboard');
        }
    }
);

const dashboardSlice = createSlice({
    name: 'dashboard',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchDashboardData.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchDashboardData.fulfilled, (state, action) => {
                state.stats = action.payload.stats;
                state.topCompanies = action.payload.topCompanies;
                state.userMonthly = action.payload.userMonthly;
                state.loading = false;
            })
            .addCase(fetchDashboardData.rejected, (state) => {
                state.loading = false;
            });
    },
});

export default dashboardSlice.reducer;