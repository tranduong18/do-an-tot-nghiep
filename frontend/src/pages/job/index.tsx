import SearchClient from '@/components/client/search.client';
import { Col, Row } from 'antd';
import styles from 'styles/client.module.scss';
import JobCard from '@/components/client/card/job.card';

import PageHelmet from '@/components/share/page.helmet';
import JobIndexCard from '@/components/client/card/jobIndex.card';

const ClientJobPage = (props: any) => {
    return (
        <>
            <PageHelmet title={"Việc làm IT"} />
            <div className={styles["container"]} style={{ marginTop: 20 }}>
                <Row gutter={[20, 20]}>
                    <Col span={24}>
                        <SearchClient />
                    </Col>

                    <Col span={24}>
                        <JobIndexCard
                            showPagination={true}
                        />
                    </Col>
                </Row>
            </div>
        </>
    )
}

export default ClientJobPage;