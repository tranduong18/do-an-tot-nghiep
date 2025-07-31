import { useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { ICompany } from "@/types/backend";
import { callFetchCompanyById } from "@/config/api";
import parse from "html-react-parser";
import {
    Row,
    Col,
    Avatar,
    Tabs,
    List,
    Button,
    Rate,
    Skeleton,
    Modal,
    Input,
} from "antd";
import { EnvironmentOutlined } from "@ant-design/icons";
import styles from "@/styles/client.module.scss";

const { TextArea } = Input;

const mockCompany = {
    id: "1",
    name: "NAB Innovation Centre Vietnam",
    address: "Hà Nội - TP Hồ Chí Minh",
    logo: "https://itviec.com/assets/nab-logo.png",
    website: "https://nab.com.vn",
    size: "200-500 nhân viên",
    description:
        "<p>NAB là công ty công nghệ tài chính hàng đầu, mang đến các giải pháp ngân hàng số hiện đại...</p>",
    benefits: ["Bảo hiểm sức khỏe", "Làm việc từ xa", "Lương tháng 13"],
    images: [
        "https://itviec.com/assets/nab-office-1.jpg",
        "https://itviec.com/assets/nab-office-2.jpg",
    ],
};

const mockJobs = [
    { id: 1, title: "Senior Frontend Developer", location: "HCM", salary: "$2000" },
    { id: 2, title: "Backend Java Engineer", location: "HCM", salary: "$1800" },
];

const mockReviews = [
    { user: "Nguyễn Văn A", rating: 5, comment: "Môi trường làm việc rất tốt!" },
    { user: "Trần Thị B", rating: 4, comment: "Phúc lợi ổn, đồng nghiệp thân thiện." },
];

const ClientCompanyDetailPage = () => {
    const [company, setCompany] = useState<ICompany | null>(null);
    const [jobs, setJobs] = useState(mockJobs);
    const [loading, setLoading] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [reviewRating, setReviewRating] = useState(0);
    const [reviewText, setReviewText] = useState("");

    let location = useLocation();
    let params = new URLSearchParams(location.search);
    const id = params?.get("id");

    useEffect(() => {
        const init = async () => {
            setLoading(true);
            try {
                if (id) {
                    const res = await callFetchCompanyById(id);
                    if (res?.data) {
                        setCompany(res.data);
                    } else {
                        setCompany(mockCompany);
                    }
                } else {
                    setCompany(mockCompany);
                }
            } catch {
                setCompany(mockCompany);
            }
            setLoading(false);
        };
        init();
    }, [id]);

    if (loading) return <Skeleton active />;

    if (!company) return <p>Không tìm thấy công ty.</p>;

    const avgRating =
        mockReviews.reduce((sum, r) => sum + r.rating, 0) / mockReviews.length;
    const recommendPercent = 96;

    return (
        <div className={styles["company-container"]}>
            {/* Header */}
            <div className={styles["company-header"]}>
                <div className={styles["company-info-left"]}>
                    <Avatar shape="square" size={90} src={company.logo} />
                    <div>
                        <h1>{company.name}</h1>
                        <div>
                            <EnvironmentOutlined /> {company.address}
                            <span className={styles["job-count"]}>
                                {jobs.length} việc làm đang tuyển dụng
                            </span>
                        </div>

                        <div style={{ marginTop: 12 }}>
                            <Button className={styles["review-btn"]} onClick={() => setIsModalOpen(true)}>
                                Viết đánh giá
                            </Button>
                            <Button type="primary">Theo dõi</Button>
                        </div>
                    </div>
                </div>

                {/* Rating */}
                <div className={styles["company-rating-box"]}>
                    <div className={styles["score"]}>{avgRating.toFixed(1)}</div>
                    <Rate
                        disabled
                        allowHalf
                        value={avgRating}
                        className={styles["custom-rate"]}
                    />
                    <div>{mockReviews.length} đánh giá</div>
                    <div className={styles["recommend"]}>
                        <div className={styles["percent"]}>{recommendPercent}%</div>
                        <div>Khuyến khích làm việc tại đây</div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className={styles["company-tabs"]}>
                <Tabs defaultActiveKey="1">
                    <Tabs.TabPane tab="Giới thiệu" key="1">
                        {parse(company.description ?? "")}
                        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                            {mockCompany.images.map((img, index) => (
                                <Col span={8} key={index}>
                                    <img src={img} alt={`img-${index}`} style={{ width: "100%", borderRadius: 6 }} />
                                </Col>
                            ))}
                        </Row>
                    </Tabs.TabPane>

                    <Tabs.TabPane tab="Phúc lợi" key="2">
                        {company.benefits?.length ? (
                            <List
                                dataSource={company.benefits}
                                renderItem={(item) => <List.Item>{item}</List.Item>}
                            />
                        ) : (
                            <p>Chưa cập nhật phúc lợi.</p>
                        )}
                    </Tabs.TabPane>

                    <Tabs.TabPane tab="Việc đang tuyển" key="3">
                        {jobs.length ? (
                            <List
                                dataSource={jobs}
                                renderItem={(job) => (
                                    <List.Item
                                        style={{ cursor: "pointer" }}
                                        onClick={() => alert(`Đi tới job ${job.id}`)}
                                    >
                                        <List.Item.Meta
                                            title={<b>{job.title}</b>}
                                            description={`${job.location} • ${job.salary}`}
                                        />
                                    </List.Item>
                                )}
                            />
                        ) : (
                            <p>Hiện tại chưa có tin tuyển dụng nào.</p>
                        )}
                    </Tabs.TabPane>

                    <Tabs.TabPane tab="Đánh giá" key="4">
                        <List
                            dataSource={mockReviews}
                            renderItem={(review) => (
                                <List.Item>
                                    <List.Item.Meta
                                        avatar={<Avatar>{review.user.charAt(0)}</Avatar>}
                                        title={
                                            <>
                                                {review.user} - <Rate disabled defaultValue={review.rating} />
                                            </>
                                        }
                                        description={review.comment}
                                    />
                                </List.Item>
                            )}
                        />
                    </Tabs.TabPane>
                </Tabs>
            </div>

            {/* Modal viết đánh giá */}
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
    );
};

export default ClientCompanyDetailPage;
