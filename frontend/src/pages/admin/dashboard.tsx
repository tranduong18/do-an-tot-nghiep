import React, { useEffect } from 'react';
import { Card, Col, Row, Statistic, Typography } from 'antd';
import { UserOutlined, SolutionOutlined, FileDoneOutlined, AppstoreOutlined } from '@ant-design/icons';
import { Bar, Pie, Line } from 'react-chartjs-2';
import {
    Chart,
    BarElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement,
    Title,
} from 'chart.js';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchDashboardData } from '@/redux/slice/dashboardSlice';

Chart.register(
    BarElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement,
    Title
);

const DashboardAdmin: React.FC = () => {
    const dispatch = useAppDispatch();
    const { stats, topCompanies, userMonthly, loading } = useAppSelector(state => state.dashboard);

    useEffect(() => {
        dispatch(fetchDashboardData());
    }, [dispatch]);

    const barChartData = {
        labels: ['Người dùng', 'Nhà tuyển dụng', 'Việc làm', 'Hồ sơ'],
        datasets: [
            {
                label: 'Số lượng',
                data: [stats.users, stats.companies, stats.jobs, stats.resumes],
                backgroundColor: ['#1890ff', '#52c41a', '#faad14', '#eb2f96'],
                borderWidth: 1,
                barThickness: 30,
            },
        ],
    };

    const lineChartData = {
        labels: (userMonthly || []).map(item => item.label),
        datasets: [
            {
                label: 'Người dùng mới',
                data: (userMonthly || []).map(item => item.value),
                fill: false,
                borderColor: '#1890ff',
                backgroundColor: '#bae7ff',
                tension: 0.3,
            },
        ],
    };

    const topCompanyChart = {
        labels: topCompanies.map(c => c.name),
        datasets: [
            {
                label: 'Số lượng việc đăng',
                data: topCompanies.map(c => c.count),
                backgroundColor: '#52c41a',
                borderWidth: 1,
                barThickness: 25,
            },
        ],
    };

    return (
        <div>
            <Typography.Title level={2}>Tổng quan hệ thống</Typography.Title>
            <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col span={6}><Card loading={loading}><Statistic title="Người dùng" value={stats.users} prefix={<UserOutlined />} /></Card></Col>
                <Col span={6}><Card loading={loading}><Statistic title="Nhà tuyển dụng" value={stats.companies} prefix={<SolutionOutlined />} /></Card></Col>
                <Col span={6}><Card loading={loading}><Statistic title="Việc làm" value={stats.jobs} prefix={<AppstoreOutlined />} /></Card></Col>
                <Col span={6}><Card loading={loading}><Statistic title="Hồ sơ ứng tuyển" value={stats.resumes} prefix={<FileDoneOutlined />} /></Card></Col>
            </Row>

            <Row gutter={16}>
                <Col span={12}>
                    <Card title="Biểu đồ cột tổng quan" loading={loading}>
                        <Bar
                            data={barChartData}
                            height={250}
                            options={{
                                responsive: true,
                                plugins: { legend: { display: false } },
                                scales: {
                                    x: { ticks: { maxRotation: 0 }, grid: { display: false } },
                                    y: { beginAtZero: true, grid: { color: '#f0f0f0' } },
                                },
                                elements: { bar: { borderRadius: 5 } },
                            }}
                        />
                    </Card>
                </Col>
                <Col span={12}>
                    <Card title="Tỷ lệ phân bố" loading={loading}>
                        <div style={{ height: 250 }}>
                            <Pie
                                data={{
                                    labels: ['Người dùng', 'Nhà tuyển dụng', 'Việc làm', 'Hồ sơ'],
                                    datasets: [
                                        {
                                            label: 'Tỷ lệ',
                                            data: [stats.users, stats.companies, stats.jobs, stats.resumes],
                                            backgroundColor: ['#1890ff', '#52c41a', '#faad14', '#eb2f96'],
                                            borderColor: ['#fff'],
                                            borderWidth: 2,
                                        },
                                    ],
                                }}
                                options={{
                                    responsive: true,
                                    plugins: {
                                        legend: { position: 'bottom' as const },
                                    },
                                    maintainAspectRatio: false,
                                }}
                            />
                        </div>
                    </Card>
                </Col>
            </Row>

            <Row gutter={16} style={{ marginTop: 24 }}>
                <Col span={12}>
                    <Card title="Người dùng mới theo tháng" loading={loading}>
                        <div style={{ height: 250 }}>
                            <Line
                                data={lineChartData}
                                options={{
                                    responsive: true,
                                    plugins: {
                                        legend: { position: 'top' as const },
                                    },
                                    scales: {
                                        y: {
                                            beginAtZero: true,
                                            ticks: { stepSize: 5 },
                                        },
                                    },
                                    maintainAspectRatio: false,
                                }}
                            />
                        </div>
                    </Card>
                </Col>

                <Col span={12}>
                    <Card title="Top 5 công ty đăng tin nhiều nhất" loading={loading}>
                        <Bar
                            data={topCompanyChart}
                            options={{
                                responsive: true,
                                indexAxis: 'y',
                                plugins: {
                                    legend: { display: false },
                                },
                                scales: {
                                    x: {
                                        beginAtZero: true,
                                        grid: { color: '#f0f0f0' },
                                        ticks: { stepSize: 10 },
                                    },
                                },
                            }}
                            height={250}
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default DashboardAdmin;
