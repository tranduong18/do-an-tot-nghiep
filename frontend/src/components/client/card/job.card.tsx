import { callFetchJob } from "@/config/api";
import { convertSlug, getLocationName } from "@/config/utils";
import { IJob } from "@/types/backend";
import { EnvironmentOutlined } from "@ant-design/icons";
import { Card, Col, Empty, Pagination, Row, Spin, Tag, Badge } from "antd";
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { sfIn } from "spring-filter-query-builder";
import styles from "styles/client.module.scss";
import jobStyles from "styles/client/client.jobCard.module.scss";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

interface IProps {
    showPagination?: boolean;
}

const JobCard = ({ showPagination = false }: IProps) => {
    const [displayJob, setDisplayJob] = useState<IJob[] | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const [current, setCurrent] = useState(1);
    const [pageSize, setPageSize] = useState(6);
    const [total, setTotal] = useState(0);
    const [filter] = useState("");
    const [sortQuery] = useState("sort=updatedAt,desc");
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const location = useLocation();

    useEffect(() => {
        fetchJob();
    }, [current, pageSize, filter, sortQuery, location]);

    const fetchJob = async () => {
        setIsLoading(true);
        let query = `page=${current}&size=${pageSize}`;
        if (filter) query += `&${filter}`;
        if (sortQuery) query += `&${sortQuery}`;

        const queryLocation = searchParams.get("location");
        const querySkills = searchParams.get("skills");
        if (queryLocation || querySkills) {
            let q = "";
            if (queryLocation) q = sfIn("location", queryLocation.split(",")).toString();
            if (querySkills) {
                q = queryLocation
                    ? q + " and " + `${sfIn("skills", querySkills.split(","))}`
                    : `${sfIn("skills", querySkills.split(","))}`;
            }
            query += `&filter=${encodeURIComponent(q)}`;
        }

        const res = await callFetchJob(query);
        if (res?.data) {
            setDisplayJob(res.data.result);
            setTotal(res.data.meta.total);
        }
        setIsLoading(false);
    };

    const handleOnchangePage = (page: number, size: number) => {
        setCurrent(page);
        setPageSize(size);
    };

    const handleViewDetailJob = (item: IJob) => {
        const slug = convertSlug(item.name);
        navigate(`/job/${slug}?id=${item.id}`);
    };

    return (
        <div className={styles["card-job-section"]}>
            <Spin spinning={isLoading} tip="Loading...">
                <div className={jobStyles["dflex-pc"]}>
                    <span className={jobStyles["title"]}>Công việc mới nhất</span>
                    {!showPagination && <Link to="/job">Xem tất cả</Link>}
                </div>

                <Row gutter={[16, 16]} style={{ marginTop: 20 }}>
                    {displayJob?.map((item) => (
                        <Col xs={24} md={12} lg={8} key={item.id} style={{ display: "flex" }}>
                            <Card
                                className={styles["job-card-v2"]}
                                hoverable
                                onClick={() => handleViewDetailJob(item)}
                            >
                                <div className={styles["job-card-header"]}>
                                    <span>Đăng {item.updatedAt ? dayjs(item.updatedAt).locale("vi").fromNow() : dayjs(item.createdAt).locale("vi").fromNow()}</span>
                                    <span className={styles["new-badge"]}>NEW FOR YOU</span>
                                </div>

                                <h3 className={styles["job-title"]}>{item.name}</h3>

                                <div className={styles["company-info"]}>
                                    <img src={item.company?.logo} alt={item.company?.name} />
                                    <span>{item.company?.name}</span>
                                </div>

                                <div className={styles["job-salary"]}>
                                    💰 {item.salary.toLocaleString()} đ
                                </div>

                                <div className={styles["job-location"]}>
                                    <EnvironmentOutlined /> {getLocationName(item.location)}
                                </div>

                                <hr className={styles["divider"]} />

                                {item.skills?.length > 0 && (
                                    <div className={styles["job-skills"]}>
                                        {item.skills.slice(0, 3).map((skill) => (
                                            <Tag key={skill.id} color="blue">
                                                {skill.name}
                                            </Tag>
                                        ))}
                                        {item.skills.length > 3 && (
                                            <Tag color="default">+{item.skills.length - 3}</Tag>
                                        )}
                                    </div>
                                )}
                            </Card>
                        </Col>
                    ))}

                    {(!displayJob || displayJob.length === 0) && !isLoading && (
                        <Empty description="Không có dữ liệu" style={{ margin: "0 auto" }} />
                    )}
                </Row>

                {showPagination && (
                    <div style={{ marginTop: 20, textAlign: "center" }}>
                        <Pagination
                            current={current}
                            total={total}
                            pageSize={pageSize}
                            responsive
                            onChange={handleOnchangePage}
                        />
                    </div>
                )}
            </Spin>
        </div>
    );
};

export default JobCard;
