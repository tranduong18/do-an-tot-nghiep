import React from "react";
import { Layout, Row, Col } from "antd";
import {
    LinkedinOutlined,
    FacebookOutlined,
    YoutubeOutlined,
} from "@ant-design/icons";
import styles from "@/styles/client.module.scss";

const { Footer } = Layout;

const FooterClient = () => {
    return (
        <Footer className={styles["footer-container"]}>
            <Row gutter={[32, 32]}>
                {/* Cột 1: Logo + Social */}
                <Col xs={24} md={6}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <img src="/logo.webp" alt="Logo" className={styles["footer-logo"]} />
                        <span style={{ fontSize: "20px", fontWeight: "bold", color: "#fff", textTransform: "uppercase" }}>
                            Jobhunter
                        </span>
                    </div>
                    <p className={styles["footer-slogan"]}>Ít nhưng mà chất</p>
                    <div className={styles["footer-social"]}>
                        <LinkedinOutlined />
                        <FacebookOutlined />
                        <YoutubeOutlined />
                    </div>
                </Col>

                {/* Cột 2 */}
                <Col xs={24} md={6}>
                    <h3>Về Chúng Tôi</h3>
                    <p>Trang Chủ</p>
                    <p>Giới thiệu</p>
                    <p>Dịch vụ cho ứng viên</p>
                    <p>Liên hệ</p>
                    <p>Việc làm IT</p>
                    <p>Câu hỏi thường gặp</p>
                </Col>

                {/* Cột 3 */}
                <Col xs={24} md={6}>
                    <h3>Chương trình</h3>
                    <p>Chuyện IT</p>
                    <p>Cuộc thi viết</p>
                    <p>Việc làm IT nổi bật</p>
                    <p>Khảo sát thường niên</p>
                </Col>

                {/* Cột 4 */}
                <Col xs={24} md={6}>
                    <h3>Liên hệ tuyển dụng</h3>
                    <p>📞 Hồ Chí Minh: (+84) 981 675 422</p>
                    <p>📞 Hà Nội: (+84) 981 675 422</p>
                    <p>✉️ Email: duongit1812003@gmail.com</p>
                    <p>📩 Gửi thông tin liên hệ</p>
                </Col>
            </Row>

            <div className={styles["footer-bottom"]}>
                Copyright © 2025 IT JobHunter | MST: 0981675422
            </div>
        </Footer>
    );
};

export default FooterClient;
