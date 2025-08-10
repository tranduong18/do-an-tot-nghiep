import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { IBlog } from "@/types/backend";
import { callBlogGetById, callBlogList, callFetchRelatedBlogs } from "@/config/api";
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
import PageHelmet from "@/components/share/page.helmet";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";
import blogStyles from "styles/client/blogDetail.module.scss";
import { convertSlug } from "@/config/utils";

dayjs.extend(relativeTime);

const ClientBlogDetailPage = () => {
    const [blogDetail, setBlogDetail] = useState<IBlog | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showFull, setShowFull] = useState(false);
    const [relatedBlogs, setRelatedBlogs] = useState<IBlog[]>([]);

    const location = useLocation();
    const navigate = useNavigate();
    const params = new URLSearchParams(location.search);
    const id = params.get("id");

    // Load chi tiết
    useEffect(() => {
        const init = async () => {
            if (!id) return;
            setIsLoading(true);
            const res = await callBlogGetById(id);
            if (res?.data) {
                setBlogDetail(res.data);
            } else {
                message.error("Không tìm thấy bài viết");
            }
            setIsLoading(false);
        };
        init();
    }, [id]);

    // Load bài liên quan (cùng công ty nếu có, chỉ lấy publish)
    useEffect(() => {
        const fetchRelated = async () => {
            if (!id) return;
            const res = await callFetchRelatedBlogs(id, 6);
            if (res?.data) setRelatedBlogs(res.data);
        };
        fetchRelated();
    }, [id]);

    console.log(relatedBlogs);

    const goCompany = () => {
        if (!blogDetail?.company) return;
        const slug = convertSlug(blogDetail.company.name || "");
        navigate(`/company/${slug}?id=${blogDetail.company.id}`);
    };

    const goBlogDetail = (b: IBlog) => {
        const slug = convertSlug(b.title);
        navigate(`/blog/${slug}?id=${b.id}`);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <div className={blogStyles["blog-detail-container"]}>
            <PageHelmet title={blogDetail?.title || "Chi tiết bài viết"} />
            {isLoading ? (
                <Skeleton />
            ) : (
                blogDetail && blogDetail.id && (
                    <>
                        <Breadcrumb style={{ marginBottom: 16 }}>
                            <Breadcrumb.Item href="/">Trang chủ</Breadcrumb.Item>
                            <Breadcrumb.Item href="/blog">Blog</Breadcrumb.Item>
                            <Breadcrumb.Item>{blogDetail.title}</Breadcrumb.Item>
                        </Breadcrumb>

                        <Row gutter={20}>
                            {/* LEFT */}
                            <Col xs={24} md={18}>
                                <Card className={blogStyles["blog-card"]}>
                                    {/* header */}
                                    <h1 className={blogStyles["blog-title"]}>
                                        {blogDetail.title}
                                    </h1>

                                    <div className={blogStyles["blog-meta"]}>
                                        <span>
                                            Đăng{" "}
                                            {blogDetail.updatedAt
                                                ? dayjs(blogDetail.updatedAt).locale("vi").fromNow()
                                                : dayjs(blogDetail.createdAt).locale("vi").fromNow()}
                                        </span>
                                        {blogDetail.company?.name ? (
                                            <span className={blogStyles["dot"]}>•</span>
                                        ) : null}
                                        {blogDetail.company?.name && (
                                            <Button
                                                type="link"
                                                size="small"
                                                className={blogStyles["company-link"]}
                                                onClick={goCompany}
                                            >
                                                {blogDetail.company.name}
                                            </Button>
                                        )}
                                        {!blogDetail.published && (
                                            <>
                                                <span className={blogStyles["dot"]}>•</span>
                                                <Tag color="orange">Draft</Tag>
                                            </>
                                        )}
                                    </div>

                                    {blogDetail.thumbnail && (
                                        <div className={blogStyles["thumb-wrap"]}>
                                            <img
                                                src={blogDetail.thumbnail}
                                                alt={blogDetail.title}
                                                className={blogStyles["thumb"]}
                                                loading="lazy"
                                            />
                                        </div>
                                    )}

                                    {blogDetail.description && (
                                        <>
                                            <Divider />
                                            <p className={blogStyles["desc"]} style={{ fontWeight: 700 }}>{blogDetail.description}</p>
                                        </>
                                    )}

                                    <Divider />

                                    {/* Nội dung */}
                                    <div className={blogStyles["blog-description"]}>

                                        <div
                                            className={`${blogStyles["content-collapsible"]} ${showFull ? blogStyles["expanded"] : blogStyles["collapsed"]
                                                }`}
                                        >
                                            {parse(blogDetail.content || "")}
                                        </div>

                                        <div style={{ textAlign: "center", marginTop: 8 }}>
                                            <Button type="link" onClick={() => setShowFull((v) => !v)} style={{ padding: 0 }}>
                                                {showFull ? "Rút gọn ▲" : "Xem thêm ▼"}
                                            </Button>
                                        </div>
                                    </div>

                                </Card>


                            </Col>

                            {/* RIGHT */}
                            <Col xs={24} md={6}>
                                <Card className={blogStyles["side-card"]}>
                                    {blogDetail.company?.logo && (
                                        <img
                                            src={blogDetail.company.logo}
                                            alt="logo"
                                            width={120}
                                            height={120}
                                            style={{ objectFit: "contain", marginBottom: 12 }}
                                        />
                                    )}
                                    <h3>{blogDetail.company?.name || "Hệ thống"}</h3>

                                    {blogDetail.company && (
                                        <>
                                            <div className={blogStyles["company-info"]}>
                                                <p>
                                                    <strong>Địa chỉ:</strong>{" "}
                                                    {blogDetail.company.address || "Chưa cập nhật"}
                                                </p>
                                                <p>
                                                    <strong>Quốc gia:</strong>{" "}
                                                    {blogDetail.company.country || "Chưa cập nhật"}
                                                </p>
                                            </div>

                                            <Button type="primary" block onClick={goCompany}>
                                                Xem công ty
                                            </Button>
                                        </>
                                    )}
                                </Card>
                                {/* Related Blogs — dưới company */}
                                {relatedBlogs.length > 0 && (
                                    <div className={blogStyles["related-side"]}>
                                        <h3 className={blogStyles["related-side-title"]}>Bài viết liên quan</h3>

                                        {relatedBlogs.map((b) => (
                                            <div
                                                key={b.id}
                                                className={blogStyles["related-side-item"]}
                                                onClick={() => goBlogDetail(b)}
                                                role="button"
                                            >
                                                {b.thumbnail && (
                                                    <img
                                                        src={b.thumbnail}
                                                        alt={b.title}
                                                        className={blogStyles["related-thumb"]}
                                                        loading="lazy"
                                                    />
                                                )}
                                                <div className={blogStyles["related-meta"]}>
                                                    <div className={blogStyles["related-time"]}>
                                                        {b.updatedAt
                                                            ? dayjs(b.updatedAt).locale("vi").fromNow()
                                                            : dayjs(b.createdAt).locale("vi").fromNow()}
                                                    </div>
                                                    <div className={blogStyles["related-title"]}>{b.title}</div>
                                                    {b.company?.name && (
                                                        <div className={blogStyles["related-company"]}>{b.company.name}</div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </Col>
                        </Row>
                    </>
                )
            )}
        </div>
    );
};

export default ClientBlogDetailPage;
