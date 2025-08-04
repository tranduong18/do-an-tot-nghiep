import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { IJob } from "@/types/backend";
import { callFetchJobById, callFetchSimilarJobs } from "@/config/api";
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
    Tooltip,
} from "antd";
import {
    DollarOutlined,
    EnvironmentOutlined,
    HistoryOutlined,
    HeartOutlined,
    HeartFilled,
    ScheduleOutlined,
    LaptopOutlined,
    BankOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { convertSlug } from "@/config/utils";
import ApplyModal from "@/components/client/modal/apply.modal";
import PageHelmet from "@/components/share/page.helmet";

dayjs.extend(relativeTime);

const ClientJobDetailPage = () => {
    const [jobDetail, setJobDetail] = useState<IJob | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);
    const [showFullDesc, setShowFullDesc] = useState(false);
    const [relatedJobs, setRelatedJobs] = useState<IJob[]>([]);

    const location = useLocation();
    const navigate = useNavigate();
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

    useEffect(() => {
        const fetchRelatedJobs = async () => {
            if (id) {
                const res = await callFetchSimilarJobs(id);
                if (res?.data) setRelatedJobs(res.data);
            }
        };
        fetchRelatedJobs();
    }, [id]);

    const toggleFavorite = () => {
        setIsFavorite((prev) => !prev);
        // TODO: Sau này gọi API lưu job yêu thích ở đây
    };

    return (
        <div className={jobStyles["job-detail-container"]}>
            <PageHelmet title={jobDetail?.name || "Chi tiết công việc"} />
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
                                            <EnvironmentOutlined />{" "}
                                            {jobDetail.address || jobDetail.location}
                                        </p>
                                        <p>
                                            <HistoryOutlined />{" "}
                                            Đăng{" "}
                                            {jobDetail.updatedAt
                                                ? dayjs(jobDetail.updatedAt).locale("vi").fromNow()
                                                : dayjs(jobDetail.createdAt).locale("vi").fromNow()}
                                        </p>
                                        {jobDetail.workType && (
                                            <p>
                                                <strong>Hình thức:</strong> {jobDetail.workType}
                                            </p>
                                        )}
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

                                    {jobDetail.specialization && (
                                        <div style={{ marginTop: 16 }}>
                                            <h4>Chuyên môn:</h4>
                                            <Tag className={jobStyles["tag-info"]}>
                                                {jobDetail.specialization}
                                            </Tag>
                                        </div>
                                    )}

                                    {jobDetail.fields && (
                                        <div style={{ marginTop: 16 }}>
                                            <h4>Lĩnh vực:</h4>
                                            {jobDetail.fields.split(",").map((field, idx) => (
                                                <Tag key={idx} className={jobStyles["tag-info"]}>
                                                    {field.trim()}
                                                </Tag>
                                            ))}
                                        </div>
                                    )}

                                    <Divider />

                                    <div className={jobStyles["job-description"]}>
                                        <h3 className={jobStyles["section-title"]}>Mô tả công việc</h3>
                                        <div
                                            className={`${jobStyles["description-content"]} ${showFullDesc ? jobStyles["expanded"] : jobStyles["collapsed"]
                                                }`}
                                        >
                                            {parse(jobDetail.description)}
                                        </div>

                                        <div style={{ textAlign: "center", marginTop: 8 }}>
                                            <Button
                                                type="link"
                                                onClick={() => setShowFullDesc((prev) => !prev)}
                                                style={{ padding: 0 }}
                                            >
                                                {showFullDesc ? "Rút gọn ▲" : "Xem thêm ▼"}
                                            </Button>
                                        </div>
                                    </div>
                                </Card>

                                {relatedJobs.length > 0 && (
                                    <div className={jobStyles["related-jobs"]}>
                                        <h3 className={jobStyles["related-title"]}>Việc làm tương tự dành cho bạn</h3>

                                        <Row gutter={[16, 16]}>
                                            {relatedJobs.map((job) => (
                                                <Col xs={24} md={12} key={job.id}>
                                                    <Card
                                                        className={jobStyles["related-job-card"]}
                                                        hoverable
                                                        onClick={() => navigate(`/job/detail?id=${job.id}`)}
                                                    >
                                                        <p className={jobStyles["posted-time"]}>
                                                            Đăng {job.updatedAt
                                                                ? dayjs(job.updatedAt).locale("vi").fromNow()
                                                                : dayjs(job.createdAt).locale("vi").fromNow()}

                                                        </p>
                                                        <div className={jobStyles["job-card-header"]}>
                                                            <img
                                                                src={job.company?.logo || "/default-logo.png"}
                                                                alt="logo"
                                                                className={jobStyles["company-logo"]}
                                                            />
                                                            <div>
                                                                <h4 className={jobStyles["job-title"]}>{job.name}</h4>
                                                                <p className={jobStyles["company-name"]}>{job.company?.name}</p>
                                                            </div>
                                                        </div>



                                                        <p className={jobStyles["salary-info"]}>
                                                            <DollarOutlined />{" "}
                                                            {job.salary
                                                                ? job.salary.toLocaleString() + " đ"
                                                                : "Đăng nhập để xem mức lương"}
                                                        </p>

                                                        <p className={jobStyles["job-meta"]}>
                                                            <EnvironmentOutlined />{" "}
                                                            {job.location}
                                                        </p>

                                                        {job.workType && (
                                                            <p className={jobStyles["job-meta"]} style={{ marginTop: 5 }}>
                                                                <BankOutlined />{" "}
                                                                {job.workType}
                                                            </p>
                                                        )}

                                                        <Space wrap style={{ marginTop: 8 }}>
                                                            {job.skills?.slice(0, 4).map((s) => (
                                                                <Tag key={s.id}>{s.name}</Tag>
                                                            ))}
                                                            {job.skills && job.skills.length > 4 && (
                                                                <Tooltip
                                                                    title={job.skills.slice(4).map((s) => s.name).join(", ")}
                                                                    placement="top"
                                                                >
                                                                    <Tag>+{job.skills.length - 4}</Tag>
                                                                </Tooltip>
                                                            )}
                                                        </Space>
                                                    </Card>
                                                </Col>
                                            ))}
                                        </Row>
                                    </div>
                                )}

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
                                            <strong>Quy mô:</strong>{" "}
                                            {jobDetail.company?.size || "Chưa cập nhật"}
                                        </p>
                                        <p>
                                            <strong>Quốc gia:</strong>{" "}
                                            {jobDetail.company?.country || "🇻🇳 Việt Nam"}
                                        </p>
                                        <p>
                                            <strong>Thời gian làm việc:</strong>{" "}
                                            {jobDetail.company?.workingTime || "🇻🇳 Việt Nam"}
                                        </p>
                                        <p>
                                            <strong>Làm việc ngoài giờ:</strong>{" "}
                                            {jobDetail.company?.overtimePolicy || "🇻🇳 Việt Nam"}
                                        </p>
                                    </div>

                                    <Button
                                        type="primary"
                                        block
                                        onClick={() => {
                                            if (jobDetail.company) {
                                                const slug = convertSlug(jobDetail.company.name || "");
                                                navigate(`/company/${slug}?id=${jobDetail.company.id}`);
                                            }
                                        }}
                                    >
                                        Xem công ty
                                    </Button>
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
