import { Divider, Typography, Row, Col, Card } from "antd";
import styles from "styles/client.module.scss";
import SearchClient from "@/components/client/search.client";
import JobCard from "@/components/client/card/job.card";
import CompanyCard from "@/components/client/card/company.card";
import PageHelmet from "@/components/share/page.helmet";

const { Title } = Typography;

const categories = [
    { name: "Frontend Developer", icon: "💻" },
    { name: "Backend Developer", icon: "🖥️" },
    { name: "Mobile Developer", icon: "📱" },
    { name: "QA/QC", icon: "🧪" },
    { name: "DevOps", icon: "⚙️" },
    { name: "Data Engineer", icon: "📊" },
];

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

            {/* Categories */}
            <div className={styles["category-section"]}>
                <Title level={2} style={{ textAlign: "center" }}>
                    Khám phá việc làm theo ngành
                </Title>
                <Row gutter={[16, 16]} style={{ marginTop: 20 }}>
                    {categories.map((cat) => (
                        <Col xs={12} sm={8} md={6} key={cat.name}>
                            <Card hoverable style={{ textAlign: "center", padding: 10 }}>
                                <div style={{ fontSize: 32 }}>{cat.icon}</div>
                                <div style={{ marginTop: 10, fontWeight: 500 }}>{cat.name}</div>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </div>

            <Divider />

            {/* Top Company */}
            <CompanyCard />

            <Divider />

            {/* Job nổi bật */}
            <JobCard />
        </div>
    );
};

export default HomePage;
