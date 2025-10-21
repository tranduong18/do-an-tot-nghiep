import { useEffect, useMemo, useState } from 'react';
import {
    Card,
    Col,
    Row,
    Statistic,
    Typography,
    List,
    Tag,
    Space,
    message as antdMessage,
    Spin,
} from 'antd';
import {
    UserOutlined,
    SolutionOutlined,
    FileDoneOutlined,
    AppstoreOutlined,
    ThunderboltOutlined,
    RiseOutlined,
    CrownOutlined,
} from '@ant-design/icons';
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
import PageHelmet from '@/components/share/page.helmet';
import axios from 'config/axios-customize';

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


type LabelCount = { label: string; count: number };

interface SummaryCards {
    jobsActive: number;
    companies: number;
    resumesThisMonth: number;
    users: number;
    usersNew30d: number;
    companiesNew30d: number;
    jobsNew30d: number;
    activeUsers24h: number;
    hrUsers?: number;
}

interface SummaryCharts {
    jobsMonthly: LabelCount[];
    jobSpecializationRatio: LabelCount[];
    resumePeakHour: LabelCount[];
    topCompaniesThisMonth: LabelCount[];
    resumesBySpecializationYear: LabelCount[];
}

interface DashboardSummaryDTO {
    cards: SummaryCards;
    charts: SummaryCharts;
}

const CHART_HEIGHT = 260;

const BASE_COLORS = [
    '#5B8FF9', '#5AD8A6', '#5D7092', '#F6BD16', '#E8684A',
    '#6DC8EC', '#9270CA', '#FF9D4D', '#269A99', '#FF99C3',
];
const pickColors = (n: number) => {
    if (n <= BASE_COLORS.length) return BASE_COLORS.slice(0, n);
    return Array.from({ length: n }, (_, i) => {
        const hue = Math.round((360 / n) * i);
        return `hsl(${hue} 70% 55%)`;
    });
};


const groupTopN = (items: { label: string; count: number }[], topN = 6) => {
    const sorted = [...items].sort((a, b) => b.count - a.count);
    const top = sorted.slice(0, topN);
    const rest = sorted.slice(topN);
    const others = rest.reduce((sum, it) => sum + (it.count || 0), 0);
    return others > 0 ? [...top, { label: 'Khác', count: others }] : top;
};


const wrapLabel = (s: string, max = 18) => {
    const words = (s || '').split(' ');
    const lines: string[] = [];
    let cur = '';
    for (const w of words) {
        if ((cur + ' ' + w).trim().length > max) {
            lines.push(cur.trim());
            cur = w;
        } else cur = (cur ? cur + ' ' : '') + w;
    }
    if (cur) lines.push(cur.trim());
    return lines.slice(0, 2);
};


const valueLabelPlugin = {
    id: 'valueLabel',
    afterDatasetsDraw(chart: any) {
        const { ctx } = chart;
        const ds = chart.data.datasets[0];
        const meta = chart.getDatasetMeta(0);
        ctx.save();
        ctx.font = '12px Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica';
        ctx.fillStyle = '#595959';
        ctx.textAlign = 'left';
        meta.data.forEach((bar: any, i: number) => {
            const val = (ds.data[i] ?? 0) as number;
            if (!val) return;
            const { x, y } = bar.tooltipPosition();
            const isHorizontal = chart.options?.indexAxis === 'y';
            if (isHorizontal) {
                ctx.fillText(String(val), x + 8, y + 4);
            } else {
                ctx.textAlign = 'center';
                ctx.fillText(String(val), x, y - 8);
            }
        });
        ctx.restore();
    },
};


type LC = { label: string; count: number };
const denseRanking = (items: LC[]) => {
    const sorted = [...items].sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
    let rank = 0;
    let last: number | null = null;
    return sorted.map((it) => {
        if (last === null || it.count !== last) {
            rank += 1;
            last = it.count;
        }
        return { ...it, rank };
    });
};

