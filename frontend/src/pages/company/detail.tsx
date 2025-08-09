import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { ICompany, IJob, IReview } from "@/types/backend";
import {
    callFetchCompanyById,
    callFetchJobsByCompanyId,
    callFetchCompanyReviews,
    callCreateCompanyReview,
    callUpdateCompanyReview,
    callDeleteCompanyReview,
} from "@/config/api";
import parse from "html-react-parser";
import {
    Row,
    Col,
    Tabs,
    Button,
    Rate,
    Skeleton,
    Tag,
    Modal,
    Input,
    Card,
    Space,
    Tooltip,
    List,
    Avatar,
    Pagination,
    message,
    Empty,
    Popconfirm,
} from "antd";
import { DeleteOutlined, DollarOutlined, EditOutlined, EnvironmentOutlined } from "@ant-design/icons";
import clientStyle from "@/styles/client.module.scss";
import styles from "@/styles/client/companyDetail.module.scss";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import PageHelmet from "@/components/share/page.helmet";
import { useAppSelector } from "@/redux/hooks";

dayjs.extend(relativeTime);
const { TextArea } = Input;

const ClientCompanyDetailPage = () => {
    const [company, setCompany] = useState<ICompany | null>(null);
    const [loading, setLoading] = useState(true);

    const [jobList, setJobList] = useState<IJob[]>([]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [reviewRating, setReviewRating] = useState(0);
    const [reviewText, setReviewText] = useState("");
    const [editingReview, setEditingReview] = useState<IReview | null>(null);

    const [reviews, setReviews] = useState<IReview[]>([]);
    const [reviewLoading, setReviewLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [total, setTotal] = useState(0);

    const currentUser = useAppSelector((state) => state.account.user);

    const location = useLocation();
    const navigate = useNavigate();
    const params = new URLSearchParams(location.search);
    const id = params?.get("id");

    // fetch company
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                if (id) {
                    const res = await callFetchCompanyById(id);
                    if (res?.data) setCompany(res.data);
                }
            } catch (e) {
                console.error(e);
            }
            setLoading(false);
        };
        fetchData();
    }, [id]);

    // fetch jobs
    useEffect(() => {
        const fetchJobs = async () => {
            if (company?.id) {
                const res = await callFetchJobsByCompanyId(company.id);
                if (res?.data) setJobList(res.data);
            }
        };
        fetchJobs();
    }, [company]);

    // fetch reviews
    const loadReviews = async (p = page, s = pageSize) => {
        if (!company?.id) return;
        try {
            setReviewLoading(true);
            const res = await callFetchCompanyReviews(company.id, p - 1, s);
            const payload = res?.data;
            setReviews(payload?.result || []);
            setTotal(payload?.meta?.total || 0);
            setPage(payload?.meta?.page || p);
            setPageSize(payload?.meta?.pageSize || s);
        } catch (e) {
            console.error(e);
        } finally {
            setReviewLoading(false);
        }
    };

    useEffect(() => {
        if (company?.id) loadReviews(1, pageSize);
    }, [company?.id]);

    const openCreateModal = () => {
        setEditingReview(null);
        setReviewRating(0);
        setReviewText("");
        setIsModalOpen(true);
    };

    const handleEditReview = (review: IReview) => {
        setEditingReview(review);
        setReviewRating(review.rating);
        setReviewText(review.content || "");
        setIsModalOpen(true);
    };

    const handleSubmitReview = async () => {
        if (!company?.id) return;
        if (!reviewRating) {
            message.warning("Vui lòng chọn số sao trước khi gửi.");
            return;
        }
        try {
            if (editingReview) {
                await callUpdateCompanyReview(company.id, editingReview.id, {
                    rating: reviewRating,
                    content: reviewText?.trim() || undefined,
                });
                message.success("Cập nhật đánh giá thành công!");
            } else {
                await callCreateCompanyReview(company.id, {
                    rating: reviewRating,
                    content: reviewText?.trim() || undefined,
                });
                message.success("Gửi đánh giá thành công!");
            }

            // reset form
            setIsModalOpen(false);
            setReviewRating(0);
            setReviewText("");
            setEditingReview(null);

            const resCompany = await callFetchCompanyById(String(company.id));
            if (resCompany?.data) setCompany(resCompany.data);

            await loadReviews(1, pageSize);
        } catch (e: any) {
            console.error(e);
            message.error(e?.response?.data?.message || "Thao tác thất bại");
        }
    };

    const handleDeleteReview = async (reviewId: string) => {
        if (!company?.id) return;
        try {
            await callDeleteCompanyReview(company.id, reviewId);
            message.success("Xóa đánh giá thành công!");
            await loadReviews(page, pageSize);
            const resCompany = await callFetchCompanyById(String(company.id));
            if (resCompany?.data) setCompany(resCompany.data);
        } catch (e: any) {
            console.error(e);
            message.error(e?.response?.data?.message || "Xóa đánh giá thất bại");
        }
    };

    if (loading) return <Skeleton active />;
    if (!company) return <p>Không tìm thấy công ty.</p>;

    return (
        <>
            <PageHelmet title={company?.name || "Chi tiết công ty"} />
            <div className={clientStyle["container"]}>
                <div className={styles["company-container"]}>
                    {/* Header */}
                    <div className={styles["company-header"]}>
                        <div className={styles["header-left"]}>
                            <img
                                src={company.logo}
                                alt={company.name}
                                style={{
                                    width: 100,
                                    height: 100,
                                    objectFit: "contain",
                                    borderRadius: 8,
                                    background: "#fff",
                                }}
                            />
                            <div>
                                <h1>{company.name}</h1>
                                <p style={{ marginTop: 5 }}>
                                    <EnvironmentOutlined /> {company.address || "Chưa cập nhật"}
                                </p>
                                <div className={styles["header-buttons"]}>
                                    <Button type="primary" danger onClick={openCreateModal}>
                                        Viết đánh giá
                                    </Button>
                                    <Button type="primary">Theo dõi</Button>
                                </div>
                            </div>
                        </div>

                        <div className={styles["header-rating"]}>
                            <div className={styles["rating-score"]}>
                                {company.rating?.toFixed(1) || "0.0"}
                            </div>
                            <Rate disabled allowHalf value={company.rating || 0} />
                            <div>{company.reviewCount || 0} đánh giá</div>
                            <div className={styles["rating-percent"]}>
                                {(company.reviewPercent ?? 0) + "% khuyến khích"}
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <Tabs defaultActiveKey="1" className={styles["company-tabs"]}>
                        <Tabs.TabPane tab="Giới thiệu" key="1">
                            <Card title="Thông tin chung" className={styles["info-card"]}>
                                <Row gutter={[16, 16]}>
                                    <Col xs={24} md={12} lg={8}>
                                        <p><strong>Mô hình công ty:</strong> {company.model || "Chưa cập nhật"}</p>
                                    </Col>
                                    <Col xs={24} md={12} lg={8}>
                                        <p><strong>Lĩnh vực công ty:</strong> {company.industry || "Chưa cập nhật"}</p>
                                    </Col>
                                    <Col xs={24} md={12} lg={8}>
                                        <p><strong>Quy mô công ty:</strong> {company.size || "Chưa cập nhật"}</p>
                                    </Col>
                                    <Col xs={24} md={12} lg={8}>
                                        <p><strong>Quốc gia:</strong> {company.country || "Chưa cập nhật"}</p>
                                    </Col>
                                    <Col xs={24} md={12} lg={8}>
                                        <p><strong>Thời gian làm việc:</strong> {company.workingTime || "Chưa cập nhật"}</p>
                                    </Col>
                                    <Col xs={24} md={12} lg={8}>
                                        <p><strong>Chính sách OT:</strong> {company.overtimePolicy || "Chưa cập nhật"}</p>
                                    </Col>
                                    <Col xs={24} md={12} lg={8}>
                                        <p>
                                            <strong>Website:</strong>{" "}
                                            {company.website ? (
                                                <a href={company.website} target="_blank" rel="noreferrer">
                                                    {company.website}
                                                </a>
                                            ) : "Chưa cập nhật"}
                                        </p>
                                    </Col>
                                    <Col xs={24} md={12} lg={8}>
                                        <div>
                                            <strong>Chuyên môn:</strong>
                                            <div style={{ marginTop: 5 }}>
                                                {company.tags?.split(",").map((tag) => (
                                                    <Tag key={tag} color="blue" style={{ marginRight: 4 }}>
                                                        {tag.trim()}
                                                    </Tag>
                                                ))}
                                            </div>
                                        </div>
                                    </Col>
                                </Row>
                            </Card>

                            <Card title="Giới thiệu công ty" className={styles["info-card"]}>
                                <div className={styles["company-description"]}>
                                    {parse(company.description || "<p>Chưa cập nhật</p>")}
                                </div>
                            </Card>
                        </Tabs.TabPane>

                        <Tabs.TabPane tab="Phúc lợi" key="2">
                            <Card>
                                <div className={styles["company-description"]}>
                                    {parse(company.benefits || "<p>Chưa cập nhật phúc lợi</p>")}
                                </div>
                            </Card>
                        </Tabs.TabPane>

                        <Tabs.TabPane tab="Việc đang tuyển" key="3">
                            {jobList.length === 0 ? (
                                <p>Hiện tại công ty chưa có việc nào đang tuyển.</p>
                            ) : (
                                <Row gutter={[16, 16]}>
                                    {jobList.map((job) => (
                                        <Col xs={24} sm={12} lg={8} key={job.id}>
                                            <Card
                                                className={styles["job-rectangle"]}
                                                hoverable
                                                onClick={() => navigate(`/job/detail?id=${job.id}`)}
                                            >
                                                <div className={styles["job-rectangle-body"]}>
                                                    <div className={styles["job-info-left"]}>
                                                        <p>
                                                            Đăng{" "}
                                                            {job.updatedAt
                                                                ? dayjs(job.updatedAt).locale("vi").fromNow()
                                                                : dayjs(job.createdAt).locale("vi").fromNow()}
                                                        </p>
                                                        <h3 className={styles["job-title"]}>{job.name}</h3>
                                                        <div className={styles["job-meta"]}>
                                                            <span><EnvironmentOutlined /> {job.location}</span>
                                                        </div>
                                                        <div className={styles["job-salary"]}>
                                                            <DollarOutlined /> {job.salary?.toLocaleString()} đ
                                                        </div>
                                                        <Space wrap style={{ marginTop: 8 }}>
                                                            {job.skills?.slice(0, 3).map((s) => (
                                                                <Tag key={s.id}>{s.name}</Tag>
                                                            ))}
                                                            {job.skills && job.skills.length > 3 && (
                                                                <Tooltip
                                                                    title={job.skills.slice(3).map((s) => s.name).join(", ")}
                                                                    placement="top"
                                                                >
                                                                    <Tag>+{job.skills.length - 3}</Tag>
                                                                </Tooltip>
                                                            )}
                                                        </Space>
                                                    </div>
                                                    <div className={styles["company-logo"]}>
                                                        <img src={company.logo} alt="logo" />
                                                    </div>
                                                </div>
                                            </Card>
                                        </Col>
                                    ))}
                                </Row>
                            )}
                        </Tabs.TabPane>

                        {/* Đánh giá */}
                        <Tabs.TabPane tab="Đánh giá" key="4">
                            <Card title={`Đánh giá về ${company.name}`}>
                                <List
                                    loading={reviewLoading}
                                    locale={{ emptyText: <Empty description="Chưa có đánh giá" /> }}
                                    dataSource={reviews}
                                    renderItem={(item) => (
                                        <List.Item
                                            actions={
                                                item.user?.id === currentUser?.id
                                                    ? [
                                                        <Button
                                                            key="edit"
                                                            icon={<EditOutlined />}
                                                            type="link"
                                                            onClick={() => handleEditReview(item)}
                                                        />,
                                                        <Popconfirm
                                                            key="delete"
                                                            title="Xóa đánh giá này?"
                                                            okText="Xóa"
                                                            cancelText="Hủy"
                                                            onConfirm={() => handleDeleteReview(item.id)}
                                                        >
                                                            <Button type="text" icon={<DeleteOutlined />} danger />
                                                        </Popconfirm>,
                                                    ]
                                                    : []
                                            }
                                        >
                                            <List.Item.Meta
                                                avatar={<Avatar
                                                    src={item.user?.avatar || undefined}
                                                    style={{ backgroundColor: !item.user?.avatar ? "#87d068" : undefined }}
                                                >
                                                    {!item.user?.avatar && item.user?.fullName?.charAt(0)}
                                                </Avatar>}
                                                title={
                                                    <Space direction="horizontal" size={8}>
                                                        <span style={{ fontWeight: 600 }}>{item.user?.fullName}</span>
                                                        <Rate disabled allowHalf value={item.rating} />
                                                        <span style={{ color: "#999" }}>
                                                            {dayjs(item.createdAt).locale("vi").fromNow()}
                                                        </span>
                                                        {item.recommended && (
                                                            <Tag color="green">Khuyến khích làm việc</Tag>
                                                        )}
                                                    </Space>
                                                }
                                                description={item.content || "(Không có nội dung)"}
                                            />
                                        </List.Item>
                                    )}
                                />
                                {total > 0 && (
                                    <div style={{ marginTop: 16, textAlign: "right" }}>
                                        <Pagination
                                            current={page}
                                            pageSize={pageSize}
                                            total={total}
                                            onChange={(p, s) => {
                                                setPage(p);
                                                setPageSize(s);
                                                loadReviews(p, s);
                                            }}
                                            showSizeChanger
                                        />
                                    </div>
                                )}
                            </Card>
                        </Tabs.TabPane>
                    </Tabs>

                    {/* Modal Viết/Sửa đánh giá */}
                    <Modal
                        title={editingReview ? "Sửa đánh giá" : "Viết đánh giá"}
                        open={isModalOpen}
                        onOk={handleSubmitReview}
                        onCancel={() => {
                            setIsModalOpen(false);
                            setEditingReview(null);
                        }}
                        okText={editingReview ? "Cập nhật" : "Gửi đánh giá"}
                        cancelText="Hủy"
                    >
                        <p>Chọn số sao:</p>
                        <Rate value={reviewRating} onChange={setReviewRating} allowHalf />
                        <p style={{ marginTop: 12 }}>Nội dung {editingReview ? "mới" : ""}:</p>
                        <TextArea
                            rows={4}
                            value={reviewText}
                            onChange={(e) => setReviewText(e.target.value)}
                            maxLength={5000}
                            placeholder="Chia sẻ trải nghiệm làm việc của bạn..."
                        />
                    </Modal>
                </div>
            </div>
        </>
    );
};

export default ClientCompanyDetailPage;
