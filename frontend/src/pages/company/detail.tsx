import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { ICompany, IJob } from "@/types/backend";
import { callFetchCompanyById, callFetchJobsByCompanyId } from "@/config/api";
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
} from "antd";
import { DollarOutlined, EnvironmentOutlined, HistoryOutlined } from "@ant-design/icons";
import clientStyle from "@/styles/client.module.scss";
import styles from "@/styles/client/companyDetail.module.scss";
import dayjs from "dayjs";

const { TextArea } = Input;

const ClientCompanyDetailPage = () => {
    const [company, setCompany] = useState<ICompany | null>(null);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [reviewRating, setReviewRating] = useState(0);
    const [reviewText, setReviewText] = useState("");
    const [jobList, setJobList] = useState<IJob[]>([]);

    const location = useLocation();
    const navigate = useNavigate();
    const params = new URLSearchParams(location.search);
    const id = params?.get("id");

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

    useEffect(() => {
        const fetchJobs = async () => {
            if (company?.id) {
                const res = await callFetchJobsByCompanyId(company.id);
                if (res?.data) {
                    setJobList(res.data);
                }
            }
        };
        fetchJobs();
    }, [company]);

    console.log(jobList);

    if (loading) return <Skeleton active />;
    if (!company) return <p>Không tìm thấy công ty.</p>;

    return (
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
                                <Button
                                    type="primary"
                                    danger
                                    onClick={() => setIsModalOpen(true)}
                                >
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
                            {company.reviewPercent || 0}% khuyến khích
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <Tabs defaultActiveKey="1" className={styles["company-tabs"]}>
                    <Tabs.TabPane tab="Giới thiệu" key="1">
                        {/* Thông tin chung */}
                        <Card title="Thông tin chung" className={styles["info-card"]}>
                            <Row gutter={[16, 16]}>
                                <Col xs={24} md={12} lg={8}>
                                    <p>
                                        <strong>Mô hình công ty:</strong>{" "}
                                        {company.model || "Chưa cập nhật"}
                                    </p>
                                </Col>
                                <Col xs={24} md={12} lg={8}>
                                    <p>
                                        <strong>Lĩnh vực công ty:</strong>{" "}
                                        {company.industry || "Chưa cập nhật"}
                                    </p>
                                </Col>
                                <Col xs={24} md={12} lg={8}>
                                    <p>
                                        <strong>Quy mô công ty:</strong>{" "}
                                        {company.size || "Chưa cập nhật"}
                                    </p>
                                </Col>
                                <Col xs={24} md={12} lg={8}>
                                    <p>
                                        <strong>Quốc gia:</strong>{" "}
                                        {company.country || "Chưa cập nhật"}
                                    </p>
                                </Col>
                                <Col xs={24} md={12} lg={8}>
                                    <p>
                                        <strong>Thời gian làm việc:</strong>{" "}
                                        {company.workingTime || "Chưa cập nhật"}
                                    </p>
                                </Col>
                                <Col xs={24} md={12} lg={8}>
                                    <p>
                                        <strong>Chính sách OT:</strong>{" "}
                                        {company.overtimePolicy || "Chưa cập nhật"}
                                    </p>
                                </Col>
                                <Col xs={24} md={12} lg={8}>
                                    <p>
                                        <strong>Website:</strong>{" "}
                                        {company.website ? (
                                            <a
                                                href={company.website}
                                                target="_blank"
                                                rel="noreferrer"
                                            >
                                                {company.website}
                                            </a>
                                        ) : (
                                            "Chưa cập nhật"
                                        )}
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

                        {/* Giới thiệu công ty */}
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
                                                        <span>
                                                            <EnvironmentOutlined />{" "}
                                                            {job.location}
                                                        </span>
                                                    </div>
                                                    <div className={styles["job-salary"]}>
                                                        <DollarOutlined />{" "}
                                                        {job.salary?.toLocaleString()} đ
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



                    <Tabs.TabPane tab="Đánh giá" key="4">
                        <Card>Chức năng đánh giá công ty sẽ được làm sau.</Card>
                    </Tabs.TabPane>
                </Tabs>

                {/* Modal Viết đánh giá */}
                <Modal
                    title="Viết đánh giá"
                    open={isModalOpen}
                    onOk={() => setIsModalOpen(false)}
                    onCancel={() => setIsModalOpen(false)}
                    okText="Gửi đánh giá"
                    cancelText="Hủy"
                >
                    <p>Chọn số sao:</p>
                    <Rate value={reviewRating} onChange={setReviewRating} allowHalf />
                    <p style={{ marginTop: 12 }}>Nội dung đánh giá:</p>
                    <TextArea
                        rows={4}
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                    />
                </Modal>
            </div>
        </div>
    );
};

export default ClientCompanyDetailPage;