const DashboardAdmin = () => {
    const [loading, setLoading] = useState<boolean>(true);
    const [summary, setSummary] = useState<DashboardSummaryDTO | null>(null);

    useEffect(() => {
        const fetchSummary = async () => {
            try {
                setLoading(true);
                const res = await axios.get('/api/v1/dashboard/summary', {
                    params: { months: 12, top: 10, daysForPeak: 30 },
                });
                const data: DashboardSummaryDTO = res.data?.data ?? res.data;
                setSummary(sanitizeSummary(data));
            } catch (e: any) {
                antdMessage.error(e?.response?.data?.message || 'Không tải được dashboard');
            } finally {
                setLoading(false);
            }
        };
        fetchSummary();
    }, []);


    const sanitizeSummary = (data: DashboardSummaryDTO): DashboardSummaryDTO => {
        const trimList = (arr?: LabelCount[]) =>
            (arr || []).map((it) => ({
                label: (it?.label ?? '').toString().trim() || 'Khác',
                count: Number(it?.count ?? 0),
            }));

        return {
            cards: {
                jobsActive: data?.cards?.jobsActive ?? 0,
                companies: data?.cards?.companies ?? 0,
                resumesThisMonth: data?.cards?.resumesThisMonth ?? 0,
                users: data?.cards?.users ?? 0,
                usersNew30d: data?.cards?.usersNew30d ?? 0,
                companiesNew30d: data?.cards?.companiesNew30d ?? 0,
                jobsNew30d: data?.cards?.jobsNew30d ?? 0,
                activeUsers24h: data?.cards?.activeUsers24h ?? 0,
                hrUsers: data?.cards?.hrUsers ?? undefined,
            },
            charts: {
                jobsMonthly: trimList(data?.charts?.jobsMonthly),
                jobSpecializationRatio: trimList(data?.charts?.jobSpecializationRatio),
                resumePeakHour: trimList(data?.charts?.resumePeakHour),
                topCompaniesThisMonth: trimList(data?.charts?.topCompaniesThisMonth),
                resumesBySpecializationYear: trimList(data?.charts?.resumesBySpecializationYear),
            },
        };
    };


    const charts = useMemo(() => {
        const s = summary;

        const lineJobsTs = {
            labels: s?.charts?.jobsMonthly?.map((i) => i.label) || [],
            datasets: [
                {
                    label: 'Việc mới theo tháng',
                    data: s?.charts?.jobsMonthly?.map((i) => i.count) || [],
                    fill: false,
                    borderColor: '#fa8c16',
                    backgroundColor: '#ffd591',
                    tension: 0.35,
                },
            ],
        };

        const labelsSpec = s?.charts?.jobSpecializationRatio?.map((i) => i.label) || [];
        const valuesSpec = s?.charts?.jobSpecializationRatio?.map((i) => i.count) || [];
        const colorsSpec = pickColors(labelsSpec.length);

        const pieSpec = {
            labels: labelsSpec,
            datasets: [
                {
                    data: valuesSpec,
                    backgroundColor: colorsSpec,
                    hoverBackgroundColor: colorsSpec,
                    borderColor: '#fff',
                    borderWidth: 2,
                    hoverOffset: 6,
                },
            ],
        };

        const barPeakHour = {
            labels: s?.charts?.resumePeakHour?.map((i) => i.label) || [],
            datasets: [
                {
                    label: 'Hồ sơ (30 ngày)',
                    data: s?.charts?.resumePeakHour?.map((i) => i.count) || [],
                    backgroundColor: '#13c2c2',
                    borderWidth: 1,
                    barThickness: 18,
                },
            ],
        };

        return { lineJobsTs, pieSpec, barPeakHour };
    }, [summary]);


    const rankedTopCompanies = useMemo(() => {
        const raw = (summary?.charts?.topCompaniesThisMonth || []).map(i => ({
            label: (i.label || 'Khác').trim(),
            count: i.count || 0,
        }));
        return denseRanking(raw);
    }, [summary]);

    return (
        <div>
            <PageHelmet title="Trang quản trị - Thống kê" description="Thống kê và quản lý hệ thống JobHunter" />
            <Typography.Title level={3} style={{ marginBottom: 16 }}>
                Tổng quan
            </Typography.Title>

            {loading && (
                <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
                    <Spin />
                </div>
            )}

            {!loading && summary && (
                <>
                    {/* Cards hàng 1 */}
                    <Row gutter={16} style={{ marginBottom: 16 }}>
                        <Col xs={12} lg={6}>
                            <Card><Statistic title="Việc đang mở" value={summary.cards.jobsActive} prefix={<AppstoreOutlined />} /></Card>
                        </Col>
                        <Col xs={12} lg={6}>
                            <Card>
                                <Statistic
                                    title="Nhà tuyển dụng (HR)"
                                    value={summary.cards.hrUsers ?? summary.cards.companies}
                                    prefix={<SolutionOutlined />}
                                />
                            </Card>
                        </Col>
                        <Col xs={12} lg={6}>
                            <Card><Statistic title="Ứng tuyển (tháng này)" value={summary.cards.resumesThisMonth} prefix={<FileDoneOutlined />} /></Card>
                        </Col>
                        <Col xs={12} lg={6}>
                            <Card><Statistic title="Người dùng" value={summary.cards.users} prefix={<UserOutlined />} /></Card>
                        </Col>
                    </Row>

                    {/* Cards hàng 2 */}
                    <Row gutter={16} style={{ marginBottom: 24 }}>
                        <Col xs={12} lg={6}><Card><Statistic title="Người dùng mới (30 ngày)" value={summary.cards.usersNew30d} prefix={<RiseOutlined />} /></Card></Col>
                        <Col xs={12} lg={6}><Card><Statistic title="Công ty mới (30 ngày)" value={summary.cards.companiesNew30d} prefix={<RiseOutlined />} /></Card></Col>
                        <Col xs={12} lg={6}><Card><Statistic title="Việc mới (30 ngày)" value={summary.cards.jobsNew30d} prefix={<RiseOutlined />} /></Card></Col>
                        <Col xs={12} lg={6}><Card><Statistic title="Active 24h" value={summary.cards.activeUsers24h} prefix={<ThunderboltOutlined />} /></Card></Col>
                    </Row>


                    <Row gutter={16} style={{ marginBottom: 24 }}>
                        <Col xs={24} lg={12}>
                            <Card title="Việc mới theo tháng">
                                <div style={{ height: CHART_HEIGHT }}>
                                    <Line
                                        data={charts.lineJobsTs}
                                        options={{
                                            responsive: true,
                                            plugins: { legend: { position: 'top' as const } },
                                            scales: { y: { beginAtZero: true } },
                                            maintainAspectRatio: false,
                                        }}
                                    />
                                </div>
                            </Card>
                        </Col>
                        <Col xs={24} lg={12}>
                            <Card title="Phân bổ việc theo chuyên môn">
                                <div style={{ height: CHART_HEIGHT }}>
                                    <Pie
                                        data={charts.pieSpec}
                                        options={{
                                            responsive: true,
                                            plugins: {
                                                legend: { position: 'bottom' as const, labels: { boxWidth: 12, padding: 14 } },
                                                tooltip: { callbacks: { label: (ctx) => `${ctx.label}: ${ctx.parsed}` } },
                                            },
                                            maintainAspectRatio: false,
                                        }}
                                    />
                                </div>
                            </Card>
                        </Col>
                    </Row>


                    <Row gutter={16} style={{ marginBottom: 24 }}>
                        <Col xs={24} lg={12}>
                            <Card title="Khung giờ nộp hồ sơ cao điểm (30 ngày)">
                                <div style={{ height: CHART_HEIGHT }}>
                                    <Bar
                                        data={charts.barPeakHour}
                                        options={{
                                            responsive: true,
                                            plugins: { legend: { display: false } },
                                            scales: {
                                                x: { grid: { display: false } },
                                                y: { beginAtZero: true, grid: { color: '#f0f0f0' } },
                                            },
                                            elements: { bar: { borderRadius: 6 } },
                                            maintainAspectRatio: false,
                                        }}
                                    />
                                </div>
                            </Card>
                        </Col>
                        <Col xs={24} lg={12}>
                            <Card title="Top công ty đăng nhiều việc (tháng này)">
                                <List
                                    dataSource={rankedTopCompanies}
                                    renderItem={(item) => {
                                        const color =
                                            item.rank === 1 ? 'gold' :
                                                item.rank === 2 ? 'blue' :
                                                    item.rank === 3 ? 'green' : 'default';
                                        return (
                                            <List.Item>
                                                <Space>
                                                    <Tag color={color}>
                                                        {item.rank <= 3 ? <CrownOutlined /> : '#'} {item.rank}
                                                    </Tag>
                                                    <Typography.Text strong>{item.label}</Typography.Text>
                                                    <Tag color="success">{item.count} việc</Tag>
                                                </Space>
                                            </List.Item>
                                        );
                                    }}
                                />
                            </Card>
                        </Col>
                    </Row>


                    <Row gutter={16} style={{ marginBottom: 24 }}>
                        <Col xs={24} lg={24}>
                            <Card title="Hồ sơ theo chuyên môn (năm hiện tại)">
                                <div style={{ height: CHART_HEIGHT }}>
                                    {(() => {
                                        const raw = summary.charts.resumesBySpecializationYear.map(i => ({
                                            label: (i.label || 'Khác').trim(),
                                            count: i.count || 0,
                                        }));
                                        const dataTop = groupTopN(raw, 6);
                                        const labels = dataTop.map(i => wrapLabel(i.label));
                                        const values = dataTop.map(i => i.count);

                                        const barData = {
                                            labels,
                                            datasets: [{
                                                label: 'Hồ sơ',
                                                data: values,
                                                backgroundColor: (ctx: any) => {
                                                    const { chart } = ctx;
                                                    const { ctx: c, chartArea } = chart;
                                                    if (!chartArea) return '#722ed1';
                                                    const g = c.createLinearGradient(chartArea.left, 0, chartArea.right, 0);
                                                    g.addColorStop(0, '#9055FF');
                                                    g.addColorStop(1, '#5B8FF9');
                                                    return g;
                                                },
                                                borderRadius: 10,
                                                borderSkipped: false,
                                                barThickness: 22,
                                            }],
                                        };

                                        return (
                                            <Bar
                                                data={barData}
                                                plugins={[valueLabelPlugin]}
                                                options={{
                                                    responsive: true,
                                                    indexAxis: 'y' as const,
                                                    plugins: {
                                                        legend: { display: false },
                                                        tooltip: {
                                                            callbacks: {
                                                                label: (ctx) =>
                                                                    ` ${Array.isArray(ctx.label) ? ctx.label.join(' ') : ctx.label}: ${ctx.parsed.x}`,
                                                            },
                                                        },
                                                    },
                                                    scales: {
                                                        x: {
                                                            beginAtZero: true,
                                                            grid: { color: '#f0f0f0' },
                                                        },
                                                        y: {
                                                            grid: { display: false },
                                                            ticks: {
                                                                callback: function (v: any) {
                                                                    const lbl = (this.getLabelForValue as any)(v);
                                                                    return Array.isArray(lbl) ? lbl : [lbl];
                                                                },
                                                            },
                                                        },
                                                    },
                                                    maintainAspectRatio: false,
                                                }}
                                            />
                                        );
                                    })()}
                                </div>
                            </Card>
                        </Col>
                    </Row>
                </>
            )}
        </div>
    );
};

export default DashboardAdmin;
