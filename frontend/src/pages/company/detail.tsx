import { useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { ICompany } from "@/types/backend";
import { callFetchCompanyById } from "@/config/api";
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
} from "antd";
import { EnvironmentOutlined } from "@ant-design/icons";
import clientStyle from "@/styles/client.module.scss";
import styles from "@/styles/client/companyDetail.module.scss";

const { TextArea } = Input;

const ClientCompanyDetailPage = () => {
    const [company, setCompany] = useState<ICompany | null>(null);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [reviewRating, setReviewRating] = useState(0);
    const [reviewText, setReviewText] = useState("");

    const location = useLocation();
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
                        <Card>Hiện tại chưa có API lấy danh sách job theo công ty.</Card>
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
