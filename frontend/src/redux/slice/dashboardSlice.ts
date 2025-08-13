import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { fetchDashboardSummary } from '@/config/api';

type LabelCount = { label: string; count: number };

interface SummaryState {
    cards: {
        jobsActive: number; companies: number; resumesThisMonth: number; users: number;
        usersNew30d: number; companiesNew30d: number; jobsNew30d: number; activeUsers24h: number;
    };
    charts: {
        jobsMonthly: LabelCount[];
        jobSpecializationRatio: LabelCount[];
        resumePeakHour: LabelCount[];
        topCompaniesThisMonth: LabelCount[];
        resumesBySpecializationYear: LabelCount[];
    };
    loading: boolean;
    error?: string;
}

const initialState: SummaryState = {
    cards: { jobsActive: 0, companies: 0, resumesThisMonth: 0, users: 0, usersNew30d: 0, companiesNew30d: 0, jobsNew30d: 0, activeUsers24h: 0 },
    charts: { jobsMonthly: [], jobSpecializationRatio: [], resumePeakHour: [], topCompaniesThisMonth: [], resumesBySpecializationYear: [] },
    loading: false,
};

export const fetchDashboard = createAsyncThunk(
    'dashboard/fetchSummary',
    async (params: { months?: number; top?: number; daysForPeak?: number } | undefined, { rejectWithValue }) => {
        try {
            const res = await fetchDashboardSummary(params);
            // nếu backend bọc {statusCode, message, data} như bạn gửi:
            const data = res.data?.data ?? res.data;
            return data;
        } catch (e: any) {
            return rejectWithValue(e?.response?.data || 'Lỗi tải dashboard');
        }
    }
);

const dashboardSlice = createSlice({
    name: 'dashboard',
    initialState,
    reducers: {},
    extraReducers: (b) => {
        b.addCase(fetchDashboard.pending, (s) => { s.loading = true; s.error = undefined; });
        b.addCase(fetchDashboard.fulfilled, (s, a: any) => {
            s.cards = a.payload.cards;
            s.charts = a.payload.charts;
            s.loading = false;
        });
        b.addCase(fetchDashboard.rejected, (s, a: any) => {
            s.loading = false;
            s.error = a.payload ?? 'Lỗi tải dashboard';
        });
    },
});

export default dashboardSlice.reducer;
