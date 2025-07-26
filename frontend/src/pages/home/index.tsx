import { Divider } from 'antd';
import styles from 'styles/client.module.scss';
import SearchClient from '@/components/client/search.client';
import JobCard from '@/components/client/card/job.card';
import CompanyCard from '@/components/client/card/company.card';
import PageHelmet from '@/components/share/page.helmet';

const HomePage = () => {
    return (
        <div className={`${styles["container"]} ${styles["home-section"]}`}>
            <PageHelmet
                title="Trang chủ"
                description="Tìm việc làm IT, công ty công nghệ và cơ hội nghề nghiệp tốt nhất tại JobHunter"
            />
            <div className="search-content" style={{ marginTop: 20 }}>
                <SearchClient />
            </div>
            <Divider />
            <CompanyCard />
            <div style={{ margin: 50 }}></div>
            <Divider />
            <JobCard />
        </div>
    )
}

export default HomePage;