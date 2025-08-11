import { Divider, Typography, Row, Col, Card } from "antd";
import styles from "styles/client.module.scss";
import SearchClient from "@/components/client/search.client";
import JobCard from "@/components/client/card/job.card";
import CompanyCard from "@/components/client/card/company.card";
import PageHelmet from "@/components/share/page.helmet";
import BlogCard from "@/components/client/card/blog.card";

const { Title } = Typography;

const HomePage = () => {
    return (
        <div className={styles["container"]}>
            <PageHelmet
                title="Trang chủ"
                description="Tìm việc làm IT, công ty công nghệ và cơ hội nghề nghiệp tốt nhất tại JobHunter"
            />

            {/* Banner */}
            <div className={styles["banner-section"]}>
                <div className={styles["banner-content"]}>
                    <Title level={2} style={{ color: "#fff", fontWeight: 600 }}>
                        Tìm Việc IT Chất Lượng Cao
                    </Title>
                    <p style={{ color: "#fff", fontSize: 18 }}>
                        Hơn 10.000 việc làm IT hấp dẫn từ các công ty hàng đầu
                    </p>
                    <div className={styles["banner-search"]}>
                        <SearchClient />
                    </div>
                </div>
            </div>

            <Divider />

            {/* Top Company */}
            <CompanyCard />

            <Divider />

            {/* Job nổi bật */}
            <JobCard />

            {/* Bài viết nổi bật */}
            <BlogCard />
        </div>
    );
};

export default HomePage;
