import { Col, Row } from 'antd';
import styles from 'styles/client.module.scss';
import CompanyCard from '@/components/client/card/company.card';
import PageHelmet from '@/components/share/page.helmet';

const ClientCompanyPage = (props: any) => {
    return (
        <>
            <PageHelmet title={"Top công ty IT"} />
            <div className={styles["container"]} style={{ marginTop: 20 }}>
                <Row gutter={[20, 20]}>
                    <Col span={24}>
                        <CompanyCard
                            showPagination={true}
                        />
                    </Col>
                </Row>
            </div>
        </>
    )
}

export default ClientCompanyPage;