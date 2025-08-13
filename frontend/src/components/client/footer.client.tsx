import { Layout, Row, Col, Typography, Space } from "antd";
import {
    LinkedinOutlined,
    FacebookOutlined,
    YoutubeOutlined,
    PhoneOutlined,
    MailOutlined,
    SendOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import styles from "@/styles/client.module.scss";

const { Footer } = Layout;
const { Text, Title } = Typography;

const FooterClient = () => {
    const year = new Date().getFullYear();

    return (
        <Footer className={styles["footer-container"]}>
            <div className={styles["footer-inner"]}>
                <Row gutter={[24, 24]}>
                    {/* Cột 1: Logo + Social */}
                    <Col xs={24} sm={12} md={8}>
                        <section aria-labelledby="footer-brand">
                            <div className={styles["footer-brand"]}>
                                <img src="/logo.webp" alt="IT JobHunter logo" className={styles["footer-logo"]} />
                                <span className={styles["footer-brand-text"]}>Jobhunter</span>
                            </div>
                            <Text className={styles["footer-slogan"]}>Ít nhưng mà chất</Text>

                            <Space size="middle" className={styles["footer-social"]} aria-label="Mạng xã hội">
                                <a
                                    href="https://www.linkedin.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="LinkedIn"
                                    className={styles["footer-social-link"]}
                                >
                                    <LinkedinOutlined />
                                </a>
                                <a
                                    href="https://www.facebook.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="Facebook"
                                    className={styles["footer-social-link"]}
                                >
                                    <FacebookOutlined />
                                </a>
                                <a
                                    href="https://www.youtube.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="YouTube"
                                    className={styles["footer-social-link"]}
                                >
                                    <YoutubeOutlined />
                                </a>
                            </Space>
                        </section>
                    </Col>

                    {/* Cột 2: Về chúng tôi */}
                    <Col xs={24} sm={12} md={8}>
                        <nav aria-labelledby="footer-about">
                            <Title level={4} id="footer-about" className={styles["footer-title"]}>
                                Về Chúng Tôi
                            </Title>
                            <ul className={styles["footer-list"]}>
                                <li><Link to="/" className={styles["footer-link"]}>Trang Chủ</Link></li>
                                <li><Link to="/job" className={styles["footer-link"]}>Việc làm IT</Link></li>
                                <li><Link to="/company" className={styles["footer-link"]}>Top công ty IT</Link></li>
                                <li><Link to="/blog" className={styles["footer-link"]}>Bài viết hay</Link></li>
                            </ul>
                        </nav>
                    </Col>

                    {/* Cột 3: Liên hệ */}
                    <Col xs={24} sm={12} md={8}>
                        <section aria-labelledby="footer-contact">
                            <Title level={4} id="footer-contact" className={styles["footer-title"]}>
                                Liên hệ tuyển dụng
                            </Title>
                            <ul className={styles["footer-list"]}>
                                <li>
                                    <a href="tel:+84981675422" className={styles["footer-link"]}>
                                        <PhoneOutlined /> Hồ Chí Minh: (+84) 981 675 422
                                    </a>
                                </li>
                                <li>
                                    <a href="tel:+84981675422" className={styles["footer-link"]}>
                                        <PhoneOutlined /> Hà Nội: (+84) 981 675 422
                                    </a>
                                </li>
                                <li>
                                    <a href="mailto:duongit1812003@gmail.com" className={styles["footer-link"]}>
                                        <MailOutlined /> Email: duongit1812003@gmail.com
                                    </a>
                                </li>
                            </ul>
                        </section>
                    </Col>
                </Row>

                <div className={styles["footer-bottom"]}>
                    <Text>Copyright © {year} IT JobHunter &nbsp;|&nbsp; MST: 0981675422</Text>
                </div>
            </div>
        </Footer>
    );
};

export default FooterClient;
