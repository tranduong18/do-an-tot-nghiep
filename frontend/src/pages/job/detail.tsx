import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { IJob } from "@/types/backend";
import { callFetchJobById, callFetchSimilarJobs, callFetchResumeByUser, callFavoriteIsFavorited, callFavoriteToggle } from "@/config/api";
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
    message,
} from "antd";
import {
    DollarOutlined,
    EnvironmentOutlined,
    HistoryOutlined,
    HeartOutlined,
    HeartFilled,
    BankOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { convertSlug, sanitizeRichHtml } from "@/config/utils";
import ApplyModal from "@/components/client/modal/apply.modal";
import PageHelmet from "@/components/share/page.helmet";
import { useAppSelector } from "@/redux/hooks";

dayjs.extend(relativeTime);

const ClientJobDetailPage = () => {
    const [jobDetail, setJobDetail] = useState<IJob | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [isFavorite, setIsFavorite] = useState(false);
    const [favLoading, setFavLoading] = useState(false);

    const [showFullDesc, setShowFullDesc] = useState(false);
    const [relatedJobs, setRelatedJobs] = useState<IJob[]>([]);
    const [isApplied, setIsApplied] = useState(false);

    const isAuthenticated = useAppSelector(state => state.account.isAuthenticated);
    const location = useLocation();
    const navigate = useNavigate();
    const params = new URLSearchParams(location.search);
    const id = params?.get("id");

    // load job detail
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

    // load related jobs
    useEffect(() => {
        const fetchRelatedJobs = async () => {
            if (id) {
                const res = await callFetchSimilarJobs(id);
                if (res?.data) setRelatedJobs(res.data);
            }
        };
        fetchRelatedJobs();
    }, [id]);

    useEffect(() => {
        const checkApplied = async () => {
            if (!isAuthenticated || !id) return;

            try {
                const res = await callFetchResumeByUser();
                if (res && res.data) {
                    const applied = res.data.result.some(
                        (resume: any) => resume.job?.id === Number(id)
                    );
                    setIsApplied(applied);
                }
            } catch (e) {
                console.error(e);
            }
        };

        checkApplied();
    }, [isAuthenticated, id]);

    useEffect(() => {
        const initFav = async () => {
            if (!isAuthenticated || !id) {
                setIsFavorite(false);
                return;
            }
            try {
                const res = await callFavoriteIsFavorited(id);
                if (res?.data !== undefined) {
                    const flag = (res as any)?.data?.data ?? res.data;
                    setIsFavorite(!!flag);
                }
            } catch (e) {
                console.error(e);
            }
        };
        initFav();
    }, [isAuthenticated, id]);

    const toggleFavorite = async () => {
        if (!id) return;
        if (!isAuthenticated) {
            message.info("Vui lòng đăng nhập để lưu việc làm yêu thích");
            navigate("/login?redirect=" + encodeURIComponent(location.pathname + location.search));
            return;
        }

        const prev = isFavorite;
        setIsFavorite(!prev);
        setFavLoading(true);

        try {
            const res = await callFavoriteToggle(id);
            const serverFlag = (res as any)?.data?.data ?? res.data;
            if (typeof serverFlag === "boolean") setIsFavorite(serverFlag);
            message.success(serverFlag ? "Đã thêm vào yêu thích" : "Đã bỏ khỏi yêu thích");
        } catch (e) {
            setIsFavorite(prev);
            message.error("Có lỗi khi cập nhật yêu thích. Thử lại sau.");
            console.error(e);
        } finally {
            setFavLoading(false);
        }
    };

    const workTypeLabels: Record<string, string> = {
        onsite: "Tại văn phòng",
        remote: "Làm từ xa",
        hybrid: "Linh hoạt",
    };

    const toViWorkType = (value?: string) =>
        workTypeLabels[value?.toLowerCase() ?? ""] || value || "";

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
                                    <h1 className={jobStyles["job-title"]}>
                                        {jobDetail.name}
                                        {isApplied && <Tag color="green" style={{ marginLeft: 8 }}>ĐÃ ỨNG TUYỂN</Tag>}
                                    </h1>
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
                                            onClick={() => {
                                                if (isApplied) return;
                                                setIsModalOpen(true);
                                            }}
                                        >
                                            {isApplied ? "Đã ứng tuyển" : "Ứng tuyển"}
                                        </Button>

                                        <Button
                                            shape="circle"
                                            loading={favLoading}
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
                                                <strong>Hình thức:</strong> {toViWorkType(jobDetail.workType)}
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
                                            {parse(sanitizeRichHtml(jobDetail.description))}
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
                                                                {toViWorkType(jobDetail.workType)}
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
                                            {jobDetail.company?.country || "Việt Nam"}
                                        </p>
                                        <p>
                                            <strong>Thời gian làm việc:</strong>{" "}
                                            {jobDetail.company?.workingTime || "Việt Nam"}
                                        </p>
                                        <p>
                                            <strong>Làm việc ngoài giờ:</strong>{" "}
                                            {jobDetail.company?.overtimePolicy || "Việt Nam"}
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
