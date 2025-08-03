import { useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { IJob } from "@/types/backend";
import { callFetchJobById } from "@/config/api";
import styles from "styles/client.module.scss";
import jobStyles from "styles/client/client.detailJob.module.scss";
import parse from "html-react-parser";
import {
    Breadcrumb,
    Card,
    Col,
    Divider,
    Row,
    Skeleton,
    Tag,
    Button,
    Space,
} from "antd";
import {
    DollarOutlined,
    EnvironmentOutlined,
    HistoryOutlined,
    HeartOutlined,
    HeartFilled,
} from "@ant-design/icons";
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

import ApplyModal from "@/components/client/modal/apply.modal";


const ClientJobDetailPage = () => {
    const [jobDetail, setJobDetail] = useState<IJob | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);

    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const id = params?.get("id");

    useEffect(() => {
        const init = async () => {
            if (id) {
                setIsLoading(true);
                const res = await callFetchJobById(id);
                if (res?.data) setJobDetail(res.data);
                setIsLoading(false);
            }
        };
        init();
    }, [id]);

    const toggleFavorite = () => {
        setIsFavorite((prev) => !prev);
        // TODO: Sau này gọi API lưu job yêu thích ở đây
    };

    return (
        <div className={jobStyles["job-detail-container"]}>
            {isLoading ? (
                <Skeleton />
            ) : (
                jobDetail && jobDetail.id && (
                    <>
                        <Breadcrumb style={{ marginBottom: 16 }}>
                            <Breadcrumb.Item href="/">Trang chủ</Breadcrumb.Item>
                            <Breadcrumb.Item href="/job">Việc làm IT</Breadcrumb.Item>
                            <Breadcrumb.Item>{jobDetail.name}</Breadcrumb.Item>
                        </Breadcrumb>

                        <Row gutter={20}>
                            {/* LEFT */}
                            <Col xs={24} md={18}>
                                <Card className={jobStyles["job-card"]}>
                                    <h1 className={jobStyles["job-title"]}>{jobDetail.name}</h1>
                                    <p className={jobStyles["company-name"]}>
                                        {jobDetail.company?.name}
                                    </p>

                                    <div className={jobStyles["salary-info"]}>
                                        <DollarOutlined />{" "}
                                        {(jobDetail.salary + "").replace(
                                            /\B(?=(\d{3})+(?!\d))/g,
                                            ","
                                        )}{" "}
                                        đ
                                    </div>

                                    <Space className={jobStyles["actions"]}>
                                        <Button
                                            type="primary"
                                            danger
                                            block
                                            size="large"
                                            onClick={() => setIsModalOpen(true)}
                                        >
                                            Ứng tuyển
                                        </Button>

                                        <Button
                                            shape="circle"
                                            icon={
                                                isFavorite ? (
                                                    <HeartFilled style={{ color: "red" }} />
                                                ) : (
                                                    <HeartOutlined />
                                                )
                                            }
                                            size="large"
                                            onClick={toggleFavorite}
                                            className={jobStyles["btn-heart"]}
                                        />
                                    </Space>

                                    <div className={jobStyles["job-meta"]}>
                                        <p>
                                            <EnvironmentOutlined /> {jobDetail.location}
                                        </p>
                                        <p>
                                            <HistoryOutlined />{" "}
                                            Đăng {jobDetail.updatedAt ? dayjs(jobDetail.updatedAt).locale("vi").fromNow() : dayjs(jobDetail.createdAt).locale("vi").fromNow()}
                                        </p>
                                    </div>

                                    <Divider />

                                    <div>
                                        <h4>Kỹ năng:</h4>
                                        <Space wrap>
                                            {jobDetail.skills?.map((s) => (
                                                <Tag key={s.id} className={jobStyles["tag-skill"]}>
                                                    {s.name}
                                                </Tag>
                                            ))}
                                        </Space>
                                    </div>

                                    <div style={{ marginTop: 16 }}>
                                        <h4>Chuyên môn:</h4>
                                        <Tag className={jobStyles["tag-info"]}>Quản trị cơ sở dữ liệu</Tag>
                                    </div>

                                    <div style={{ marginTop: 16 }}>
                                        <h4>Lĩnh vực:</h4>
                                        <Tag className={jobStyles["tag-info"]}>Phần cứng & Điện toán</Tag>
                                    </div>

                                    <Divider />

                                    {parse(jobDetail.description)}
                                </Card>
                            </Col>

                            {/* RIGHT */}
                            <Col xs={24} md={6}>
                                <Card className={jobStyles["company-card"]}>
                                    <img
                                        src={jobDetail.company?.logo}
                                        alt="logo"
                                        width={120}
                                        height={120}
                                        style={{ objectFit: "contain", marginBottom: 12 }}
                                    />
                                    <h3>{jobDetail.company?.name}</h3>

                                    <div className={jobStyles["company-info"]}>
                                        <p>
                                            <strong>Địa chỉ:</strong>{" "}
                                            {jobDetail.company?.address || "Chưa cập nhật"}
                                        </p>
                                        <p>
                                            <strong>Quy mô:</strong> 1-50 nhân viên
                                        </p>
                                        <p>
                                            <strong>Quốc gia:</strong> 🇻🇳 Việt Nam
                                        </p>
                                    </div>

                                    <Button block>Xem công ty</Button>
                                </Card>
                            </Col>
                        </Row>

                        <ApplyModal
                            isModalOpen={isModalOpen}
                            setIsModalOpen={setIsModalOpen}
                            jobDetail={jobDetail}
                        />
                    </>
                )
            )}
        </div>
    );
};

export default ClientJobDetailPage;
