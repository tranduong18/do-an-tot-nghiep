import { callBlogList } from "@/config/api";
import { convertSlug } from "@/config/utils";
import { IBlog } from "@/types/backend";
import { Card, Col, Empty, Pagination, Row, Spin, Tag } from "antd";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import styles from "styles/client.module.scss";
import jobStyles from "styles/client/client.jobCard.module.scss";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";
dayjs.extend(relativeTime);
import { sfEqual } from "spring-filter-query-builder";

interface IProps {
    showPagination?: boolean;
}

const BlogCard = ({ showPagination = false }: IProps) => {
    const [displayBlog, setDisplayBlog] = useState<IBlog[] | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const [current, setCurrent] = useState(1);
    const [pageSize, setPageSize] = useState(6);
    const [total, setTotal] = useState(0);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        void fetchBlog();
    }, [current, pageSize, location]);

    const fetchBlog = async () => {
        setIsLoading(true);
        const qs = new URLSearchParams({
            page: String(current),
            size: String(pageSize),
            sort: "updatedAt,desc",
        });

        qs.set("filter", sfEqual("published", "true").toString());

        const res = await callBlogList(qs.toString());
        if (res?.data) {
            setDisplayBlog(res.data.result);
            setTotal(res.data.meta.total);
        }
        setIsLoading(false);
    };

    const handleOnchangePage = (page: number, size: number) => {
        setCurrent(page);
        setPageSize(size);
    };

    const handleViewDetailBlog = (item: IBlog) => {
        const slug = convertSlug(item.title);
        navigate(`/blog/${slug}?id=${item.id}`);
    };

    return (
        <div className={styles["card-job-section"]} style={{ marginTop: 30 }}>
            <Spin spinning={isLoading} tip="Loading...">
                <div className={jobStyles["dflex-pc"]}>
                    <span className={jobStyles["title"]}>Bài viết mới nhất</span>
                    {!showPagination && <Link to="/blog">Xem tất cả</Link>}
                </div>

                <Row gutter={[16, 16]} style={{ marginTop: 20 }}>
                    {displayBlog?.map((item) => (
                        <Col xs={24} md={12} lg={8} key={item.id} style={{ display: "flex" }}>
                            <Card
                                className={styles["job-card-v2"]}
                                hoverable
                                onClick={() => handleViewDetailBlog(item)}
                                cover={
                                    <img
                                        alt={item.title}
                                        src={item.thumbnail}
                                        style={{ height: 180, objectFit: "cover" }}
                                        loading="lazy"
                                    />
                                }
                            >
                                <div className={styles["job-card-header"]}>
                                    <span>
                                        Đăng{" "}
                                        {item.updatedAt
                                            ? dayjs(item.updatedAt).locale("vi").fromNow()
                                            : dayjs(item.createdAt).locale("vi").fromNow()}
                                    </span>
                                    <span className={styles["new-badge"]}>BLOG</span>
                                </div>

                                <h3 className={styles["job-title"]} style={{ marginBottom: 6 }}>
                                    {item.title}
                                </h3>


                                <div className={styles["company-info"]} style={{ marginBottom: 8 }}>
                                    {item.company?.logo ? (
                                        <img src={item.company.logo} alt={item.company?.name} />
                                    ) : (
                                        <img
                                            src="https://via.placeholder.com/40x40?text=SYS"
                                            alt="System"
                                        />
                                    )}
                                    <span>{item.company?.name || "System"}</span>
                                </div>

                                {item.description && (
                                    <div
                                        className={styles["job-location"]}
                                        style={{
                                            color: "#555",
                                            display: "-webkit-box",
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: "vertical",
                                            overflow: "hidden",
                                            minHeight: 44,
                                        }}
                                    >
                                        {item.description}
                                    </div>
                                )}

                                <hr className={styles["divider"]} />

                                {!!(item as any).tags && (
                                    <div className={styles["job-skills"]}>
                                        {(String((item as any).tags).split(",") as string[])
                                            .slice(0, 3)
                                            .map((t, idx) => (
                                                <Tag key={idx} color="blue">
                                                    {t.trim()}
                                                </Tag>
                                            ))}
                                    </div>
                                )}
                            </Card>
                        </Col>
                    ))}

                    {(!displayBlog || displayBlog.length === 0) && !isLoading && (
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

export default BlogCard;
