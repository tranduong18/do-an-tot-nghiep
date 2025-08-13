package vn.jobhunter.repository;

import java.time.Instant;
import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import vn.jobhunter.domain.Company;
import vn.jobhunter.domain.Job;
import vn.jobhunter.domain.Skill;

@Repository
public interface JobRepository extends JpaRepository<Job, Long>, JpaSpecificationExecutor<Job> {
    List<Job> findBySkillsIn(List<Skill> skills);

    @Query("SELECT DISTINCT j FROM Job j JOIN j.skills s " +
            "WHERE (s.id IN :skillIds OR j.location = :location) AND j.id <> :currentJobId")
    List<Job> findSimilarJobs(@Param("skillIds") List<Long> skillIds,
                              @Param("location") String location,
                              @Param("currentJobId") long currentJobId,
                              Pageable pageable);

    @Query("SELECT j FROM Job j WHERE j.company.id = :companyId")
    List<Job> findByCompanyId(@Param("companyId") long companyId);

    List<Job> findTop5ByNameContainingIgnoreCase(String name);

    @Query("""
        select j.company.id, count(j)
        from Job j
        where j.active = true
          and (j.endDate is null or j.endDate >= CURRENT_TIMESTAMP)
        group by j.company.id
    """)
    List<Object[]> countOpenJobsGroupByCompany();

    List<Job> findByCompany(Company company);

    @Query("SELECT COUNT(j) FROM Job j WHERE j.createdAt BETWEEN :start AND :end")
    long countCreatedBetween(@Param("start") Instant start, @Param("end") Instant end);

    // Đếm job đang mở (active + chưa hết hạn)
    @Query("""
    SELECT COUNT(j) FROM Job j
    WHERE j.active = true AND (j.endDate IS NULL OR j.endDate >= :now)
""")
    long countActive(@Param("now") Instant now);

    // Top công ty theo số job tạo trong tháng hiện tại
    @Query("""
    SELECT j.company.name, COUNT(j)
    FROM Job j
    WHERE j.createdAt BETWEEN :start AND :end
    GROUP BY j.company.name
    ORDER BY COUNT(j) DESC
""")
    List<Object[]> topCompaniesThisMonth(@Param("start") Instant start, @Param("end") Instant end);

    // Phân bổ chuyên môn job (đang mở) cho donut
    @Query("""
    SELECT j.specialization, COUNT(j)
    FROM Job j
    WHERE j.active = true AND (j.endDate IS NULL OR j.endDate >= :now)
    GROUP BY j.specialization
    ORDER BY COUNT(j) DESC
""")
    List<Object[]> specializationCountsActive(@Param("now") Instant now);



}
