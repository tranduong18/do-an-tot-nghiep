package vn.jobhunter.repository;

import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

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
}
