import { callFetchJob, callFetchJobSpecializations } from "@/config/api";
import { convertSlug, getLocationName } from "@/config/utils";
import { IJob } from "@/types/backend";
import { EnvironmentOutlined } from "@ant-design/icons";
import { Card, Col, Empty, Pagination, Row, Spin, Tag } from "antd";
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { sfIn } from "spring-filter-query-builder";
import styles from "styles/client.module.scss";
import jobStyles from "styles/client/client.jobCard.module.scss";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

import LevelFilter, { LevelType } from "@/components/client/filter/LevelFilter";
import WorkTypeFilter, { WorkType } from "@/components/client/filter/WorkTypeFilter";
import SalaryFilter, { SalaryRange } from "@/components/client/filter/SalaryFilter";
import SpecializationFilter, { Specialization } from "@/components/client/filter/SpecializationFilter";

interface IProps {
    showPagination?: boolean;
}

const LEVELS: LevelType[] = ["INTERN", "FRESHER", "JUNIOR", "MIDDLE", "SENIOR"];

const JobIndexCard = ({ showPagination = false }: IProps) => {
    const [displayJob, setDisplayJob] = useState<IJob[] | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [specializationOptions, setSpecializationOptions] = useState<string[]>([]);

    const [current, setCurrent] = useState(1);
    const [pageSize, setPageSize] = useState(6);
    const [total, setTotal] = useState(0);
    const [filter] = useState("");
    const [sortQuery] = useState("sort=updatedAt,desc");

    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const location = useLocation();

    // filter states
    const [levels, setLevels] = useState<LevelType[]>([]);
    const [workTypes, setWorkTypes] = useState<WorkType[]>([]);
    const [salaryRange, setSalaryRange] = useState<SalaryRange>([0, 100_000_000]);
    const [specializations, setSpecializations] = useState<Specialization[]>([]);

    // init từ URL
    useEffect(() => {
        const parseCsv = (key: string) =>
            searchParams.get(key)?.split(",").map((s) => s.trim()).filter(Boolean) || [];

        setLevels(
            parseCsv("levels").filter((s) => (LEVELS as string[]).includes(s)) as LevelType[]
        );
        setWorkTypes(parseCsv("workTypes") as WorkType[]);
        const sf = Number(searchParams.get("salaryFrom") ?? "0");
        const st = Number(searchParams.get("salaryTo") ?? "100000000");
        setSalaryRange([isNaN(sf) ? 0 : sf, isNaN(st) ? 100_000_000 : st]);
        setSpecializations(parseCsv("specializations") as Specialization[]);

    }, [location.search]);

    useEffect(() => {
        (async () => {
            try {
                const res = await callFetchJobSpecializations();
                setSpecializationOptions(res?.data ?? []);
            } catch (e) {
                setSpecializationOptions([]);
            }
        })();
    }, []);

    useEffect(() => {
        fetchJob();
    }, [current, pageSize, filter, sortQuery, location, levels, workTypes, salaryRange, specializations]);

    const fetchJob = async () => {
        setIsLoading(true);
        let query = `page=${current}&size=${pageSize}`;
        if (filter) query += `&${filter}`;
        if (sortQuery) query += `&${sortQuery}`;

        const queryLocation = searchParams.get("location");
        const querySkills = searchParams.get("skills");

        let filterExpr = "";

        if (queryLocation) {
            filterExpr = sfIn("location", queryLocation.split(",")).toString();
        }
        if (querySkills) {
            const s = sfIn("skills", querySkills.split(",")).toString();
            filterExpr = filterExpr ? `${filterExpr} and ${s}` : s;
        }
        if (levels.length) {
            const s = sfIn("level", levels).toString();
            filterExpr = filterExpr ? `${filterExpr} and ${s}` : s;
        }
        if (workTypes.length) {
            const s = sfIn("workType", workTypes).toString();
            filterExpr = filterExpr ? `${filterExpr} and ${s}` : s;
        }
        if (salaryRange[0] > 0 || salaryRange[1] < 100_000_000) {
            const s = `(salary>=${salaryRange[0]} and salary<=${salaryRange[1]})`;
            filterExpr = filterExpr ? `${filterExpr} and ${s}` : s;
        }
        if (specializations.length) {
            const s = sfIn("specialization", specializations).toString();
            filterExpr = filterExpr ? `${filterExpr} and ${s}` : s;
        }

        if (filterExpr) query += `&filter=${encodeURIComponent(filterExpr)}`;

        const res = await callFetchJob(query);
        if (res?.data) {
            setDisplayJob(res.data.result);
            setTotal(res.data.meta.total);
        }
        setIsLoading(false);
    };

    // helpers sync URL
    const setParamCsv = (key: string, list: string[]) => {
        const params = new URLSearchParams(searchParams.toString());
        if (list.length) params.set(key, list.join(","));
        else params.delete(key);
        setSearchParams(params);
        setCurrent(1);
    };

    const onChangeLevels = (vals: LevelType[]) => {
        setLevels(vals);
        setParamCsv("levels", vals);
    };
    const onChangeWorkTypes = (vals: WorkType[]) => {
        setWorkTypes(vals);
        setParamCsv("workTypes", vals);
    };
    const onChangeSalary = (vals: SalaryRange) => {
        setSalaryRange(vals);
        const params = new URLSearchParams(searchParams.toString());
        params.set("salaryFrom", String(vals[0]));
        params.set("salaryTo", String(vals[1]));
        setSearchParams(params);
        setCurrent(1);
    };
    const onChangeSpecializations = (vals: Specialization[]) => {
        setSpecializations(vals);
        setParamCsv("specializations", vals);
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

                {/* FILTER BAR: tách biệt rõ ràng */}
                <div
                    style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 12,
                        padding: "10px 0",
                        marginTop: 12,
                        marginBottom: 12,
                        borderBottom: "1px solid #f0f0f0",
                    }}
                >
                    <LevelFilter value={levels} onChange={onChangeLevels} />
                    <WorkTypeFilter value={workTypes} onChange={onChangeWorkTypes} />
                    <SalaryFilter value={salaryRange} onChange={onChangeSalary} />
                    <SpecializationFilter
                        value={specializations}
                        onChange={onChangeSpecializations}
                        options={specializationOptions}
                    />
                </div>

                <Row gutter={[16, 16]} style={{ marginTop: 8 }}>
                    {displayJob?.map((item) => (
                        <Col xs={24} md={12} lg={8} key={item.id} style={{ display: "flex" }}>
                            <Card
                                className={styles["job-card-v2"]}
                                hoverable
                                onClick={() => handleViewDetailJob(item)}
                            >
                                <div className={styles["job-card-header"]}>
                                    <span>
                                        Đăng{" "}
                                        {item.updatedAt
                                            ? dayjs(item.updatedAt).locale("vi").fromNow()
                                            : dayjs(item.createdAt).locale("vi").fromNow()}
                                    </span>
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

export default JobIndexCard;
