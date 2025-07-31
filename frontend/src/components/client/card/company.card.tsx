import { callFetchCompany } from "@/config/api";
import { convertSlug } from "@/config/utils";
import { ICompany } from "@/types/backend";
import { Card, Col, Empty, Pagination, Row, Spin, Tag } from "antd";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "styles/client.module.scss";

interface IProps {
    showPagination?: boolean;
}

// Mock data skill và job count
const mockSkills = ["JavaScript", "ReactJS", "Python", "NodeJS", "Java", "MySQL"];
const mockJobCount = [4, 8, 12, 3, 6, 10];

const CompanyCard = ({ showPagination = false }: IProps) => {
    const [companies, setCompanies] = useState<ICompany[]>([]);
    const [loading, setLoading] = useState(false);

    const [current, setCurrent] = useState(1);
    const [pageSize, setPageSize] = useState(9);
    const [total, setTotal] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        fetchCompany();
    }, [current, pageSize]);

    const fetchCompany = async () => {
        setLoading(true);
        const query = `page=${current}&size=${pageSize}&sort=updatedAt,desc`;
        const res = await callFetchCompany(query);

        if (res?.data) {
            setCompanies(res.data.result);
            setTotal(res.data.meta.total);
        }
        setLoading(false);
    };

    const handleViewDetail = (item: ICompany) => {
        const slug = convertSlug(item.name || "");
        navigate(`/company/${slug}?id=${item.id}`);
    };

    return (
        <div className={styles["company-section"]}>
            <Spin spinning={loading} tip="Loading...">
                <div className={styles["company-header-card"]}>
                    <div className={styles["title"]}>Nhà tuyển dụng hàng đầu</div>
                    {!showPagination && (
                        <div className={styles["view-all"]}>
                            <Link to="/company">Xem tất cả</Link>
                        </div>
                    )}
                </div>

                <Row gutter={[16, 16]}>
                    {companies.length > 0 ? (
                        companies.map((item, index) => (
                            <Col xs={24} sm={12} md={8} key={item.id}>
                                <Card
                                    className={styles["company-card"]}
                                    hoverable
                                    onClick={() => handleViewDetail(item)}
                                >
                                    <div className={styles["company-card-top"]}>
                                        <div className={styles["company-logo"]}>
                                            <img src={item.logo} alt={item.name} />
                                        </div>

                                        <h3 className={styles["company-name"]}>{item.name}</h3>

                                        <div className={styles["company-skills"]}>
                                            {mockSkills
                                                .slice(0, Math.floor(Math.random() * 4) + 2)
                                                .map((skill) => (
                                                    <Tag key={skill} color="blue">
                                                        {skill}
                                                    </Tag>
                                                ))}
                                        </div>
                                    </div>

                                    <div className={styles["company-card-footer"]}>
                                        <span className={styles["company-location"]}>
                                            {item.address || "Địa điểm không xác định"}
                                        </span>
                                        <span className={styles["company-jobs"]}>
                                            🔥 {mockJobCount[Math.floor(Math.random() * mockJobCount.length)]} việc làm
                                        </span>
                                    </div>
                                </Card>

                            </Col>
                        ))
                    ) : (
                        <Empty description="Không có dữ liệu" style={{ margin: "0 auto" }} />
                    )}
                </Row>

                {showPagination && (
                    <div style={{ textAlign: "center", marginTop: 20 }}>
                        <Pagination
                            current={current}
                            pageSize={pageSize}
                            total={total}
                            onChange={(p, s) => {
                                setCurrent(p);
                                setPageSize(s);
                            }}
                        />
                    </div>
                )}
            </Spin>
        </div>
    );
};

export default CompanyCard;
